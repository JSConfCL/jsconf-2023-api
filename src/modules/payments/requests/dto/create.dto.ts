import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsIn,
  ValidateNested,
  IsNumber,
  IsString,
  IsPositive,
} from 'class-validator';

export class TicketDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class createDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsIn(['mercadopago', 'stripe'])
  gateway: 'mercadopago' | 'stripe';

  @ApiProperty({
    type: TicketDTO,
  })
  @ValidateNested()
  @Type(() => TicketDTO)
  tickets: TicketDTO[];
}
