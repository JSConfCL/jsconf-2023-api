import { Controller, Post, Body, Res } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { MercadoPagoService } from '../../services/mercadopago.service';
import { PaymentsService } from '../payments/payments.service';
import { Response } from 'express';
import { MercadoPagoWebhookDTO } from './mercadopago.dto';
import { StripeWebhookDTO } from './stripe.dto';
import { StripeService } from '../../services/stripe.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly logger: PinoLogger,
    private mercadoPagoService: MercadoPagoService,
    private stripeService: StripeService,
    private paymentsService: PaymentsService,
  ) {
    this.logger.setContext(WebhooksController.name);
  }

  @Post('/mercadopago')
  async mercadopago(@Body() body: MercadoPagoWebhookDTO, @Res() res: Response) {
    this.logger.assign({ ...body.data });
    this.logger.info('Starting mercadopago webhook');
    this.logger.info('Getting payment from mercadopago service');
    const responseMercadoPago = await this.mercadoPagoService.getPayment(
      body.data.id.toString(),
    );
    this.logger.info('Mercadopago response', responseMercadoPago);
    const status =
      await this.mercadoPagoService.getPaymentStatusFromPaymentProviderStatus(
        responseMercadoPago.status,
      );
    if (!status) {
      throw new Error(`Could not find status`);
    }
    if (typeof responseMercadoPago.metadata.payment_id === 'string') {
      await this.paymentsService.syncPaymentAndTicketsWIthPaymentStatus(
        responseMercadoPago.metadata.payment_id,
        status,
      );
    } else {
      throw new Error(`Invalid payment id`);
    }
    res.send();
  }

  @Post('/stripe')
  async stripe(@Body() body: StripeWebhookDTO, @Res() res: Response) {
    this.logger.assign({ ...body.data });
    this.logger.info('Starting stripe webhook');

    const stripePayment = await this.stripeService.getPayment(
      body.data.object.id,
    );
    if (!stripePayment.client_reference_id) {
      throw new Error(`No payment ID associated to stripe transaction`);
    }
    await this.paymentsService.syncPaymentStatusAndTicketsWithProviders(
      stripePayment.client_reference_id,
    );
    this.logger.info('paymentsService udpated');
    res.send();
  }
}
