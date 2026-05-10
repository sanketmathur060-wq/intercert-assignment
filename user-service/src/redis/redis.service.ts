import {
  Injectable,
} from '@nestjs/common';

import Redis
  from 'ioredis';

@Injectable()
export class RedisService {

  private redis:
    Redis;

  constructor() {

    // Railway Production
    if (
      process.env.NODE_ENV ===
      'production' &&
      process.env.REDIS_URL
    ) {

      console.log(
        'Using Railway Redis',
      );

      this.redis =
        new Redis(
          process.env
            .REDIS_URL,
          {

            maxRetriesPerRequest:
              3,

            lazyConnect:
              true,

            enableReadyCheck:
              false,
          },
        );
    }

    // Local Docker
    else {

      console.log(
        'Using Local Redis',
      );

      this.redis =
        new Redis({

          host:
            process.env
              .REDIS_HOST ||
            'redis-ms',

          port:
            Number(
              process.env
                .REDIS_PORT,
            ) || 6379,

          username:
            process.env
              .REDIS_USERNAME ||
            undefined,

          password:
            process.env
              .REDIS_PASSWORD ||
            undefined,

          maxRetriesPerRequest:
            3,

          lazyConnect:
            true,

          enableReadyCheck:
            false,
        });
    }

    this.redis.on(
      'connect',
      () => {

        console.log(
          'Redis Connected',
        );
      },
    );

    this.redis.on(
      'error',
      (
        err,
      ) => {

        console.error(
          'Redis Error:',
          err.message,
        );
      },
    );
  }

  async set(
    key: string,
    value: string,
    ttl?: number,
  ) {

    if (ttl) {

      return this.redis.set(
        key,
        value,
        'EX',
        ttl,
      );
    }

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

  async del(
    key: string,
  ) {

    return this.redis.del(
      key,
    );
  }

  async disconnect() {

    await this.redis.quit();
  }
}