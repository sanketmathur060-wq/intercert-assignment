import {
 IsNotEmpty,
 Matches,
 MinLength,
} from 'class-validator';

export class ChangePasswordDto {

 @IsNotEmpty()
 oldPassword: string;

 @MinLength(8)

 @Matches(/[A-Z]/, {
   message:
   'Must contain uppercase letter',
 })

 @Matches(/[0-9]/, {
   message:
   'Must contain number',
 })

 newPassword: string;
}