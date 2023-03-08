import { IsString, IsInt } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { statusOptions, gatewayOptions } from './payment.entity';
export class PaymentCreateDTO {
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  userId: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  gateway: typeof gatewayOptions[number];

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  status: typeof statusOptions[number];

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  referenceGatewayId: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  currency: string;
}
