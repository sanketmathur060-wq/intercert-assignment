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
    await NestFactory
      .create(
        AppModule,
      );

  // CORS
  app.enableCors({
    origin:
      '*',

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
console.log({
  broker: config.get('KAFKA_BROKER'),
  username: config.get('KAFKA_USERNAME'),
  passwordLength:
    config.get('KAFKA_PASSWORD')?.length,
});
  // KAFKA CONSUMER
  app.connectMicroservice<
  MicroserviceOptions
>({
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

      ssl: false,

      sasl:
        config.get(
          'KAFKA_USERNAME',
        ) &&
        config.get(
          'KAFKA_PASSWORD',
        )
          ? {
              mechanism:
                'plain',

              username:
                config.get<string>(
                  'KAFKA_USERNAME',
                )!,

              password:
                config.get<string>(
                  'KAFKA_PASSWORD',
                )!,
            }
          : undefined,
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
    port,
    '0.0.0.0',
  );

  console.log(
    `User Service Running on Port ${port}`,
  );
}

bootstrap();