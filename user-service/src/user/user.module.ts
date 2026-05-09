import { Module }
from '@nestjs/common';

import { TypeOrmModule }
from '@nestjs/typeorm';

import { UserController }
from './user.controller';

import { UserService }
from './user.service';

import { Profile }
from './entities/profile.entity';

@Module({
 imports: [
   TypeOrmModule.forFeature([
     Profile,
   ]),
 ],

 controllers: [
   UserController,
 ],

 providers: [
   UserService,
 ],
})
export class UserModule {}