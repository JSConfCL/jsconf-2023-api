import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PinoLogger } from 'nestjs-pino';
import {
  someMinutesIntoTheFuture,
  toISOStringWithTimezone,
} from 'src/modules/helpers';
import { MercadoPagoPaymentResponseType } from './types';
import { Logger } from '@nestjs/common';

const axiosInstance = axios.create({
  baseURL: process.env.MERCADO_PAGO_URL_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
  },
});

const logger = new Logger('Mercadopago Request');

axiosInstance.interceptors.request.use((request) => {
  const { headers, baseURL, data, url } = request;
  logger.log({
    message: 'Starting Axios Request',
    request: JSON.stringify({ headers, baseURL, data, url }),
  });
  return request;
});
axiosInstance.interceptors.response.use((response) => {
  const {
    headers,
    data,
    config: { url, method, baseURL, headers: configHeaders },
    status,
    statusText,
  } = response;

  logger.log({
    message: 'Starting Axios Response',
    response: JSON.stringify({
      headers,
      data,
      url,
      method,
      baseURL,
      configHeaders,
      status,
      statusText,
    }),
  });
  return response;
});

@Injectable()
export class MercadoPagoService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(MercadoPagoService.name);
  }

  public async getPaymentStatusFromPaymentProviderStatus(
    mercadoPagoStatus: MercadoPagoPaymentResponseType['status'],
  ) {
    if (mercadoPagoStatus === 'approved') {
      return 'approved';
    } else if (mercadoPagoStatus === 'rejected') {
      return 'rejected';
    } else if (mercadoPagoStatus === 'in_process') {
      return 'in_process';
    }
  }

  public async getMercadoPagoPaymentStatus(referenceGatewayId: string) {
    this.logger.assign({ referenceGatewayId });
    this.logger.info('Getting mercadopago-based payment status');
    const mercadoPagoPayment = await this.getPaymentStatusByExternalReference(
      referenceGatewayId,
    );
    if (!mercadoPagoPayment) {
      return;
    }
    return this.getPaymentStatusFromPaymentProviderStatus(
      mercadoPagoPayment.status,
    );
  }

  public async getMercadoPagoPaymentStatusByMercadopagoPaymentId(
    paymentId: string,
  ) {
    this.logger.assign({ paymentId });
    this.logger.info('Getting mercadopago-based payment status');
    const mercadoPagoPayment = await this.getPreferences(paymentId);
    if (!mercadoPagoPayment) {
      return;
    }
    return this.getPaymentStatusFromPaymentProviderStatus(
      mercadoPagoPayment.status,
    );
  }

  public async createPayment(
    user: { email?: string; id: string },
    items: Array<any>,
    paymentId: string,
  ) {
    const exirationDate = someMinutesIntoTheFuture(31);
    const body = {
      payer: {
        id: user.id,
        email: user.email,
      },
      items,
      back_urls: {
        failure: process.env.MERCADO_PAGO_FAILURE,
        pending: process.env.MERCADO_PAGO_PENDING,
        success: process.env.MERCADO_PAGO_SUCCESS,
      },
      // When set to TRUE, payments can only be approved or rejected. Otherwise
      // they can also result in_process.
      binary_mode: true,
      // En el caso de estar especificado tu comprador sera redirigido a tu
      // sitio inmediatamente después de la compra approved: The redirection
      // takes place only for approved payments. all: The redirection takes
      // place only for approved payments, forward compatibility only if we
      // change the default behavior
      auto_return: 'all',
      external_reference: paymentId,
      // El link expira en 31 minutos
      date_of_expiration: toISOStringWithTimezone(exirationDate),
      metadata: {
        payment_id: paymentId,
      },
    };
    this.logger.assign({
      body,
      user,
      items,
      paymentId,
    });
    this.logger.info('Creating payment for mercadopago');
    const payment = await axiosInstance.post<{
      id: string;
      init_point: string;
    }>('/checkout/preferences/', body);
    this.logger.info(payment);
    this.logger.info('Payment created successfully');
    return {
      id: payment.data.id,
      paymentUrl: payment.data.init_point,
    };
  }

  public async getPayment(mercadopagoPaymentId: string) {
    this.logger.assign({ mercadopagoPaymentId });
    this.logger.info('Getting payment for mercadopago');
    const payment = await axiosInstance.get<MercadoPagoPaymentResponseType>(
      `/v1/payments/${mercadopagoPaymentId}`,
    );
    this.logger.assign(payment);
    this.logger.info('Payment for mercadopago obtained');
    return payment.data;
  }

  public async getPreferences(mercadopagoId: string) {
    this.logger.assign({ mercadopagoId });
    this.logger.info('Getting payment for mercadopago');
    const payment = await axiosInstance.get<MercadoPagoPaymentResponseType>(
      `/checkout/preferences/${mercadopagoId}`,
    );
    this.logger.assign(payment);
    this.logger.info('Payment for mercadopago obtained');
    return payment.data;
  }

  public async getPaymentStatusByExternalReference(referenceId: string) {
    this.logger.assign({ referenceId });
    this.logger.info('Getting payment for mercadopago');
    const payment = await axiosInstance.get<{
      results?: MercadoPagoPaymentResponseType[];
    }>(`/v1/payments/search?external_reference=${referenceId}`);
    this.logger.assign(payment);
    if (payment.data?.results?.[0]) {
      this.logger.info('Payment for mercadopago obtained');
      return payment.data?.results?.[0];
    } else {
      this.logger.info('No payment for mercadopago obtained');
    }
  }
}
