import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import {
  RedisService,
} from '../../redis/redis.service';

@Injectable()
export class JwtStrategy
  extends PassportStrategy(
    Strategy,
  ) {

  constructor(
    private redisService:
      RedisService,
  ) {

    super({

      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration:
        false,

      secretOrKey:
        process.env
          .JWT_SECRET,

      passReqToCallback:
        true,
    });
  }

  async validate(
    req: any,
    payload: any,
  ) {

    const token =
      req.headers.authorization
        ?.replace(
          'Bearer ',
          '',
        );

    const isBlacklisted =
      await this.redisService.get(
        `blacklist-${token}`,
      );

    if (
      isBlacklisted
    ) {

      throw new UnauthorizedException(
        'Token expired. Please login again',
      );
    }

    return {

      id:
        payload.id,

      email:
        payload.email,
    };
  }
}