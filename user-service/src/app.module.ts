import { Module }
  from '@nestjs/common';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  ClientsModule,
  Transport,
} from '@nestjs/microservices';

import {
  PassportModule,
} from '@nestjs/passport';

import {
  JwtModule,
} from '@nestjs/jwt';

import {
  ThrottlerModule,
} from '@nestjs/throttler';

import {
  CacheModule,
} from '@nestjs/cache-manager';

import {
  redisStore,
} from 'cache-manager-ioredis-yet';

import {
  ServeStaticModule,
} from '@nestjs/serve-static';

import {
  join,
} from 'path';

import {
  KafkaController,
} from './kafka/kafka.controller';

import {
  HealthController,
} from './health/health.controller';

import {
  UserModule,
} from './user/user.module';

import {
  Profile,
} from './user/entities/profile.entity';

import {
  JwtStrategy,
} from './auth/strategies/jwt.strategy';

import {
  RedisService,
} from './redis/redis.service';

@Module({
  imports: [

    // Serve uploaded images
    ServeStaticModule.forRoot({
      rootPath:
        join(
          __dirname,
          '..',
          'uploads',
        ),

      serveRoot:
        '/uploads',
    }),

    ConfigModule.forRoot({
      envFilePath:
        process.env
          .ENV_FILE ||
        '.env.dev',

      isGlobal:
        true,
    }),

    TypeOrmModule
      .forRootAsync({

        inject: [
          ConfigService,
        ],

        useFactory:
          (
            config:
              ConfigService,
          ) => {

            const dbHost =
              config.get<string>(
                'DB_HOST'
              );

            const isCloudDb =
              dbHost?.includes(
                'neon.tech'
              ) ||
              dbHost?.includes(
                'amazonaws.com'
              ) ||
              dbHost?.includes(
                'supabase.co'
              ) ||
              dbHost?.includes(
                'railway.app'
              );

            console.log(
              'CONNECTED DB:',
              config.get(
                'DB_NAME'
              )
            );

            console.log(
              'DB HOST:',
              dbHost
            );

            console.log(
              'IS CLOUD DB:',
              isCloudDb
            );

            return {

              type:
                'postgres',

              host:
                dbHost!,

              port:
                Number(
                  config.get(
                    'DB_PORT'
                  )
                ),

              username:
                config.get<string>(
                  'DB_USERNAME'
                )!,

              password:
                config.get<string>(
                  'DB_PASSWORD'
                )!,

              database:
                config.get<string>(
                  'DB_NAME'
                )!,

              // SSL for cloud DB
              ssl:
                isCloudDb
                  ? {
                      rejectUnauthorized:
                        false,
                    }
                  : false,

              entities: [
                Profile,
              ],

              synchronize:
                false,

              logging:
                false,
            };
          },
      }),

    // REDIS CACHE
CacheModule.registerAsync({
  isGlobal: true,

  inject: [ConfigService],

  useFactory: async (
    config: ConfigService,
  ) => {

    const isProduction =
      process.env.NODE_ENV ===
      'production';

    console.log(
      isProduction
        ? 'Using Railway Redis'
        : 'Using Local Redis',
    );

    return {

      store:
        await redisStore({

          host:
            isProduction
              ? config.get<string>(
                  'REDIS_HOST',
                )
              : config.get<string>(
                  'REDIS_HOST',
                ) || 'redis-ms',

          port:
            Number(
              config.get(
                'REDIS_PORT',
              ),
            ) || 6379,

          username:
            isProduction
              ? config.get<string>(
                  'REDIS_USERNAME',
                ) || 'default'
              : undefined,

          password:
            isProduction
              ? config.get<string>(
                  'REDIS_PASSWORD',
                )
              : undefined,

          maxRetriesPerRequest:
            3,

          lazyConnect:
            true,

          enableReadyCheck:
            false,
        }),

      ttl: 120,
    };
  },
}),

    ClientsModule.registerAsync([
  {
    name:
      'KAFKA_SERVICE',

    inject: [
      ConfigService,
    ],

    useFactory:
      (
        config:
          ConfigService,
      ) => {

        const broker =
          config.get<string>(
            'KAFKA_BROKER',
          ) ||
          'kafka-ms:9092';

        const username =
          config.get<string>(
            'KAFKA_USERNAME',
          ) || '';

        const password =
          config.get<string>(
            'KAFKA_PASSWORD',
          ) || '';

        const isRailway =
          !!username &&
          !!password;

        console.log({
          broker,
          username,
          passwordLength:
            password?.length,
        });

        return {

          transport:
            Transport.KAFKA,

          options: {

            client: {

              clientId:
                'user-service',

              brokers: [
                broker,
              ],

              ssl: false,

              sasl:
                isRailway
                  ? {
                      mechanism:
                        'plain',

                      username,
                      password,
                    }
                  : undefined,

              retry: {
                retries:
                  8,
              },
            },

            consumer: {

              groupId:
                'user-service-group',

              allowAutoTopicCreation:
                true,
            },

            subscribe: {
              fromBeginning:
                false,
            },

            producer: {

              allowAutoTopicCreation:
                true,
            },
          },
        };
      },
  },
]),

    PassportModule,

    JwtModule
      .registerAsync({
        inject: [
          ConfigService,
        ],

        useFactory:
          (
            config:
              ConfigService,
          ) => ({
            secret:
              config.get<string>(
                'JWT_SECRET'
              )!,

            signOptions: {
              expiresIn:
                '1d',
            },
          }),
      }),

    ThrottlerModule
      .forRoot([
        {
          ttl:
            60000,

          limit:
            5,
        },
      ]),

    TypeOrmModule
      .forFeature([
        Profile,
      ]),

    UserModule,
  ],

  controllers: [
    KafkaController,
    HealthController,
  ],

  providers: [
    JwtStrategy,
    RedisService,
  ],
})

export class AppModule {}