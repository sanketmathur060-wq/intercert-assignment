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

const TOPICS = [
    'user-created',
    'login-events',
];

const RETRY_DELAY_MS = 10_000;
const MAX_RETRIES = 10;

@Injectable()
export class KafkaConsumerService
    implements
    OnModuleInit,
    OnModuleDestroy {

    private consumer: Consumer;
    private destroyed = false;

    constructor(
        private config: ConfigService,

        @InjectRepository(Profile)
        private profileRepo: Repository<Profile>,
    ) {

        const broker =
            this.config.get<string>('KAFKA_BROKER') ||
            'kafka-ms:9092';

        const username =
            this.config.get<string>('KAFKA_USERNAME') || '';

        const password =
            this.config.get<string>('KAFKA_PASSWORD') || '';

        // Enable SASL whenever a password is provided
        // (Railway resolves KAFKA_USERNAME to '', but SASL still works with empty user)
        const useSasl = password.length > 0;

        console.log({
            broker,
            username,
            passwordLength: password.length,
        });
        console.log('Kafka Broker:', broker);
        console.log('Using SASL:', useSasl);

        const kafka = new Kafka({
            clientId: 'user-service',
            brokers: [broker],
            ssl: false,
            sasl: useSasl
                ? { mechanism: 'plain', username, password }
                : undefined,
            retry: {
                initialRetryTime: 300,
                retries: 5,
            },
        });

        this.consumer = kafka.consumer({
            groupId: 'user-consumer',
            sessionTimeout: 30000,
            heartbeatInterval: 3000,
            rebalanceTimeout: 60000,
        });
    }

    async onModuleInit() {
        // Run connection in background — don't block app startup
        this.connectWithRetry();
    }

    private async connectWithRetry(attempt = 0) {

        if (this.destroyed) return;

        try {

            await this.consumer.connect();
            console.log('Kafka Consumer Connected');

            await this.consumer.subscribe({
                topics: TOPICS,
                fromBeginning: false,
            });

            await this.consumer.run({

                eachMessage: async ({ topic, message }) => {

                    const value = message.value?.toString();
                    if (!value) return;

                    const data = JSON.parse(value);

                    if (topic === 'login-events') {

                        console.log('LOGIN EVENT:', data);

                        fs.appendFileSync(
                            './login-events.log',
                            JSON.stringify(data) + '\n',
                        );
                    }

                    if (topic === 'user-created') {

                        console.log('USER CREATED EVENT:', data);

                        const user =
                            typeof data === 'string'
                                ? JSON.parse(data)
                                : data;

                        const existingProfile =
                            await this.profileRepo.findOne({
                                where: { userId: user.id },
                            });

                        if (existingProfile) return;

                        const profile = this.profileRepo.create({
                            userId: user.id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                        });

                        await this.profileRepo.save(profile);
                        console.log('PROFILE CREATED');
                    }
                },
            });

        } catch (error) {

            console.error(
                `Kafka Consumer Error (attempt ${attempt + 1}):`,
                error.message,
            );

            if (
                !this.destroyed &&
                attempt < MAX_RETRIES
            ) {
                console.log(
                    `Retrying Kafka connection in ${RETRY_DELAY_MS / 1000}s...`,
                );

                setTimeout(
                    () => this.connectWithRetry(attempt + 1),
                    RETRY_DELAY_MS,
                );
            } else {
                console.error(
                    'Kafka Consumer gave up after max retries.',
                );
            }
        }
    }

    async onModuleDestroy() {
        this.destroyed = true;
        await this.consumer.disconnect();
    }
}