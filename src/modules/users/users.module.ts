import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { usersProviders } from './users.providers';
import { ServicesModule } from '../../services/services.module';
import { UserTicketService } from './userTicket.service';
import { PaymentsModule } from '../payments/payments.module';
import { PreferencesService } from '../preferences/preferences.service';
import { preferencesProviders } from '../preferences/preferences.providers';

@Module({
  imports: [ServicesModule, forwardRef(() => PaymentsModule)],
  providers: [
    UsersService,
    UserTicketService,
    PreferencesService,
    ...preferencesProviders,
    ...usersProviders,
  ],
  exports: [UsersService, UserTicketService, PreferencesService],
  controllers: [UsersController],
})
export class UsersModule {}
