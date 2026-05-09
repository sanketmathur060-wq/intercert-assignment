import {
 Body,
 Controller,
 Post,
 Get,
 Req,
 Headers,
 UseGuards,
} from '@nestjs/common';

import { AuthService }
from './auth.service';

import { RegisterDto }
from './dto/register.dto';

import { LoginDto }
from './dto/login.dto';

import { JwtAuthGuard }
from './guards/jwt-auth.guard';

import { ChangePasswordDto }
from './dto/change-password.dto';
@Controller('auth')
export class AuthController {

 constructor(
   private authService: AuthService,
 ) {}

 @Post('register')
 register(
   @Body() dto: RegisterDto,
 ) {
   return this.authService.register(dto);
 }



 @Post('login')
 login(
   @Body() dto: LoginDto,
 ) {
   return this.authService.login(dto);
 }
 @UseGuards(JwtAuthGuard)

@Post('change-password')

changePassword(
 @Req() req: any,

 @Body()
 dto: ChangePasswordDto,
) {

 return this.authService
 .changePassword(
   req.user.id,
   dto,
 );
}

@UseGuards(JwtAuthGuard)

@Post('logout')

logout(
 @Headers('authorization')
 authHeader: string,
) {

 const token =
 authHeader.replace(
   'Bearer ',
   '',
 );

 return this.authService.logout(
   token,
 );
}

 @UseGuards(JwtAuthGuard)

 @Get('profile')

 getProfile(
   @Req() req: any,
 ) {

   return {
     user: req.user,
   };
 }
}