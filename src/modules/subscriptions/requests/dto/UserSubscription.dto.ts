import { IsString, IsEmail, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UserSubscriptionDTO {
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsEmail()
  email: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  name?: string;
}
