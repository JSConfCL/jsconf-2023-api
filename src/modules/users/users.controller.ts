import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDTO } from './requests/dto/update.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { User } from './user.entity';
import { Authorization } from 'src/authorization/autorization.decorators';
import { AutorizationGuard } from 'src/authorization/autorization.guard';

@ApiBearerAuth()
@Controller('users')
@Authorization('*')
@UseGuards(AuthGuard('jwt'), AutorizationGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/me/tickets')
  async getTickets(@Req() req: Request) {
    const user = req.user as User;
    return await this.usersService.activeTickets(user.id);
  }

  @Get('/me')
  async me(@Req() req: Request) {
    const user = req.user as User;
    return await this.usersService.findFullUserById(user.id);
  }

  @Put('/')
  async update(@Req() req: Request, @Body() body: UpdateUserDTO) {
    const user = req.user as User;
    return await this.usersService.update(user.id, body);
  }

  @Put('/me')
  async updateMe(@Req() req: Request, @Body() body: UpdateUserDTO) {
    const user = req.user as User;
    return await this.usersService.update(user.id, body);
  }
}
