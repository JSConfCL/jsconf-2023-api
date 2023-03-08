import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

class StripeWebhookObjectDTO {
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  payment_status: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  id: string;
}

class StripeWebhookDataDTO {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => StripeWebhookDataDTO)
  object: StripeWebhookObjectDTO;
}

export class StripeWebhookDTO {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => StripeWebhookDataDTO)
  data: StripeWebhookDataDTO;
}
