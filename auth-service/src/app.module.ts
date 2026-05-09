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
  CacheModule,
} from '@nestjs/cache-manager';

import {
  redisStore,
} from
  'cache-manager-ioredis-yet';

import {
  JwtModule,
} from '@nestjs/jwt';

import {
  PassportModule,
} from '@nestjs/passport';

import {
  ThrottlerModule,
  ThrottlerGuard,
} from '@nestjs/throttler';

import {
  APP_GUARD,
} from '@nestjs/core';

import {
  AuthModule,
} from './auth/auth.module';

import {
  User,
} from './users/entities/user.entity';

import {
  HealthController,
} from './health/health.controller';

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
        ) => {

          console.log(
            'CONNECTED DB:',
            config.get(
              'DB_NAME'
            )
          );

          return {

            type: 'postgres',

            host:
              config.get<string>(
                'DB_HOST'
              )!,

            port:
              Number(
                config.get(
                  'DB_PORT'
                )),

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

            entities: [
              User,
            ],

            synchronize:
              false,
          };
        },
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
                  'auth-consumer',
              },
            },
          }),
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

    TypeOrmModule.forFeature([
      User,
    ]),

    AuthModule,
  ],

  controllers: [
    HealthController,
  ],

  providers: [
    {
      provide:
        APP_GUARD,

      useClass:
        ThrottlerGuard,
    },
  ],
})
export class AppModule { }