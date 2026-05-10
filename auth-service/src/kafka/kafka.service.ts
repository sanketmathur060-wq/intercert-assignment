import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  Kafka,
  Producer,
} from 'kafkajs';

@Injectable()
export class KafkaService
  implements
  OnModuleInit,
  OnModuleDestroy {

  private producer:
    Producer;

  constructor(
    private config:
      ConfigService,
  ) {

    const broker =
      this.config.get<string>(
        'KAFKA_BROKER',
      ) ||
      'kafka-ms:9092';

    const username =
      this.config.get<string>(
        'KAFKA_USERNAME',
      );

    const password =
      this.config.get<string>(
        'KAFKA_PASSWORD',
      );

    const isRailway =
      !!username &&
      !!password;

    const kafka =
      new Kafka({

        clientId:
          'auth-service',

        brokers: [
          broker,
        ],

        // Railway uses SASL_PLAINTEXT
        ssl: false,

        sasl:
          isRailway
            ? {
                mechanism:
                  'plain',

                username,

                password,
              }
            : undefined,

        retry: {
          retries: 8,
        },
      });

    this.producer =
      kafka.producer();

    console.log(
      'Kafka Broker:',
      broker,
    );

    console.log(
      'Using Railway Kafka:',
      isRailway,
    );
  }

  async onModuleInit() {

    try {

      await this.producer
        .connect();

      console.log(
        'Kafka Producer Connected',
      );

    } catch (error) {

      console.error(
        'Kafka Connection Failed:',
        error,
      );
    }
  }

  async emit(
    topic: string,
    message: any,
  ) {

    await this.producer.send({
      topic,

      messages: [
        {
          value:
            JSON.stringify(
              message,
            ),
        },
      ],
    });
  }

  async onModuleDestroy() {

    await this.producer
      .disconnect();
  }
}