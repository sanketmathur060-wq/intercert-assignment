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
  const kafkaBroker =
    config.get<string>(
      'KAFKA_BROKER',
    ) || 'kafka-ms:9092';

  const kafkaUsername =
    config.get<string>(
      'KAFKA_USERNAME',
    );

  const kafkaPassword =
    config.get<string>(
      'KAFKA_PASSWORD',
    );

  const usesSasl =
    !!kafkaUsername &&
    !!kafkaPassword;

  console.log(
    'Kafka Broker:',
    kafkaBroker,
  );

  console.log(
    'Using SASL:',
    usesSasl,
  );

  app.connectMicroservice
    <MicroserviceOptions>({
      transport:
        Transport.KAFKA,

      options: {

        client: {

          clientId:
            'user-service',

          brokers: [
            kafkaBroker,
          ],

          ssl: false,

          sasl: usesSasl
            ? {
              mechanism:
                'plain' as const,

              username:
                kafkaUsername!,

              password:
                kafkaPassword!,
            }
            : undefined,

          retry: {
            initialRetryTime:
              1000,

            retries: 8,
          },
        },

        consumer: {

          groupId:
            'user-consumer',
        },
      },
    });

  try {
    await app
      .startAllMicroservices();

    console.log(
      'Kafka Consumer Connected',
    );
  } catch (err) {
    console.error(
      'Kafka Consumer failed to connect — HTTP server will still start:',
      err.message,
    );
  }

  await app.listen(
    port,
    '0.0.0.0',
  );

  console.log(
    `User Service Running on Port ${port}`,
  );
}

bootstrap();