import { forwardRef, Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { ticketsProviders } from './tickets.providers';
import { UsersModule } from '../users/users.module';
import { databaseProviders } from 'src/core/database/database.providers';
import { usersProviders } from '../users/users.providers';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    ...usersProviders,
    ...databaseProviders,
    ...ticketsProviders,
  ],
  exports: [TicketsService],
})
export class TicketsModule {}
