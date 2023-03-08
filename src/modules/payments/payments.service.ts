import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PAYMENT_REPOSITORY } from '../../core/constants';
import { gatewayOptions, Payment, statusOptions } from './payment.entity';
import { nanoid } from 'nanoid';
import { PinoLogger } from 'nestjs-pino';
import { PaymentCreateDTO } from './payment.dto';
import { MercadoPagoService } from '../../services/mercadopago.service';
import { StripeService } from '../../services/stripe.service';
import { UserTicketService } from '../users/userTicket.service';
import { UserTicket } from '../users/userTicket.entity';
import { Op } from 'sequelize';
import { Ticket } from '../tickets/ticket.entity';
import { MailgunService } from 'src/services/mailgun.service';
import { SUBJECTS } from 'src/services/constants/mailgunSubjects';
import { User } from '../users/user.entity';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly logger: PinoLogger,
    @Inject(PAYMENT_REPOSITORY) private paymentRepository: typeof Payment,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly stripeService: StripeService,
    private readonly mailgunService: MailgunService,
    @Inject(forwardRef(() => UserTicketService))
    private readonly userTicketService: UserTicketService,
  ) {
    this.logger.setContext(PaymentsService.name);
  }

  async create(payment: PaymentCreateDTO) {
    this.logger.info('Creating payment', payment);
    const newPayment = new Payment();
    newPayment.id = `pay_${nanoid()}`;
    newPayment.userId = payment.userId;
    newPayment.gateway = payment.gateway;
    newPayment.status = payment.status;
    newPayment.referenceGatewayId = payment.referenceGatewayId;
    newPayment.currency = payment.currency;
    const created = await newPayment.save();
    this.logger.info('payment created successfully', newPayment);
    return created;
  }

  async update(
    paymentId: string,
    payment: {
      referenceGatewayId?: string;
      status?: typeof statusOptions[number];
      userIdMercadoPago?: string;
    },
  ) {
    this.logger.assign({
      paymentId,
      payment,
    });
    this.logger.info('Attempting to update payment');
    const [numberOfAffectedRows, updatedPayments] =
      await this.paymentRepository.update(payment, {
        where: { id: paymentId },
        returning: true,
      });

    this.logger.info(`${numberOfAffectedRows} affected rows`);

    if (numberOfAffectedRows === 0) {
      this.logger.info('No payments were updated');
    } else if (numberOfAffectedRows > 1) {
      const message = `More than one payment updated. This should never happen!`;
      this.logger.error(message, updatedPayments);
      throw new Error(message);
    } else {
      this.logger.info('Updated payment');
    }
    return { numberOfAffectedRows, updatedPayments: updatedPayments[0] };
  }

  async getPaymentStatusFromPaymentProcessor(paymentId: string) {
    this.logger.assign({ paymentId });
    this.logger.info('Attempting to validate payment ID');
    const payment = await this.paymentRepository.findOne({
      where: {
        id: paymentId,
      },
    });
    if (!payment) {
      const message = `No payment exists for id, ${paymentId}`;
      this.logger.error(message);
      throw new Error(message);
    }
    this.logger.info('Payment found', { payment });
    //  "in_process" | "approved" | "cancelled" | "rejected"
    const status =
      payment.gateway === 'mercadopago'
        ? await this.mercadoPagoService.getMercadoPagoPaymentStatus(
            payment.referenceGatewayId,
          )
        : await this.stripeService.getStripePaymentStatus(
            payment.referenceGatewayId,
          );

    if (!status) {
      this.logger.error(`Status did not change`);
      return;
    }
    return status;
  }

  private async updatePaymentStatusOnlyIfDifferent(
    paymentId: string,
    newStatus: Payment['status'],
  ) {
    const currentPayment = await this.paymentRepository.findOne({
      where: {
        id: paymentId,
        status: {
          [Op.ne]: newStatus,
        },
      },
      include: [User],
    });

    if (currentPayment) {
      this.logger.info(
        `Updating payment from status ${currentPayment.status} to ${newStatus}`,
      );
      currentPayment.status = newStatus;
      currentPayment.validatedAt = new Date();
      await currentPayment.save();
      return currentPayment;
    }
    this.logger.info(`Payment did not need updating to status ${newStatus}`);
  }

  private async sendTicketConfirmationEmail(
    email: string,
    fullName: string | undefined,
    ticketsIds: { url: string; imageUrl: string }[],
  ) {
    const params: Record<string, any> = {};
    if (fullName) {
      params.name = fullName;
    }
    params.tickets = ticketsIds;
    await this.mailgunService.sendEmail(
      'ticket-confirmation',
      'TICKET_BOUGHT',
      email,
      params,
    );
  }

  private async updateAssociatedTicketsStatus(
    paymentId: string,
    paymentStatus: Payment['status'],
  ) {
    this.logger.info('Updating Associated Tickets Status');
    const userTickets = await this.userTicketService.ticketsByPaymentId(
      paymentId,
    );
    const userTicketsIds = userTickets.map((el) => el.id);
    let userTicketStatus: UserTicket['status'] = 'not_paid';
    if (paymentStatus === 'approved') {
      userTicketStatus = 'not_redeemed';
    } else if (paymentStatus === 'cancelled') {
      userTicketStatus = 'failed';
    } else if (paymentStatus === 'rejected') {
      userTicketStatus = 'failed';
    }
    const updatedUserTickets = await this.userTicketService.updateTicketsStatus(
      userTicketsIds,
      userTicketStatus,
    );
    this.logger.info(`Successfully updated ticket status`);
    return updatedUserTickets;
  }

  public async createPurchaseOrder({
    ticketsReference,
    ticketsToBuy,
    paymentProcessor,
    paymentId,
    user,
  }: {
    ticketsReference: Ticket[];
    ticketsToBuy: Record<string, number>;
    paymentProcessor: typeof gatewayOptions[number];
    paymentId: string;
    user: {
      id: string;
      email?: string;
    };
  }) {
    const items: Array<
      | {
          title: string;
          description: string;
          quantity: number;
          unit_price: number;
        }
      | {
          price: string;
          quantity: number;
        }
    > = [];

    // Creamos nuestro array de items para mandar al procesador de pagos
    for (const ticket of ticketsReference) {
      const quantity = ticketsToBuy[ticket.id];
      if (paymentProcessor === 'mercadopago') {
        items.push({
          title: ticket.name,
          description: ticket.description,
          quantity: quantity,
          unit_price: ticket.price,
        });
      } else {
        items.push({
          price: ticket.stripePriceId,
          quantity: quantity,
        });
      }
    }

    // Crear entrada en el procesador de pagos
    if (paymentProcessor === 'mercadopago') {
      return await this.mercadoPagoService.createPayment(
        {
          id: user.id,
          email: user.email,
        },
        items,
        paymentId,
      );
    }
    return await this.stripeService.createPayment(items, paymentId);
  }

  async deletePaymentsWithoutGatewayId() {
    this.logger.info(
      'Delete payments that do not have a gateway_id (means that could not be created in the payment processor)',
    );
    const [rows, payments] = await this.paymentRepository.update(
      {
        status: 'cancelled',
      },
      {
        where: {
          [Op.or]: [{ referenceGatewayId: 'NONE_YET' }],
        },
        returning: true,
      },
    );

    this.logger.info(`Deleted ${rows} payments`);
    return payments;
  }

  async syncAllExpiredPayments() {
    this.logger.info('Finding payments that should be synced');
    const dateToCheck = new Date(
      Date.now() - 40_000_000 /* 40 minutes in miliseconds */,
    );
    const payments = await this.paymentRepository.findAll({
      where: {
        [Op.or]: [
          {
            status: 'in_process',
            createdAt: {
              [Op.lt]: dateToCheck,
            },
          },
          {
            validatedAt: null,
            referenceGatewayId: {
              [Op.ne]: 'NONE_YET',
            },
          },
        ],
      },
    });

    this.logger.info(`Syncing ${payments.length} payments`);
    for (const payment of payments) {
      try {
        await this.syncPaymentStatusAndTicketsWithProviders(payment.id);
      } catch (e) {
        this.logger.assign({ error: e });
        this.logger.error(
          `Could not sync payment ${payment.id} status with provider`,
        );
      }
    }
  }

  async syncAllNonValidatedPayments() {
    this.logger.info('Finding payments that should be synced');
    const payments = await this.paymentRepository.findAll({
      where: {
        [Op.or]: [
          { status: 'in_process' },
          {
            validatedAt: null,
            referenceGatewayId: {
              [Op.ne]: 'NONE_YET',
            },
          },
        ],
      },
    });

    this.logger.info(`Syncing ${payments.length} payments`);
    this.logger.info(`Syncing ${payments.length} payments`);
    for (const payment of payments) {
      try {
        await this.syncPaymentStatusAndTicketsWithProviders(payment.id);
      } catch (e) {
        this.logger.assign({ error: e });
        this.logger.error(
          `Could not sync payment ${payment.id} status with provider`,
        );
      }
    }
  }

  async deleteExpiredPayments() {
    this.logger.info('Deleting payments that are expired');
    const dateToCheck = new Date(
      Date.now() - 40_000_000 /* 40 minutes in miliseconds */,
    );
    const [rows, payments] = await this.paymentRepository.update(
      { status: 'cancelled', validatedAt: new Date() },
      {
        where: {
          status: {
            [Op.in]: ['in_process', 'rejected'],
          },
          ['created_at' as 'createdAt']: {
            [Op.lt]: dateToCheck,
          },
        },
        returning: true,
      },
    );

    this.logger.info(`deleted ${rows} payments`);
    return payments;
  }

  async syncPaymentAndTicketsWIthPaymentStatus(
    paymentId: string,
    newStatus: Payment['status'],
  ) {
    this.logger.assign({ paymentId });
    // Estamos usando la data del proveedor de pagos como "origin de la verdad"
    // del estado de pago. Tenemos varias maneras de sincronizar data con ellos:
    // 1. Cron
    // 2. Webhook
    // 3. Callback del proceso de pago
    //
    // La idea de este check es que no actualizemos los valores de los tickets
    // del usuario innecesariamente. Para esto, validamos si el estado del pago
    // cambió en la BDD. El actualizar nuestros tickets, solo queremos hacerlo,
    // si es que el estado del pago local, tenia una discrepancia en con el
    // estado del pago en stripe o mercadolibre.
    //
    // Si el estado NO fue actualizado, quiere decir q ya estaba actualizado
    // antes, por lo tanto no deberiamos cambiar los estados de ningun ticket de
    // usuario.
    //
    // En caso de que SI fuese actualizado, deberiamos cambiar los estados de
    // los ticket asociados (onda de "no pagado" a "listo para redimirse").
    const updatedPayment = await this.updatePaymentStatusOnlyIfDifferent(
      paymentId,
      newStatus,
    );
    if (!updatedPayment) {
      this.logger.info(`Payment did not need syncing`);
      return;
    }
    this.logger.assign({ newStatus });
    this.logger.assign({ userId: updatedPayment.user.id });
    const updatedTickets = await this.updateAssociatedTicketsStatus(
      paymentId,
      newStatus,
    );
    if (updatedTickets.length > 0 && updatedPayment.status === 'approved') {
      if (!updatedPayment.user.email) {
        this.logger.error('No email present. This is a hardcore error!!');
        return;
      }
      const tickets = updatedTickets.map((updatedTicket) => {
        const ticketId = updatedTicket.id;
        const cleanedTicketId = ticketId.split('user_ticket_')[1];
        return {
          url: `${process.env.SITE_URL}/p/ticket/${cleanedTicketId}`,
          imageUrl: `${process.env.WORKER_IMAGE_API}/ticket/image/${ticketId}`,
        };
      });
      await this.sendTicketConfirmationEmail(
        updatedPayment.user.email,
        updatedPayment.user.name,
        tickets,
      );
    }
  }

  async syncPaymentStatusAndTicketsWithProviders(paymentId: string) {
    this.logger.assign({ paymentId });
    this.logger.info(`Attempting to sync payment with payment provider`);
    const status = await this.getPaymentStatusFromPaymentProcessor(paymentId);
    if (!status) {
      return;
    }
    await this.syncPaymentAndTicketsWIthPaymentStatus(paymentId, status);
    return status;
  }

  async findNotApprovedTickets() {
    this.logger.info('Finding tickets that might be deleted');
    const results = await this.paymentRepository.findAndCountAll({
      where: {
        status: {
          [Op.in]: ['approved'],
        },
      },
    });
    this.logger.info(`Found ${results.count} tickets`);
    return results.rows;
  }

  async findCancelledPaymentsTickets() {
    this.logger.info('Finding tickets that might be deleted');
    const results = await this.paymentRepository.findAndCountAll({
      where: {
        status: 'cancelled',
      },
      include: [
        {
          model: UserTicket,
          where: {
            status: {
              [Op.in]: ['created', 'not_paid', 'failed', 'reserved'],
            },
          },
        },
      ],
    });
    this.logger.info(`Found ${results.count} tickets`);
    return results;
  }
}
