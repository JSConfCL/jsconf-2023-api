import { IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UserLoginDTO {
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  id: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional({})
  name?: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  username: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  photo: string;
}
