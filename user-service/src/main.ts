import {
 NestFactory,
} from '@nestjs/core';

import {
 MicroserviceOptions,
 Transport,
} from '@nestjs/microservices';

import {
 ConfigService,
} from '@nestjs/config';

import {
 AppModule,
} from './app.module';

async function bootstrap() {

 const app =
 await NestFactory.create(
 AppModule,
 );

 const config =
 app.get(
 ConfigService,
 );

 app.connectMicroservice
 <MicroserviceOptions>({
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
 });

 await app
 .startAllMicroservices();

 await app.listen(
   3001,
 );

 console.log(
   'User Service Running',
 );
}

bootstrap();