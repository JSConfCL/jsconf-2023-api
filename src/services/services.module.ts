import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';
import { StripeService } from './stripe.service';
import { MailgunService } from './mailgun.service';

@Module({
  imports: [],
  providers: [MercadoPagoService, StripeService, MailgunService],
  controllers: [],
  exports: [MercadoPagoService, StripeService, MailgunService],
})
export class ServicesModule {}
