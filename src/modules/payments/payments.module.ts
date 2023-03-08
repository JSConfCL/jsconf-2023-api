import { forwardRef, Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { TicketsModule } from '../tickets/tickets.module';
import { PaymentsController } from './payments.controller';
import { ServicesModule } from '../../services/services.module';
import { paymentsProviders } from './payments.providers';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ServicesModule, TicketsModule, forwardRef(() => UsersModule)],
  providers: [PaymentsService, ...paymentsProviders],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
