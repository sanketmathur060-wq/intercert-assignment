import {
 Module,
} from '@nestjs/common';

import {
 JwtModule,
} from '@nestjs/jwt';

import {
 PassportModule,
} from '@nestjs/passport';

import {
 TypeOrmModule,
} from '@nestjs/typeorm';

import {
 ClientsModule,
 Transport,
} from '@nestjs/microservices';

import {
 ConfigModule,
 ConfigService,
} from '@nestjs/config';

import {
 AuthController,
} from './auth.controller';

import {
 AuthService,
} from './auth.service';

import {
 JwtStrategy,
} from './strategies/jwt.strategy';

import {
 User,
} from '../users/entities/user.entity';

import {
 RedisService,
} from '../redis/redis.service';

@Module({
 imports: [

   TypeOrmModule.forFeature([
     User,
   ]),

   PassportModule,

   ClientsModule.registerAsync([
     {
       name:
       'KAFKA_SERVICE',

       imports: [
         ConfigModule,
       ],

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

   JwtModule.registerAsync({
     imports: [
       ConfigModule,
     ],

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
 ],

 controllers: [
   AuthController,
 ],

 providers: [
   AuthService,
   JwtStrategy,
   RedisService,
 ],

 exports: [
   JwtStrategy,
 ],
})
export class AuthModule {}