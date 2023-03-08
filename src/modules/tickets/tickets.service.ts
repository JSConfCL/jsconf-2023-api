import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Ticket } from './ticket.entity';
import {
  TICKET_DEPENDENCIES_REPOSITORY,
  TICKET_REPOSITORY,
  USER_TICKET_REPOSITORY,
} from '../../core/constants';
import { PinoLogger } from 'nestjs-pino';
import { Op } from 'sequelize';
import { UserTicket } from '../users/userTicket.entity';
import { User } from '../users/user.entity';
import { TicketDependencies } from './ticketDependencies.entity';
import { nanoid } from 'nanoid';

@Injectable()
export class TicketsService {
  constructor(
    private readonly logger: PinoLogger,
    @Inject(TICKET_REPOSITORY) private readonly ticketRepository: typeof Ticket,
    @Inject(USER_TICKET_REPOSITORY)
    private readonly userTicketRepository: typeof UserTicket,
    @Inject(TICKET_DEPENDENCIES_REPOSITORY)
    private readonly ticketDependendices: typeof TicketDependencies,
  ) {
    this.logger.setContext(TicketsService.name);
  }

  async getTicketInfo(ticketId: string, userId: string) {
    const ticket = await this.findOneById(ticketId);
    if (!ticket) {
      throw new Error('no ticket');
    }

    const quantity = await this.numberOfAvailableTickets(ticketId);

    let canRedeem = false;
    try {
      await this.canRedeemFreeTicket(ticketId, userId);
      canRedeem = true;
    } catch (e) {
      console.error(e);
      this.logger.error((e as Error).message);
    }
    return {
      description: ticket.description,
      id: ticket.id,
      name: ticket.name,
      price: ticket.price,
      priceUSD: ticket.priceUSD,
      status: ticket.status,
      quantity,
      canRedeem,
      type: ticket.type,
      season: ticket.season,
    };
  }
  async getAllAvailableTickets() {
    this.logger.info('Finding available tickets');
    // Esta función calcula los tickets q podemos vender:
    // A la cantidad de "Posibles Tickets", le resta la cantidad de tickets "Vendidos o Reservados".
    // Pa un poquito más de seguridad, usa "GREATEST" de postgres, pa nunca devolver un numero negativo.
    const [{ count: userTickets }, tickets] = await Promise.all([
      this.userTicketRepository.findAndCountAll({
        attributes: ['ticketId'],
        group: ['ticketId'],
        where: {
          status: {
            [Op.notIn]: ['eliminated', 'created'],
          },
        },
      }),
      this.ticketRepository.findAll({
        where: {
          status: 'on_sale',
        },
      }),
    ]);
    const mappedUsedTickets: Record<string, number> = {};
    userTickets.forEach((userTicket) => {
      mappedUsedTickets[userTicket.ticketId as string] = userTicket.count;
    });
    const mappedTickets = tickets.map((ticket) => {
      let newQuantity = ticket.quantity;
      const userTickets = mappedUsedTickets[ticket.id];
      if (typeof userTickets === 'number') {
        newQuantity = Math.max(ticket.quantity - userTickets, 0);
      }
      return { ...(ticket as any).dataValues, quantity: newQuantity } as Ticket;
    });
    this.logger.info('Found tickets');
    return mappedTickets;
  }

  public async validateTickets(
    ticketsToBuy: Array<{ id: string; quantity: number }>,
  ) {
    this.logger.info('Revisando si hay tickets disponibles');
    const tickets = await this.getAllAvailableTickets();
    const availableTickets: Record<string, number> = {};
    tickets.forEach((ticket) => {
      availableTickets[ticket.id] = ticket.quantity;
      this.logger.info(
        `${ticket.quantity} - ${ticket.name} tickets disponibles`,
      );
    });

    // Revisamos si la cantidad de tickets que se quiere comprar, es menor a los
    // tickets disponibles
    const doWeHaveEnoughTickets = ticketsToBuy.every((ticket) => {
      if (!availableTickets[ticket.id]) {
        return false;
      }
      return availableTickets[ticket.id] >= ticket.quantity;
    });

    // Si no tenemos suficientes tickets. Explotamos 💥
    if (!doWeHaveEnoughTickets) {
      const message = `Not enough tickets to sell`;
      this.logger.error(message);
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    } else {
      this.logger.info(`We have enough tickets to sell`);
    }
  }

  async canRedeemFreeTicket(ticketId: string, userId: string) {
    // El ticket es un ticket gratis.
    // El usuario no tiene ya un ticket asociado
    // Quedan tickets disponibles para reservar?
    // Obtener las dependencias para un ticket
    //    El ticket que se quiere comprar cumple con las dependencias

    const ticket = await this.ticketRepository.findByPk(ticketId);
    // El ticket es un ticket gratis.
    if (!ticket) {
      throw new Error('There are no tickets with this ID');
    }
    if (ticket.price !== 0) {
      throw new Error('This ticket cannot be reserved');
    }
    const userTickets = await this.userTicketRepository.findAndCountAll({
      where: {
        ticketId,
        ownerId: userId,
        status: 'not_redeemed',
      },
    });
    // El usuario no tiene ya un ticket asociado
    if (userTickets.count > 0) {
      throw new Error('User already owns this ticket');
    }
    // Quedan tickets disponibles para reservar?
    const numberOfAvailableTickets = await this.numberOfAvailableTickets(
      ticketId,
    );
    if (numberOfAvailableTickets <= 0) {
      throw new Error('There are no more available tickets');
    }
    // Obtener las dependencias para un ticket
    const doesTicketMeetDependencyRequirements =
      await this.doesTicketMeetDependencyRequirements(ticketId, userId);
    if (!doesTicketMeetDependencyRequirements) {
      throw new Error('Dependencies are not met');
    }
    return true;
  }

  async createFreeUserTicket(ticketId: string, userId: string) {
    try {
      await this.canRedeemFreeTicket(ticketId, userId);
      const userTicket = new UserTicket();
      userTicket.id = `user_ticket_${nanoid()}`;
      userTicket.ownerId = userId;
      userTicket.burnedAt = null;
      userTicket.paymentId = null;
      userTicket.ticketId = ticketId;
      userTicket.status = 'not_redeemed';
      userTicket.preferences = undefined;
      const savedUserTicket = await userTicket.save();
      return savedUserTicket;
    } catch (e) {
      this.logger.error(e as Error);
      throw e;
    }
  }

  async numberOfAvailableTickets(ticketId: string) {
    const maximumTickets = await this.ticketRepository.findOne({
      where: {
        id: ticketId,
      },
    });
    const currentLiveTickets = await this.userTicketRepository.findAndCountAll({
      where: {
        ticketId,
        status: {
          [Op.in]: ['not_redeemed', 'redeemed', 'created', 'reserved'],
        },
      },
    });
    if (!maximumTickets) {
      throw new Error(`no ticket for id ${ticketId}`);
    }
    return maximumTickets.quantity - currentLiveTickets.count;
  }

  async doesTicketMeetDependencyRequirements(ticketId: string, userId: string) {
    this.logger.info('Revisando si el ticket cumple con sus dependencias');
    try {
      const ticketDependencies = await this.ticketDependendices.findAndCountAll(
        {
          where: {
            ticketId: {
              [Op.eq]: ticketId,
            },
          },
        },
      );
      if (ticketDependencies.count > 0) {
        // El ticket que se quiere comprar cumple con las dependencias.
        const dependencias = ticketDependencies.rows.map(
          (el) => el.requirementId,
        );
        this.logger.info('Dependencias del ticket:', { dependencias });
        const userTickets = await this.userTicketRepository.count({
          where: {
            ticketId: {
              [Op.in]: dependencias,
            },
            status: {
              [Op.in]: ['not_redeemed', 'redeemed'],
            },
            ownerId: userId,
          },
        });
        if (userTickets === 0) {
          // This means that the dependenceis are no met :(
          this.logger.info('No cumple con las dependencias');
          return false;
        }
      }
      this.logger.info('Si cumple con las dependencias');
      return true;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async findAllTickets(ids: string[]) {
    return await this.ticketRepository.findAndCountAll<Ticket>({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
  }

  async findOneById(id: string) {
    return await this.ticketRepository.findOne<Ticket>({
      where: { id },
    });
  }

  async findOneByIdWithOwnerInformation(id: string) {
    return await this.userTicketRepository.findOne({
      where: { id },
      include: [Ticket, User],
    });
  }
}
