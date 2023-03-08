import { IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UserCreationDTO {
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  name: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional({})
  password?: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  username: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  providerId: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  provider: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  photo: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  email: string;
}
