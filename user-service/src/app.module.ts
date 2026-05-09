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
} from
  'cache-manager-ioredis-yet';

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

    ConfigModule.forRoot({
  envFilePath:
    process.env.ENV_FILE
      || '.env.dev',

  isGlobal: true,
}),

    TypeOrmModule.forRootAsync({
      inject: [
        ConfigService,
      ],


      useFactory:
        (
          config:
            ConfigService,
        ) => ({

          type: 'postgres',

          host:
            config.get<string>(
              'DB_HOST',
            )!,

          port:
            Number(
              config.get(
                'DB_PORT',
              )),

          username:
            config.get<string>(
              'DB_USERNAME',
            )!,

          password:
            config.get<string>(
              'DB_PASSWORD',
            )!,

          database:
            config.get<string>(
              'DB_NAME',
            )!,

          entities: [
            Profile,
          ],

          synchronize:
            true,
        }),
    }),

    CacheModule.registerAsync({
      isGlobal: true,

      inject: [
        ConfigService,
      ],

      useFactory:
        async (
          config:
            ConfigService,
        ) => ({
          store:
            await redisStore({
              host:
                config.get<string>(
                  'REDIS_HOST',
                )!,

              port:
                Number(
                  config.get(
                    'REDIS_PORT',
                  )),
            }),

          ttl: 120,
        }),
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
          ) => ({

            transport:
              Transport.KAFKA,

            options: {
              client: {
                brokers: [
                  config.get<string>(
                    'KAFKA_BROKER',
                  )!,
                ],
              },

              consumer: {
                groupId:
                  'user-consumer',
              },
            },
          }),
      },
    ]),

    PassportModule,

    JwtModule.registerAsync({
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
              'JWT_SECRET',
            )!,

          signOptions: {
            expiresIn:
              '1d',
          },
        }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),
    TypeOrmModule.forFeature([
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
export class AppModule { }