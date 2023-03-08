import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';
import { Authorization } from 'src/authorization/autorization.decorators';
import { AutorizationGuard } from 'src/authorization/autorization.guard';
import { RedemptionService } from './redemption.service';

@ApiBearerAuth()
@Authorization('*')
@UseGuards(AuthGuard('jwt'), AutorizationGuard)
@Controller('redeem')
export class RedemptionController {
  constructor(
    private redemptionService: RedemptionService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RedemptionController.name);
  }

  @Authorization('volunteer')
  @Post('/:id')
  async redeem(
    @Param('id') id: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const userId = request?.user?.id;
    if (!userId) {
      throw new Error(`missing user ID`);
    }
    this.logger.assign({ id, userId });
    this.logger.info('starting redemption process for ticket: ', userId);
    const redemption = await this.redemptionService.updateRedemptionStatus({
      redeemerId: userId,
      newStatus: 'redeemed',
      redemptionId: id,
    });
    const wasRedeemed = Boolean(redemption);
    if (wasRedeemed) {
      this.logger.info('ticket: ', id, ' is redeemed');
    } else {
      this.logger.info('ticket: ', id, ' was not redeemed');
    }
    return response.send({
      redeemed: wasRedeemed,
    });
  }

  @Get('/ticket/:userTicketId')
  async getRedemptionStatusForTicket(
    @Param('userTicketId') userTicketId: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const userId = request?.user?.id;
    this.logger.assign({ userTicketId, userId });
    this.logger.info(
      `Getting what redemptions are available for id: ${userTicketId}`,
    );
    if (!userId) {
      throw new Error(`missing user ID`);
    }
    const redemptions = await this.redemptionService.getRedemptionsForTicket({
      userTicketId,
      redeemerId: userId,
    });
    response.send({
      redemptions,
    });
  }
}
