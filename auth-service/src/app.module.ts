import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : process.env.ENV_FILE || '.env.dev',
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    // DATABASE
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbHost = config.get<string>('DB_HOST');
        const isCloudDb =
          dbHost?.includes('neon.tech') ||
          dbHost?.includes('amazonaws.com') ||
          dbHost?.includes('supabase.co') ||
          dbHost?.includes('railway.app');

        return {
          type: 'postgres',
          host: dbHost!,
          port: Number(config.get('DB_PORT')),
          username: config.get<string>('DB_USERNAME')!,
          password: config.get<string>('DB_PASSWORD')!,
          database: config.get<string>('DB_NAME')!,
          ssl: isCloudDb ? { rejectUnauthorized: false } : false,
          entities: [User],
          synchronize: false,
          logging: false,
        };
      },
    }),

    // REDIS CACHE - FIXED
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          store: await redisStore({
            host: config.get<string>('REDIS_HOST'),
            port: Number(config.get('REDIS_PORT')),
            password: config.get<string>('REDIS_PASSWORD'),
            // Note: Intentionally omitting 'username' to prevent NOAUTH/WRONGPASS conflicts on Railway
          }),
          ttl: 120,
        };
      },
    }),

    // KAFKA - FIXED
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const kafkaClient: any = {
            brokers: [config.get<string>('KAFKA_BROKER')!],
            clientId: 'auth-service',
            // CRITICAL FIX: Must be false for *.railway.internal:9092
            ssl: false, 
          };

          if (config.get('KAFKA_USERNAME') && config.get('KAFKA_PASSWORD')) {
            kafkaClient.sasl = {
              mechanism: 'plain',
              username: config.get<string>('KAFKA_USERNAME')!,
              password: config.get<string>('KAFKA_PASSWORD')!,
            };
          }

          return {
            transport: Transport.KAFKA,
            options: {
              client: kafkaClient,
              consumer: {
                groupId: 'auth-service-group-v1',
                allowAutoTopicCreation: true,
              },
              producer: {
                allowAutoTopicCreation: true,
              },
            },
          };
        },
      },
    ]),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),

    PassportModule,

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET')!,
        signOptions: { expiresIn: '1d' },
      }),
    }),

    TypeOrmModule.forFeature([User]),
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}