import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Authorization } from 'src/authorization/autorization.decorators';
import { AutorizationGuard } from 'src/authorization/autorization.guard';
import { UpdatePreferenceDTO } from '../preferences/dto/update-preference.dto';
import { User } from '../users/user.entity';
import { UserTicketService } from '../users/userTicket.service';
import { TicketsService } from './tickets.service';

@ApiBearerAuth()
@Authorization('*')
@Controller('tickets')
export class TicketsController {
  constructor(
    private ticketService: TicketsService,
    private userTicketsService: UserTicketService,
  ) {}

  @Get('/')
  async getTickets(@Res() response: Response) {
    /*
      Se obtinen los tickets disponibles para comprar
    */
    const availableTickets = await this.ticketService.getAllAvailableTickets();
    const parsed = availableTickets.map((availableTicket) => {
      return {
        description: availableTicket.description,
        id: availableTicket.id,
        name: availableTicket.name,
        price: availableTicket.price,
        priceUSD: availableTicket.priceUSD,
        quantity: availableTicket.quantity,
        season: availableTicket.season,
        status: availableTicket.status,
        type: availableTicket.type,
      };
    });
    response.send(parsed);
  }

  @UseGuards(AuthGuard('jwt'), AutorizationGuard)
  @Get('/:id')
  async getTicket(@Req() req: Request, @Param('id') id: string) {
    const user = req.user;
    if (!user) {
      throw new Error('No existing user!');
    }
    return await this.userTicketsService.getTicket(id, user.id);
  }

  @UseGuards(AuthGuard('jwt'), AutorizationGuard)
  @Get('/:id/info')
  async getTicketInfo(@Req() req: Request, @Param('id') id: string) {
    const user = req.user;
    if (!user) {
      throw new Error('No existing user!');
    }
    const availableTicket = await this.ticketService.getTicketInfo(id, user.id);
    return availableTicket;
  }

  @UseGuards(AuthGuard('jwt'), AutorizationGuard)
  @Post('/:id')
  async reserveTicket(@Req() req: Request, @Param('id') id: string) {
    const user = req.user;
    if (!user) {
      throw new Error('No existing user!');
    }
    return await this.ticketService.createFreeUserTicket(id, user.id);
  }

  @UseGuards(AuthGuard('jwt'), AutorizationGuard)
  @Put('/:id')
  async setTicketPreferences(
    @Req() req: Request,
    @Param('id') ticketId: string,
    @Body() body: UpdatePreferenceDTO,
  ) {
    const user = req.user as User;
    const userTicket = await this.userTicketsService.getTicket(
      ticketId,
      user.id,
    );
    if (user.id !== userTicket.owner.id) {
      throw new Error('error!');
    }

    return await this.userTicketsService.updateTicketPreferences(
      ticketId,
      user.id,
      body,
    );
  }

  @Get('/qr/info/:id')
  async getInfoForQrGeneration(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    /*
      Se obtinen los tickets disponibles para comprar
    */
    const ticketResponse =
      await this.ticketService.findOneByIdWithOwnerInformation(id);

    if (!ticketResponse) {
      throw new Error('error!');
    }

    response.send({
      ticketId: ticketResponse.id || '',
      status: ticketResponse.status || '',

      userId: ticketResponse.owner.id,
      userPhoto: ticketResponse.owner.photo || '',
      username: ticketResponse.owner.username || '',
      name: ticketResponse.owner.name || '',

      ticketName: ticketResponse.ticket.name,
      ticketDescription: ticketResponse.ticket.description,
      ticketType: ticketResponse.ticket.type,
      ticketSeason: ticketResponse.ticket.season,
    });
  }

  @Put('/burn/:id')
  @Authorization('volunteer')
  @UseGuards(AuthGuard('jwt'), AutorizationGuard)
  async burnTicket(@Param() id: string, @Res() response: Response) {
    const redeemedTicket = await this.userTicketsService.updateTicketsStatus(
      [id],
      'redeemed',
    );
    if (redeemedTicket.length === 0) {
      throw new Error(`Could not redeem ticket with id: ${id}`);
    }

    // TODO:
    // await sendValidatedEmail()
    response.send({
      updatedTicketId: id,
      status: 'redeemed',
    });
  }

  @Post('/gift/:id')
  @Authorization('*')
  @UseGuards(AuthGuard('jwt'), AutorizationGuard)
  async ticketShared(@Req() req: Request) {
  }
}
