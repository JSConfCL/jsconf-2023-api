import { IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class PreferenceDTO {
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  id: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  value: string;
}
