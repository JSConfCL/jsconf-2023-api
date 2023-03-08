import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Op } from 'sequelize';
import {
  REDEMPTIONS_REPOSITORY,
  REDEMPTIONS_TYPES_REPOSITORY,
  USER_TICKET_REPOSITORY,
  REDEMPTIONS_TYPES_TICKETS_REPOSITORY,
} from 'src/core/constants';
import { UserTicket } from '../users/userTicket.entity';
import { Redemptions, RedemptionStatus } from './redemption.entity';
import { RedemptionTypes } from './redemptionType.entity';
import { RedemptionTypesTickets } from './redemptionTypesTickets.entity';

@Injectable()
export class RedemptionService {
  constructor(
    private readonly logger: PinoLogger,
    @Inject(USER_TICKET_REPOSITORY)
    private readonly userTicket: typeof UserTicket,
    @Inject(REDEMPTIONS_REPOSITORY)
    private readonly redemptionsRepository: typeof Redemptions,
    @Inject(REDEMPTIONS_TYPES_TICKETS_REPOSITORY)
    private readonly redemptionsTypesTicketsRepository: typeof RedemptionTypesTickets,
    @Inject(REDEMPTIONS_TYPES_REPOSITORY)
    private readonly redemptionTypesRepository: typeof RedemptionTypes,
  ) {
    this.logger.setContext(RedemptionService.name);
  }

  async createRedemption({
    redeemerId,
    userTicketId,
    redemptionTypeId,
  }: {
    redeemerId: string;
    userTicketId: string;
    redemptionTypeId: string;
  }) {
    this.logger.assign({
      redeemerId,
      userTicketId,
      redemptionTypeId,
    });
    this.logger.info('Initiating redemption process');
    const redemption = new Redemptions();
    redemption.redeemerId = redeemerId;
    redemption.userTicketId = userTicketId;
    // redemption.redemptionTypeId = redemptionTypeId;
    const savedRedemption = await redemption.save();
    this.logger.info(`Redemption created with id ${savedRedemption.id}`);
    return savedRedemption;
  }

  private async findRedemptionsForUserTickets(userTicketId: string) {
    this.logger.info(
      `Finding redemptions associated to user_ticket: ${userTicketId}`,
    );
    const userTicketRedemptions =
      await this.redemptionsRepository.findAndCountAll({
        where: {
          userTicketId,
        },
      });

    return userTicketRedemptions;
  }

  private async findRedemptionsForTicket(userTicketId: string) {
    this.logger.info(
      `Finding redemptions associated to the ticket associated to user_ticket: ${userTicketId}`,
    );

    const userTicket = await this.userTicket.findByPk(userTicketId);
    if (!userTicket) {
      throw new Error('no userticket associated to id');
    }
    const associatedRedemptionsToTicket =
      await this.redemptionsTypesTicketsRepository.findAndCountAll({
        where: {
          ticketId: userTicket.ticketId,
        },
        include: [
          {
            model: RedemptionTypes,
            required: true,
            duplicating: true,
          },
        ],
      });

    return associatedRedemptionsToTicket;
  }
  async getRedemptionsForTicket({
    userTicketId,
    redeemerId,
  }: {
    userTicketId: string;
    redeemerId: string;
  }) {
    this.logger.assign({ userTicketId, redeemerId });
    this.logger.info(`Querying for redemptions for id: ${userTicketId}`);
    const userTicketRedemptions = await this.findRedemptionsForUserTickets(
      userTicketId,
    );
    const redemptionsAssociatedToTicket = await this.findRedemptionsForTicket(
      userTicketId,
    );
    if (redemptionsAssociatedToTicket.count === 0) {
      throw new Error('No redemptions associated to ticket');
    }

    const redemptionTypeIdsAssociatedToUserTicketsSet = new Set(
      userTicketRedemptions.rows.map((el) => el.redemptionTypesTicketsId),
    );

    const idsOfRedemptionsThatWeNeedToAddToUserTickets =
      redemptionsAssociatedToTicket.rows
        .map((redemption) => redemption.id)
        .filter((id) => !redemptionTypeIdsAssociatedToUserTicketsSet.has(id));

    if (idsOfRedemptionsThatWeNeedToAddToUserTickets.length > 0) {
      const redemptions = idsOfRedemptionsThatWeNeedToAddToUserTickets.map(
        (redemptionTypeId) => ({
          userTicketId,
          redeemerId,
          status: 'not_redeemed',
          redemptionTypesTicketsId: redemptionTypeId,
        }),
      );
      await this.redemptionsRepository.bulkCreate(redemptions as Redemptions[]);
      this.logger.info(
        `Created ${redemptions.length} missing redemptions for id ${userTicketId}`,
      );
    }

    const userTicketRedemptions2 = await this.findRedemptionsForUserTickets(
      userTicketId,
    );

    if (userTicketRedemptions2.count === 0) {
      this.logger.error(
        `Could not find redemptions for ticket ${userTicketId}`,
      );
    } else {
      this.logger.info(
        `Found ${userTicketRedemptions2.count} redemptions associated to the ticket ${userTicketId}`,
      );
    }

    const redemptionTypesTicketsIds = userTicketRedemptions2.rows.map(
      (userTicketRedemption) => userTicketRedemption.redemptionTypesTicketsId,
    );
    const redemptionsTypesTickets =
      await this.redemptionsTypesTicketsRepository.findAndCountAll({
        where: {
          id: {
            [Op.in]: redemptionTypesTicketsIds,
          },
        },
        include: [
          {
            model: RedemptionTypes,
            required: true,
          },
        ],
      });
    const redemptionsTypesTicketsMap: Record<
      string,
      {
        id: string;
        name: string;
        description: string;
      }
    > = {};
    redemptionsTypesTickets.rows.forEach((redemptionsTypesTicket) => {
      redemptionsTypesTicketsMap[redemptionsTypesTicket.id] = {
        id: redemptionsTypesTicket.id,
        name: redemptionsTypesTicket.redemptionType.name,
        description: redemptionsTypesTicket.redemptionType.description,
      };
    });
    const userTicketRedemptionsFinal = userTicketRedemptions2.rows.map(
      (userTicketRedemptions) => {
        return {
          id: userTicketRedemptions.id,
          userTicketId: userTicketRedemptions.userTicketId,
          status: userTicketRedemptions.status,
          redemptionType:
            redemptionsTypesTicketsMap[
              userTicketRedemptions.redemptionTypesTicketsId
            ],
        };
      },
    );
    return userTicketRedemptionsFinal;
  }

  async updateRedemptionStatus({
    redemptionId,
    redeemerId,
    newStatus,
  }: {
    redemptionId: string;
    redeemerId: string;
    newStatus: RedemptionStatus;
  }) {
    this.logger.assign({
      redemptionId,
      redeemerId,
      newStatus,
    });
    const redemption = await this.redemptionsRepository.findByPk(redemptionId);
    if (!redemption) {
      this.logger.error(`Could not find redemption with the associated data`);
      return redemption;
    }
    if (redemption.status === newStatus) {
      this.logger.error(`Redemption's status was already: ${newStatus}`);
    } else {
      redemption.redeemerId = redeemerId;
      redemption.status = newStatus;
      await redemption.save();
      this.logger.error(
        `Redemption status updated from ${redemption?.status} to ${newStatus}`,
      );
    }
    return redemption;
  }
}
