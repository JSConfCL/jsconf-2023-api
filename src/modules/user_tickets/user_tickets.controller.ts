import { Get, Req, Res, Controller, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AutorizationGuard } from 'src/authorization/autorization.guard';
import { Authorization } from 'src/authorization/autorization.decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserTicketService } from '../users/userTicket.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), AutorizationGuard)
@Controller('user-tickets')
export class UserTicketsController {
  constructor(private userTicketsService: UserTicketService) {}

  @Authorization('volunteer')
  @Get('/')
  async getTickets(
    @Req() req: Request,
    @Res() response: Response,
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('username') username: string,
  ) {
    const foundUserTickets =
      await this.userTicketsService.getUserTicketsByUser(name, email, username);

    response.send(foundUserTickets);
  }
}
