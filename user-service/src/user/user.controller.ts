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

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  diskStorage,
} from 'multer';

import {
  extname,
  join,
} from 'path';

import * as fs from 'fs';

import {
  UserService,
} from './user.service';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {

  constructor(
    private userService:
      UserService,
  ) { }

  // GET PROFILE

  @UseGuards(
    JwtAuthGuard,
  )
  @Get(
    'profile',
  )
  getProfile(
    @Req() req: any,
  ) {

    return this.userService
      .getProfile(
        req.user,
      );
  }

  // UPDATE PROFILE

  @UseGuards(
    JwtAuthGuard,
  )
  @Put(
    'profile',
  )
  updateProfile(
    @Req() req: any,
    @Body() dto: any,
  ) {

    return this.userService
      .updateProfile(
        req.user,
        dto,
      );
  }

  // UPLOAD PROFILE PHOTO

  @UseGuards(
    JwtAuthGuard,
  )
  @Post(
    'upload-photo',
  )
  @UseInterceptors(
    FileInterceptor(
      'photo',
      {
        storage:
          diskStorage({

            destination:
              (
                req,
                file,
                callback,
              ) => {

                const uploadPath =
                  join(
                    process.cwd(),
                    'uploads',
                  );

                // Create folder if not exists
                if (
                  !fs.existsSync(
                    uploadPath,
                  )
                ) {

                  fs.mkdirSync(
                    uploadPath,
                    {
                      recursive:
                        true,
                    },
                  );
                }

                callback(
                  null,
                  uploadPath,
                );
              },

            filename:
              (
                req,
                file,
                callback,
              ) => {

                const uniqueName =
                  `${Date.now()}${extname(
                    file.originalname,
                  )}`;

                callback(
                  null,
                  uniqueName,
                );
              },
          }),
      },
    ),
  )

  uploadPhoto(
    @Req() req: any,

    @UploadedFile()
    file: any,
  ) {

    return this.userService
      .uploadPhoto(
        req.user,
        file.filename,
      );
  }
}