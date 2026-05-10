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
              .REDIS_HOST,

          port:
            Number(
              process.env
                .REDIS_PORT,
            ),

          username:
            process.env
              .REDIS_USERNAME ||
            'default',

          password:
            process.env
              .REDIS_PASSWORD,
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