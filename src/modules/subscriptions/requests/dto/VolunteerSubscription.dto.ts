import { IsString, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class VolunteerSubscriptionDTO {
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(255, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  email: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(200, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  name: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(200, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  lastName: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(1000, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  why: string;
}
