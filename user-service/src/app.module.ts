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

    CacheModule
      .registerAsync({
        isGlobal:
          true,

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
                    'REDIS_HOST'
                  )!,

                port:
                  Number(
                    config.get(
                      'REDIS_PORT'
                    )
                  ),
              }),

            ttl:
              120,
          }),
      }),

    ClientsModule
      .registerAsync([
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
                      'KAFKA_BROKER'
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