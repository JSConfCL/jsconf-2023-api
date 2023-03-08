import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { someMinutesIntoTheFuture } from 'src/modules/helpers';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe;

  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(StripeService.name);
    this.stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY, {
      apiVersion: '2022-08-01',
    });
  }

  public async getPaymentStatusFromPaymentProviderStatus(
    stripeStatus: Stripe.Response<Stripe.Checkout.Session>['status'],
  ) {
    if (stripeStatus === 'complete') {
      return 'approved';
    } else if (stripeStatus === 'expired') {
      return 'cancelled';
    } else if (stripeStatus === 'open') {
      return 'in_process';
    }
  }

  public async getStripePaymentStatus(referenceId: string) {
    this.logger.assign({ referenceId });
    this.logger.info('Getting stripe-based payment status');
    const stripePayment = await this.getPayment(referenceId);
    if (!stripePayment) {
      return;
    }
    return this.getPaymentStatusFromPaymentProviderStatus(stripePayment.status);
  }

  public async createPayment(items: Array<any>, paymentId: string) {
    this.logger.assign({ items, paymentId });
    this.logger.info('Creating stripe payment');
    const exirationDate = someMinutesIntoTheFuture(31);
    const expirationDateInEpoch = Math.round(exirationDate.getTime() / 1000);
    const paymentLink = await this.stripe.checkout.sessions.create({
      // The URL to which Stripe should send customers when payment or setup is
      // complete. If you’d like to use information from the successful Checkout
      // Session on your page, read the guide on customizing your success page.
      // chttps://stripe.com/docs/payments/checkout/custom-success-page
      success_url: `${process.env.STRIPE_API_SUCCESS_URL}?paymentId=${paymentId}`,
      // The URL the customer will be directed to if they decide to cancel
      // payment and return to your website.
      cancel_url: `https://jsconf.cl/tickets`,
      // A list of items the customer is purchasing. Use this parameter to pass
      // one-time or recurring Prices.
      // For payment mode, there is a maximum of 100 line items, however it is
      // recommended to consolidate line items if there are more than a few dozen.
      line_items: items,
      // A unique string to reference the Checkout Session. This can be a
      // customer ID, a cart ID, or similar, and can be used to reconcile the
      // session with your internal systems.
      client_reference_id: paymentId,
      // The Epoch time in seconds at which the Checkout Session will expire. It
      // can be anywhere from 30 minutes to 24 hours after Checkout Session
      // creation. By default, this value is 24 hours from creation.
      // El link expira en 31 minutos
      expires_at: expirationDateInEpoch,
      mode: 'payment',
    });
    this.logger.assign({ paymentLink });
    this.logger.info('Stripe payment created successfully');

    return {
      id: paymentLink.id,
      paymentUrl: paymentLink.url,
    };
  }

  public async getPayment(stripeId: string) {
    this.logger.assign({ stripeId });
    this.logger.info('Getting payment for stripe');
    const checkoutSession = await this.stripe.checkout.sessions.retrieve(
      stripeId,
    );
    this.logger.info('Payment for stripe obtained', {
      payment: checkoutSession,
    });
    return checkoutSession;
  }
}
