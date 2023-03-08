import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';

class MercadoPagoWebhookDataDTO {
  @IsNotEmpty()
  id: string;
}

export class MercadoPagoWebhookDTO {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => MercadoPagoWebhookDataDTO)
  data: MercadoPagoWebhookDataDTO;
}
