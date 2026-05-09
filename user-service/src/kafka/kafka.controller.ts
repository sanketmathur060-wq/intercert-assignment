import {
 Controller,
} from '@nestjs/common';

import {
 EventPattern,
 Payload,
} from '@nestjs/microservices';

import { InjectRepository }
from '@nestjs/typeorm';

import { Repository }
from 'typeorm';

import * as fs from 'fs';

import { Profile }
from '../user/entities/profile.entity';

@Controller()
export class KafkaController {

 constructor(

   @InjectRepository(Profile)
   private profileRepo:
     Repository<Profile>,
 ) {}

 @EventPattern('login-events')
 handleLoginEvent(
   @Payload() data: any,
 ) {

   console.log(
     'LOGIN EVENT:',
     data,
   );

   fs.appendFileSync(
     './login-events.log',
     JSON.stringify(data)
     + '\n',
   );
 }

 @EventPattern('user-created')

 async handleUserCreated(
   @Payload() data: any,
 ) {

   const user =
     typeof data === 'string'
       ? JSON.parse(data)
       : data;

   console.log(
     'USER CREATED EVENT:',
     user,
   );

   const existingProfile =
     await this.profileRepo.findOne({
       where: {
         userId: user.id,
       },
     });

   if (existingProfile) return;

   const profile =
     this.profileRepo.create({
       userId: user.id,
       name: user.name,
       email: user.email,
       phone: user.phone,
     });

   await this.profileRepo.save(
     profile,
   );

   console.log(
     'PROFILE CREATED',
   );
 }
}