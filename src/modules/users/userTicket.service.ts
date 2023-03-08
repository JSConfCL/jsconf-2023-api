import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PinoLogger } from 'nestjs-pino';
import { Op } from 'sequelize';
import { USER_TICKET_REPOSITORY } from '../../core/constants';
import { PaymentsService } from '../payments/payments.service';
import { UpdatePreferenceDTO } from '../preferences/dto/update-preference.dto';
import { PreferencesService } from '../preferences/preferences.service';
import { Ticket } from '../tickets/ticket.entity';
import { User } from './user.entity';
import { UserTicket } from './userTicket.entity';

@Injectable()
export class UserTicketService {
  constructor(
    private readonly logger: PinoLogger,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
    @Inject(USER_TICKET_REPOSITORY)
    private readonly userTicketRepository: typeof UserTicket,
    private readonly preferencesService: PreferencesService,
  ) {
    this.logger.setContext(UserTicketService.name);
  }

  async createNewTickets(paymentTickets: {
    ticketId: string;
    quantity: number;
    userId: string;
  }) {
    this.logger.assign(paymentTickets);
    this.logger.info(`Creating ${paymentTickets.quantity} tickets object`);
    const ticketsToCreate: UserTicket[] = [];
    for (let index = 0; index < paymentTickets.quantity; index++) {
      const paymentTicket: Partial<UserTicket> = {
        id: `user_ticket_${nanoid()}`,
        ownerId: paymentTickets.userId,
        ticketId: paymentTickets.ticketId,
        status: 'reserved',
        burnedAt: null,
      };
      ticketsToCreate.push(paymentTicket as UserTicket);
    }
    this.logger.info(
      `Saving ${ticketsToCreate.length} tickets in the database`,
    );
    const results = await this.userTicketRepository.bulkCreate(ticketsToCreate);
    this.logger.info(
      `Created ${results.length} tickets`,
      results.map((ticket) => ticket.id),
    );
    return results;
  }

  async countUsedTickets(ticketId: string) {
    this.logger.assign({ ticketId });
    this.logger.info(`Encontrando cantidad de tickets no pagados`);
    const numberOfResults = await this.userTicketRepository.count({
      where: {
        [Op.and]: [
          {
            ticketId: {
              [Op.eq]: ticketId,
            },
          },
          {
            status: {
              [Op.notIn]: ['eliminated', 'created'],
            },
          },
        ],
      },
    });
    this.logger.info(`Encontrados ${numberOfResults} tickets usados`);
    return numberOfResults;
  }

  async addPaymentId(ticketIds: string[], newPaymentId: string) {
    this.logger.assign({ ticketIds, newPaymentId });
    this.logger.info(`Updating tickets payment ids`);
    const [numberOfResults] = await this.userTicketRepository.update(
      { paymentId: newPaymentId, status: 'not_paid' },
      {
        where: {
          id: {
            [Op.in]: ticketIds,
          },
        },
      },
    );
    this.logger.info(`Updated ${numberOfResults} tickets`);
  }

  async ticketsByPaymentId(paymentId: string) {
    this.logger.assign({ paymentId });
    this.logger.info(`Getting Tickets by PaymentId`);
    const { rows, count } = await this.userTicketRepository.findAndCountAll({
      where: {
        paymentId: {
          [Op.eq]: paymentId,
        },
      },
    });
    this.logger.info(`Found ${count} tickets`);

    return rows;
  }

  async getUserTicketsByUser(name: string, email: string, username: string) {
    this.logger.assign({ name, email });
    this.logger.info(`Getting UserTickets by name or email`);

    const userTickets = await this.userTicketRepository.findAll({
      include: [
        { model: User, as: 'owner', attributes: ['email', 'name', 'photo', 'username'] },
        { model: Ticket, attributes: ['id', 'description', 'name', 'type'] },
      ],
      where: {
        [Op.and]: [
          {
            status: {
              [Op.notIn]: ['eliminated', 'created'],
            },
          }, {
            [Op.or]: [
              {
                '$owner.email$': {
                  [Op.iLike]: `%${email}%`,
                },
              },
              {
                '$owner.name$': {
                  [Op.iLike]: `%${name}%`,
                },
              },
              {
                '$owner.username$': {
                  [Op.iLike]: `%${username}%`,
                },
              }
            ]
          }
        ]
      },
      attributes: ['id'],
      // logging: console.log,
    });

    return userTickets;
  }

  async getTicket(ticketId: string, userId: string) {
    this.logger.assign({ ticketId });
    this.logger.info(`Getting Ticket informaction`);
    const ticket = await this.userTicketRepository.findByPk(ticketId, {
      include: [User, Ticket],
    });
    if (!ticket) {
      const message = `No ticket found for id ${ticketId}`;
      this.logger.error(message);
      throw new Error(message);
    }
    const userTicketPreferences =
      await this.preferencesService.getUserTicketPreference(
        ticketId,
        ticket.owner.id,
      );

    return {
      id: ticket.id,
      owner: ticket.owner,
      status: ticket.status,
      preferences: userTicketPreferences,
    };
  }

  async updateTicketPreferences(
    ticketId: string,
    userId: string,
    body: UpdatePreferenceDTO,
  ) {
    this.logger.assign({ ticketId });
    this.logger.info(`Getting Ticket informaction`);
    const ticket = await this.userTicketRepository.findByPk(ticketId, {
      include: [User, Ticket],
    });

    if (!ticket) {
      const message = `No ticket found for id ${ticketId}`;
      this.logger.error(message);
      throw new Error(message);
    }
    await this.preferencesService.upsertUserTicketPreference(body, ticketId);
    const userTicketPreferences =
      await this.preferencesService.getUserTicketPreference(
        ticketId,
        ticket.owner.id,
      );

    return {
      id: ticket.id,
      owner: ticket.owner,
      status: ticket.status,
      preferences: userTicketPreferences,
    };
  }

  async updateTicketsStatus(ticketIds: string[], status: UserTicket['status']) {
    this.logger.assign({ ticketIds, status });
    this.logger.info(`Updating tickets status`);
    const [numberOfResults, userTickets] =
      await this.userTicketRepository.update(
        { status },
        {
          where: {
            id: {
              [Op.in]: ticketIds,
            },
          },
          returning: true,
        },
      );

    this.logger.info(`Updated ${numberOfResults} tickets`);
    return userTickets;
  }

  async deleteReservedTickets() {
    this.logger.info('Soft-deleting reserved and created tickets');
    const dateToCheck = new Date(
      Date.now() - 4_200_000 /* 40 minutes in miliseconds */,
    );
    const data = await this.userTicketRepository.update(
      { status: 'eliminated' },
      {
        where: {
          status: {
            [Op.in]: ['created', 'reserved'],
          },
          ['updated_at' as 'updatedAt']: {
            [Op.lt]: dateToCheck,
          },
        },
      },
    );
    this.logger.info(`Deleted ${data[0]} created or reserved tickets`);
  }

  async deleteFailedTickets() {
    this.logger.info('Soft-deleting failed tickets');
    const data = await this.userTicketRepository.update(
      { status: 'eliminated' },
      {
        where: {
          status: 'failed',
        },
      },
    );
    this.logger.info(`Deleted ${data[0]} eliminated tickets`);
  }

  async deleteNonPaidTickets() {
    const dateToCheck = new Date(
      Date.now() - 6_000_000 /* 60 minutes in miliseconds */,
    );
    this.logger.info('Soft-deleting non-paid tickets');
    await this.paymentsService.syncAllExpiredPayments();
    const data = await this.userTicketRepository.update(
      { status: 'eliminated' },
      {
        where: {
          status: {
            [Op.in]: ['not_paid'],
          },
          ['updated_at' as 'updatedAt']: {
            [Op.lt]: dateToCheck,
          },
        },
      },
    );
    this.logger.info(`Deleted ${data[0]} not_paid tickets`);
  }

  async deleteTicketsByPaymentIds(paymentIds: string[]) {
    this.logger.assign({ paymentIds });
    this.logger.info(
      `Soft-deleting tickets for ${paymentIds.length} ticket ids`,
    );
    const [rows] = await this.userTicketRepository.update(
      { status: 'eliminated' },
      {
        where: {
          ticketId: {
            [Op.in]: paymentIds,
          },
        },
      },
    );
    this.logger.info(`Deleted ${rows} tickets`);
  }

  async deleteTicketsWithCancelledPayments() {
    this.logger.info(`Delete Tickets With Cancelled Payments`);
    const cancelledPaymentsWithUserTickets =
      await this.paymentsService.findCancelledPaymentsTickets();

    if (cancelledPaymentsWithUserTickets.count === 0) {
      this.logger.info(`No cancelled payments`);
      return;
    }
    this.logger.assign({
      paymentIds: [
        ...cancelledPaymentsWithUserTickets.rows.map(
          (cancelledPaymentsWithUserTicket) =>
            cancelledPaymentsWithUserTicket.id,
        ),
      ],
    });
    const userTicketIds = new Set<string>();
    cancelledPaymentsWithUserTickets.rows.forEach(
      (cancelledPaymentsWithUserTicket) => {
        cancelledPaymentsWithUserTicket.userTickets.forEach((userTicket) => {
          userTicketIds.add(userTicket.id);
        });
      },
    );
    this.logger.assign({ userTicketIds: [...userTicketIds] });
    if (userTicketIds.size === 0) {
      this.logger.info(`No UserTickets linked to Cancelled payments`);
      return;
    }
    this.logger.info(
      `${userTicketIds.size} UserTickets linked to Cancelled payments, attempting to soft-delete`,
    );
    const [rows] = await this.userTicketRepository.update(
      { status: 'eliminated' },
      {
        where: {
          id: {
            [Op.in]: [...userTicketIds],
          },
        },
      },
    );
    this.logger.info(
      `Deleted ${rows} UserTickets linked to Cancelled payments`,
    );
    if (rows === 0) {
      this.logger.info(`No tickets needed`);
    }
    this.logger.info(`Deleted ${rows} tickets`);
  }
}
