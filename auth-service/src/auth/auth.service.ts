import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
  OnModuleInit,
  Optional,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import * as bcrypt
  from 'bcrypt';

import {
  JwtService,
} from '@nestjs/jwt';

import {
  ClientKafka,
} from '@nestjs/microservices';

import {
  User,
} from '../users/entities/user.entity';

import {
  RedisService,
} from '../redis/redis.service';

@Injectable()
export class AuthService
  implements OnModuleInit {

  constructor(

    @InjectRepository(User)
    private userRepo:
      Repository<User>,

    private redisService:
      RedisService,

    private jwtService:
      JwtService,

    @Optional()
    @Inject(
      'KAFKA_SERVICE',
    )
    private kafkaClient?:
      ClientKafka,
  ) { }

  async onModuleInit() {

    // Only connect Kafka if available
    if (
      this.kafkaClient
    ) {

      try {

        await this
          .kafkaClient
          .connect();

        console.log(
          'Kafka connected',
        );

      } catch (
      error
      ) {

        console.log(
          'Kafka unavailable',
        );
      }
    }
  }

  async register(
    dto: any,
  ) {

    const existingUser =
      await this
        .userRepo
        .findOne({
          where: {
            email:
              dto.email,
          },
        });

    if (
      existingUser
    ) {

      throw new BadRequestException(
        'Email already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        dto.password,
        10,
      );

    const user =
      this.userRepo
        .create({
          ...dto,
          password:
            hashedPassword,
        });

    const savedUsers =
      await this
        .userRepo
        .save(user);

    const savedUser =
      Array.isArray(
        savedUsers,
      )
        ? savedUsers[0]
        : savedUsers;

    // Direct HTTP call replacing Kafka
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
    try {
      fetch(`${userServiceUrl}/user/internal/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          phone: savedUser.phone,
        }),
      }).catch(e => console.log('Fetch error:', e.message));
      console.log('Requested profile creation via HTTP');
    } catch (e) {
      console.log('Failed to create profile via internal API:', e);
    }

    return {
      message:
        'User registered successfully',
    };
  }

  async login(
    dto: any,
  ) {

    const user =
      await this
        .userRepo
        .findOne({
          where: {
            email:
              dto.email,
          },
        });

    if (
      !user
    ) {

      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const isMatch =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (
      !isMatch
    ) {

      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const token =
      this.jwtService
        .sign({
          id:
            user.id,

          email:
            user.email,
        });

    // Safe Kafka emit
    this.kafkaClient
      ?.emit(
        'login-events',

        JSON.stringify({
          email:
            user.email,

          time:
            new Date(),
        }),
      );

    return {
      token,
    };
  }

  async changePassword(
    userId: number,
    dto: any,
  ) {

    const user =
      await this
        .userRepo
        .findOne({
          where: {
            id:
              userId,
          },
        });

    if (
      !user
    ) {

      throw new UnauthorizedException(
        'User not found',
      );
    }

    const isMatch =
      await bcrypt.compare(
        dto.oldPassword,
        user.password,
      );

    if (
      !isMatch
    ) {

      throw new UnauthorizedException(
        'Old password incorrect',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        dto.newPassword,
        10,
      );

    user.password =
      hashedPassword;

    await this
      .userRepo
      .save(user);

    return {
      message:
        'Password updated successfully',
    };
  }

  async logout(
    token: string,
  ) {

    await this
      .redisService
      .set(
        `blacklist-${token}`,
        'true',
      );

    console.log(
      'TOKEN BLACKLISTED',
    );

    return {
      message:
        'Logged out successfully',
    };
  }
}