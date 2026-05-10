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

async function
bootstrap() {

  const app =
    await NestFactory.create(
      AppModule,
    );

  app.enableCors({
    origin: '*',

    credentials:
      true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  });

  const config =
    app.get(
      ConfigService,
    );

  const port =
    Number(
      config.get(
        'PORT',
      ),
    ) || 3001;

  // KAFKA CONSUMER
  app.connectMicroservice
    <MicroserviceOptions>({
      transport:
        Transport.KAFKA,

      options: {

        client: {

          clientId:
            'user-service',

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

  console.log(
    'Kafka Consumer Connected',
  );

  await app.listen(
    port,
    '0.0.0.0',
  );

  console.log(
    `User Service Running on Port ${port}`,
  );
}

bootstrap();