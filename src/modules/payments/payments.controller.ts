import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import axios from 'axios';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { Logger } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import { User } from '../users/user.entity';
import { UserTicketService } from '../users/userTicket.service';
import { Payment } from './payment.entity';
import { PaymentsService } from './payments.service';
import { createDTO } from './requests/dto/create.dto';
import { Authorization } from 'src/authorization/autorization.decorators';
import { AutorizationGuard } from 'src/authorization/autorization.guard';

const axiosInstance = axios.create({
  baseURL: process.env.WORKER_IMAGE_API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
  },
});

const logger = new Logger('ImageWorker Request');
axiosInstance.interceptors.request.use((request) => {
  const { baseURL, url } = request;
  logger.log({
    message: 'Starting Axios Request',
    request: JSON.stringify({ baseURL, url }),
  });
  return request;
});

@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private ticketsService: TicketsService,
    private userTicketsService: UserTicketService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(PaymentsController.name);
  }

  @Authorization('*')
  @UseGuards(AuthGuard('jwt'), AutorizationGuard)
  @Post()
  async create(@Body() body: createDTO, @Req() req: Request) {
    const user = req.user as User;
    const gateway = body.gateway;
    const ids = body.tickets.map((el) => el.id);
    const ticketsToBuy: Record<string, number> = {};
    body.tickets.forEach((el) => {
      ticketsToBuy[el.id] = el.quantity;
    });
    const allTickets = await this.ticketsService.findAllTickets(ids);

    // Revisamos si las referencias de los tickets queremos vender existen en la BDD.
    if (allTickets.count !== body.tickets.length) {
      this.logger.error(
        'Not all type of tickets to buy were created in the database',
        {
          requestTicketIds: ids,
          databaseTicketIds: allTickets.rows.map((el) => el.id),
        },
      );
      throw new Error('Error finding tickets');
    }

    // Validamos si hay suficientes tickets para vender
    await this.ticketsService.validateTickets(body.tickets);

    // Creamos tickets "vacios"
    let createdTicketsIds: string[] = [];
    for (const ticket of body.tickets) {
      const result = await this.userTicketsService.createNewTickets({
        ticketId: ticket['id'],
        userId: user.id,
        quantity: ticket['quantity'],
      });

      createdTicketsIds = [
        ...createdTicketsIds,
        ...result.map((ticket) => ticket.id),
      ];
    }

    this.logger.assign({ createdTicketsIds });
    this.logger.info(
      `Creating worker images for ${createdTicketsIds.length} images`,
    );
    const workerRequests = createdTicketsIds.map((ticketId) =>
      axiosInstance.get(`/ticket/image/${ticketId}`),
    );
    await Promise.allSettled(workerRequests);

    // 🚨 En este punto tenemos tickets para usuarios creados. 🚨
    // La parte imporante, es que están en estado "creado" o (tecnicamente,
    // reservados). no son "redimibles" pero nos permite validar pa que otro
    // usuario no llegue a comprar tickets q ya esten en proceso de compra.
    //
    // Tenemos un worker que revisa a intervalors regulares, para liberar tickets que no
    // han sido comprados pasados X minutos

    // Crear "pago" en nuestra bdd
    const payment: Payment = await this.paymentsService.create({
      userId: user.id,
      gateway: gateway,
      status: 'in_process',
      currency: gateway === 'mercadopago' ? 'clp' : 'usd',
      referenceGatewayId: 'NONE_YET',
    });

    // updateamos nuestros tickets con el payment ID que creamos recien.
    // Ademas, cambian a `not_paid`
    await this.userTicketsService.addPaymentId(createdTicketsIds, payment.id);

    // Creamos el link de pago
    const { paymentUrl, id: referenceGatewayId } =
      await this.paymentsService.createPurchaseOrder({
        ticketsReference: allTickets.rows,
        ticketsToBuy,
        paymentProcessor: gateway,
        paymentId: payment.id,
        user: {
          id: user.id,
          email: user.email,
        },
      });

    // Updateamos nuestro Payment con el ID del pago creado en el procesador de pagos
    await this.paymentsService.update(payment.id, {
      referenceGatewayId,
    });
    // Devolvemos la URL de pagos.
    return {
      paymentUrl,
    };
  }

  @Get('/mercadopago')
  @Redirect(process.env.PAYMENT_REDIRECT_URL_ERROR, 303)
  async callbackMercadoPago(
    @Query('status') status: string,
    @Query('preference_id') preferenceId: string,
    @Query('external_reference') paymentId: string,
  ) {
    this.logger.assign({
      paymentProcessor: 'MercadoPago',
      status,
      preferenceId,
      paymentId,
    });
    this.logger.info(`Validating payment`);
    try {
      if (status) {
        await this.paymentsService.syncPaymentAndTicketsWIthPaymentStatus(
          paymentId,
          status as Payment['status'],
        );
        if (
          (status as Payment['status']) === 'rejected' ||
          (status as Payment['status']) === 'cancelled'
        ) {
          this.logger.error(`Status is not successful`);
          return { url: process.env.PAYMENT_REDIRECT_URL_ERROR };
        }
      } else {
        const savedStatus =
          await this.paymentsService.syncPaymentStatusAndTicketsWithProviders(
            paymentId,
          );
        if (savedStatus === 'rejected' || savedStatus === 'cancelled') {
          this.logger.error(`Status is not successful`);
          return { url: process.env.PAYMENT_REDIRECT_URL_ERROR };
        }
      }
      this.logger.info(`Payment validated successfully`);
      return { url: process.env.PAYMENT_REDIRECT_URL_SUCCESS };
    } catch (e) {
      this.logger.error(`Error Validating Payment`, e);
      return { url: process.env.PAYMENT_REDIRECT_URL_ERROR };
    }
  }

  @Get('/stripe')
  @Redirect()
  @Redirect(process.env.PAYMENT_REDIRECT_URL_ERROR, 303)
  async callbackStripe(@Query('paymentId') paymentId: string) {
    this.logger.assign({ paymentProcessor: 'Stripe', paymentId });
    this.logger.info(`Validating payment`);
    try {
      const savedStatus =
        await this.paymentsService.syncPaymentStatusAndTicketsWithProviders(
          paymentId,
        );
      if (savedStatus === 'rejected' || savedStatus === 'cancelled') {
        this.logger.error(`Status is not successful`);
        return { url: process.env.PAYMENT_REDIRECT_URL_ERROR };
      }
      this.logger.info(`Payment validated successfully`);
      return { url: process.env.PAYMENT_REDIRECT_URL_SUCCESS };
    } catch (e) {
      this.logger.error(`Error Validating Payment`, e);
      return { url: process.env.PAYMENT_REDIRECT_URL_ERROR };
    }
  }
}
