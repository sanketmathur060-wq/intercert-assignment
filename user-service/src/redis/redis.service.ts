import { Injectable }
    from '@nestjs/common';

import Redis
    from 'ioredis';

@Injectable()
export class RedisService {

    private redis: Redis;

    constructor() {

        this.redis =
            new Redis({
                host:
                    process.env
                        .REDIS_HOST,

                port:
                    Number(
                        process.env
                            .REDIS_PORT,
                    ),
            });
    }

    async set(
        key: string,
        value: string,
    ) {

        return this.redis.set(
            key,
            value,
        );
    }

    async get(
        key: string,
    ) {

        return this.redis.get(
            key,
        );
    }
}