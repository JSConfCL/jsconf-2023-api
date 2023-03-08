import { IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdatePreferenceDTO {
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  foodPreference: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  shirtSize: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  shirtStyle: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  foodAllergy: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  pronouns: string;
}
