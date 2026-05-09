import {
 Injectable,
 NotFoundException,
} from '@nestjs/common';

import { InjectRepository }
from '@nestjs/typeorm';

import { Repository }
from 'typeorm';

import { Profile }
from './entities/profile.entity';

@Injectable()
export class UserService {

 constructor(

   @InjectRepository(Profile)
   private profileRepo:
     Repository<Profile>,
 ) {}

 async getProfile(user: any) {

   const profile =
     await this.profileRepo.findOne({
       where: {
         userId: user.id,
       },
     });

   if (!profile) {
     throw new NotFoundException(
       'Profile not found',
     );
   }

   return profile;
 }

 async updateProfile(
   user: any,
   dto: any,
 ) {

   const profile =
     await this.profileRepo.findOne({
       where: {
         userId: user.id,
       },
     });

   if (!profile) {
     throw new NotFoundException(
       'Profile not found',
     );
   }

   Object.assign(profile, dto);

   return this.profileRepo.save(
     profile,
   );
 }

 async uploadPhoto(
   user: any,
   filename: string,
 ) {

   const profile =
     await this.profileRepo.findOne({
       where: {
         userId: user.id,
       },
     });

  if (!profile) {
    throw new NotFoundException(
      'Profile not found',
    );
  }

  profile.photo = filename;

   return this.profileRepo.save(
     profile,
   );
 }
}