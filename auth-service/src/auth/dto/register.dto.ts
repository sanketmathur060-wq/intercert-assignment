import {
 IsEmail,
 IsNotEmpty,
 Matches,
 MinLength,
} from 'class-validator';

export class RegisterDto {

 @IsNotEmpty()
 name: string;

 @IsEmail()
 email: string;

 @MinLength(8)
 @Matches(/[A-Z]/, {
   message:
   'Password must contain uppercase letter',
 })
 @Matches(/[0-9]/, {
   message:
   'Password must contain number',
 })
 password: string;

 @IsNotEmpty()
 phone: string;
}