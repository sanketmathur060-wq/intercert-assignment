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
    Admin,
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

@Injectable()
export class KafkaConsumerService
    implements
    OnModuleInit,
    OnModuleDestroy {

    private consumer: Consumer;
    private admin: Admin;

    constructor(
        private config: ConfigService,

        @InjectRepository(Profile)
        private profileRepo: Repository<Profile>,
    ) {

        const broker =
            this.config.get<string>('KAFKA_BROKER') ||
            'kafka-ms:9092';

        const username =
            this.config.get<string>('KAFKA_USERNAME');

        const password =
            this.config.get<string>('KAFKA_PASSWORD');

        const isRailway =
            !!username && !!password;

        console.log({
            broker,
            username,
            passwordLength: password?.length,
        });

        const kafka = new Kafka({
            clientId: 'user-service',
            brokers: [broker],
            ssl: false,
            sasl: isRailway
                ? { mechanism: 'plain', username, password }
                : undefined,
            retry: { retries: 8 },
        });

        this.consumer = kafka.consumer({
            groupId: 'user-consumer',
            sessionTimeout: 30000,
            heartbeatInterval: 3000,
            rebalanceTimeout: 60000,
        });

        this.admin = kafka.admin();

        console.log('Kafka Broker:', broker);
        console.log('Using Railway Kafka:', isRailway);
    }

    async onModuleInit() {

        try {

            // Ensure topics exist before subscribing
            await this.admin.connect();

            const existingTopics =
                await this.admin.listTopics();

            const missing = TOPICS.filter(
                (t) => !existingTopics.includes(t),
            );

            if (missing.length > 0) {

                console.log(
                    'Creating Kafka topics:',
                    missing,
                );

                await this.admin.createTopics({
                    waitForLeaders: true,
                    topics: missing.map((topic) => ({
                        topic,
                        numPartitions: 1,
                        replicationFactor: 1,
                    })),
                });
            }

            await this.admin.disconnect();

            // Connect consumer and subscribe
            await this.consumer.connect();

            console.log('Kafka Consumer Connected');

            await this.consumer.subscribe({
                topics: TOPICS,
                fromBeginning: false,
            });

            await this.consumer.run({

                eachMessage: async ({
                    topic,
                    message,
                }) => {

                    const value =
                        message.value?.toString();

                    if (!value) return;

                    const data = JSON.parse(value);

                    // LOGIN EVENTS
                    if (topic === 'login-events') {

                        console.log('LOGIN EVENT:', data);

                        fs.appendFileSync(
                            './login-events.log',
                            JSON.stringify(data) + '\n',
                        );
                    }

                    // USER CREATED
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

                        const profile =
                            this.profileRepo.create({
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
                'Kafka Consumer Error:',
                error.message,
            );
        }
    }

    async onModuleDestroy() {

        await this.consumer.disconnect();
    }
}