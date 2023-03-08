import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { PaymentsService } from 'src/modules/payments/payments.service';
import { UsersService } from 'src/modules/users/users.service';
import { UserTicketService } from 'src/modules/users/userTicket.service';

@Injectable()
export class AdminService {
  constructor(
    private userTicketsService: UserTicketService,
    private paymentsService: PaymentsService,
    private usersService: UsersService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AdminService.name);
  }
  async validate() {
    this.logger.info('Deleting Payments Without GatewayId');
    let DeletedPaymentIds: string[] = [];
    const paymentsWithouGatewaytId =
      await this.paymentsService.deletePaymentsWithoutGatewayId();
    DeletedPaymentIds = [
      ...DeletedPaymentIds,
      ...paymentsWithouGatewaytId.map((payment) => payment.id),
    ];

    this.logger.info('Try to sync all non-invalidated payments');
    await this.paymentsService.syncAllNonValidatedPayments();

    this.logger.info('Deleting expired payments');
    const expiredPayments = await this.paymentsService.deleteExpiredPayments();

    DeletedPaymentIds = [
      ...DeletedPaymentIds,
      ...expiredPayments.map((payment) => payment.id),
    ];

    this.logger.info('Deleting reserved tickets');
    await this.userTicketsService.deleteReservedTickets();

    this.logger.info('Deleting failed tickets');
    await this.userTicketsService.deleteFailedTickets();

    this.logger.info('Deleting all other');
    await this.userTicketsService.deleteNonPaidTickets();

    this.logger.info('Deleting tickets based on payments ids');
    await this.userTicketsService.deleteTicketsByPaymentIds(DeletedPaymentIds);

    this.logger.info('Deleting tickets based on payments ids');
    await this.userTicketsService.deleteTicketsWithCancelledPayments();
  }

  async isTheUserAVolunteerOrAnAdmin(username: string) {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new Error('no user');
    }
    if (user.role !== 'admin' && user.role !== 'volunteer') {
      throw new Error('no permissions');
    }
    return true;
  }
}
