import {
  ValidationPipe,
} from '@nestjs/common';

import {
  NestFactory,
} from '@nestjs/core';

import {
  ConfigService,
} from '@nestjs/config';

import {
  AppModule,
} from './app.module';

async function
  bootstrap() {

  const app =
    await NestFactory
      .create(
        AppModule,
      );

  const config =
    app.get(
      ConfigService,
    );

  const port =
    Number(
      config.get(
        'PORT',
      )
    ) || 3000;

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({

      whitelist:
        true,

      forbidNonWhitelisted:
        true,

      transform:
        true,
    }),
  );

  // CORS
  app.enableCors({
    origin: '*',
  });

  await app.listen(
    port,
    '0.0.0.0',
  );

  console.log(
    `Auth Service Running on Port ${port}`
  );
}

bootstrap();