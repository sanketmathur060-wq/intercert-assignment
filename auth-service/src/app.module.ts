import {
  Module,
} from '@nestjs/common';

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
} from 'cache-manager-ioredis-yet';

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
        process.env.NODE_ENV ===
          'production'
          ? undefined
          : process.env
            .ENV_FILE ||
          '.env.dev',

      isGlobal: true,

      ignoreEnvFile:
        process.env.NODE_ENV ===
        'production',
    }),

    // DATABASE
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
                'DB_HOST',
              );

            const isCloudDb =
              dbHost?.includes(
                'neon.tech',
              ) ||
              dbHost?.includes(
                'amazonaws.com',
              ) ||
              dbHost?.includes(
                'supabase.co',
              ) ||
              dbHost?.includes(
                'railway.app',
              );

            console.log(
              'CONNECTED DB:',
              config.get(
                'DB_NAME',
              ),
            );

            console.log(
              'DB HOST:',
              dbHost,
            );

            console.log(
              'IS CLOUD DB:',
              isCloudDb,
            );

            return {

              type:
                'postgres',

              host:
                dbHost!,

              port:
                Number(
                  config.get(
                    'DB_PORT',
                  ),
                ),

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

              ssl:
                isCloudDb
                  ? {
                    rejectUnauthorized:
                      false,
                  }
                  : false,

              entities: [
                User,
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

    // KAFKA
    // KAFKA
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',

        inject: [ConfigService],

        useFactory: (
          config: ConfigService,
        ) => {

          const isProduction =
            process.env.NODE_ENV ===
            'production';

          const broker =
            config.get<string>(
              'KAFKA_BROKER',
            ) ||
            'kafka-ms:9092';

          const username =
            config.get<string>(
              'KAFKA_USERNAME',
            );

          const password =
            config.get<string>(
              'KAFKA_PASSWORD',
            );

          const kafkaClient: any = {

            clientId:
              'auth-service',

            brokers: [
              broker,
            ],

            retry: {
              retries: 10,
            },

            connectionTimeout:
              10000,

            authenticationTimeout:
              10000,
          };

          // Railway Kafka
          if (
            isProduction &&
            username &&
            password
          ) {

            // Railway uses
            // SASL_PLAINTEXT
            kafkaClient.ssl =
              false;

            kafkaClient.sasl = {
              mechanism:
                'plain',

              username,
              password,
            };
          }

          console.log(
            'Kafka Config:',
            {
              broker,
              ssl:
                kafkaClient.ssl,
              sasl:
                !!kafkaClient.sasl,
            },
          );

          return {

            transport:
              Transport.KAFKA,

            options: {

              client:
                kafkaClient,

              // ONLY PRODUCER
              // auth-service should
              // not consume
              producer: {
                allowAutoTopicCreation:
                  true,
              },
            },
          };
        },
      },
    ]),

    ThrottlerModule
      .forRoot([
        {
          ttl:
            60000,

          limit:
            5,
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
                'JWT_SECRET',
              )!,

            signOptions: {
              expiresIn:
                '1d',
            },
          }),
      }),

    TypeOrmModule
      .forFeature([
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