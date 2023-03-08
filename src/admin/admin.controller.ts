import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';
import { PinoLogger } from 'nestjs-pino';
import { Authorization } from 'src/authorization/autorization.decorators';
import { AutorizationGuard } from 'src/authorization/autorization.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@Authorization('*')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly logger: PinoLogger,
  ) {
    logger.setContext(AdminController.name);
  }

  @Get('validate')
  async validate(@Req() request: Request) {
    this.logger.info('Starting validation process');
    // this.validateAdminToken(request.headers);
    await this.adminService.validate();
  }

  @ApiBearerAuth()
  @Authorization('admin')
  @UseGuards(AuthGuard('jwt'), AutorizationGuard)
  @Get('/user/:userId/role')
  async getUserRole(
    @Res() response: Response,
    @Param('userId') userId: string,
  ) {
    this.logger.assign({ userId });
    this.logger.info('Checking if the user is a volunteer or an admin');
    await this.adminService.isTheUserAVolunteerOrAnAdmin(userId);
    response.send();
  }

  validateAdminToken = (headers: IncomingHttpHeaders) => {
    if (!headers['x-auth-token']) {
      throw new Error('Token not present');
    }
    if (headers['x-auth-token'] !== process.env.ADMIN_API_TOKEN) {
      throw new Error('Invalid token');
    }
  };
}
