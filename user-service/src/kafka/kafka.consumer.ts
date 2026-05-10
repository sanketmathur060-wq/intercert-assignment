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
    Consumer,
} from 'kafkajs';

import {
    Repository,
} from 'typeorm';

import {
    InjectRepository,
} from '@nestjs/typeorm';

import * as fs from 'fs';

import {
    Profile,
} from '../user/entities/profile.entity';

@Injectable()
export class KafkaConsumerService
    implements
    OnModuleInit,
    OnModuleDestroy {

    private consumer:
        Consumer;

    constructor(
        private config:
            ConfigService,

        @InjectRepository(Profile)
        private profileRepo:
            Repository<Profile>,
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

        console.log({
            broker,
            username,
            passwordLength:
                password?.length,
        });

        const kafka =
            new Kafka({

                clientId:
                    'user-service',

                brokers: [
                    broker,
                ],

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

        this.consumer =
            kafka.consumer({
                groupId:
                    'user-consumer',
            });

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

            await this.consumer
                .connect();

            console.log(
                'Kafka Consumer Connected',
            );

            await this.consumer.subscribe({
                topic:
                    'user-created',

                fromBeginning:
                    false,
            });

            await this.consumer.subscribe({
                topic:
                    'login-events',

                fromBeginning:
                    false,
            });

            await this.consumer.run({

                eachMessage:
                    async ({
                        topic,
                        message,
                    }) => {

                        const value =
                            message.value?.toString();

                        if (!value)
                            return;

                        const data =
                            JSON.parse(
                                value,
                            );

                        // LOGIN EVENTS
                        if (
                            topic ===
                            'login-events'
                        ) {

                            console.log(
                                'LOGIN EVENT:',
                                data,
                            );

                            fs.appendFileSync(
                                './login-events.log',
                                JSON.stringify(
                                    data,
                                ) + '\n',
                            );
                        }

                        // USER CREATED
                        if (
                            topic ===
                            'user-created'
                        ) {

                            console.log(
                                'USER CREATED EVENT:',
                                data,
                            );

                            const user =
                                typeof data === 'string'
                                    ? JSON.parse(data)
                                    : data;

                            const existingProfile =
                                await this.profileRepo.findOne({
                                    where: {
                                        userId:
                                            user.id,
                                    },
                                });

                            if (
                                existingProfile
                            ) {
                                return;
                            }

                            const profile =
                                this.profileRepo.create({
                                    userId:
                                        user.id,

                                    name:
                                        user.name,

                                    email:
                                        user.email,

                                    phone:
                                        user.phone,
                                });

                            await this.profileRepo.save(
                                profile,
                            );

                            console.log(
                                'PROFILE CREATED',
                            );
                        }
                    },
            });

        } catch (
        error
        ) {

            console.error(
                'Kafka Consumer Connection Error:',
                error.message,
            );
        }
    }

    async onModuleDestroy() {

        await this.consumer
            .disconnect();
    }
}