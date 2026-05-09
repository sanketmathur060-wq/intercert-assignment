import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ThrottlerGuard }
from '@nestjs/throttler';

import { APP_GUARD }
from '@nestjs/core';

async function bootstrap() {

 const app =
   await NestFactory.create(AppModule);

 app.useGlobalPipes(
   new ValidationPipe(),
 );

 app.enableCors();

 await app.listen(3000);
}
bootstrap();