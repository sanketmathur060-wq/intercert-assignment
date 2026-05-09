import {
 Controller,
 Get,
 Put,
 Req,
 Body,
 UseGuards,
 Post,
 UploadedFile,
 UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor }
from '@nestjs/platform-express';

import { diskStorage }
from 'multer';

import { extname }
from 'path';

import { UserService }
from './user.service';


import { JwtAuthGuard }
from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {

 constructor(
   private userService: UserService,
 ) {}

 @UseGuards(JwtAuthGuard)

 @Get('profile')

 getProfile(
   @Req() req: any,
 ) {

   return this.userService.getProfile(
     req.user,
   );
 }

 @UseGuards(JwtAuthGuard)

 @Put('profile')

 updateProfile(
   @Req() req: any,
   @Body() dto: any,
 ) {

   return this.userService.updateProfile(
     req.user,
     dto,
   );
 }

 @UseGuards(JwtAuthGuard)

 @Post('upload-photo')

 @UseInterceptors(
   FileInterceptor('photo', {

     storage: diskStorage({

       destination:
         './uploads',

       filename: (
         req,
         file,
         callback,
       ) => {

         const uniqueName =
           Date.now() +
           extname(
             file.originalname,
           );

         callback(
           null,
           uniqueName,
         );
       },
     }),
   }),
 )

 uploadPhoto(
   @Req() req: any,

   @UploadedFile()
   file: any,
 ) {

   return this.userService.uploadPhoto(
     req.user,
     file.filename,
   );
 }
}