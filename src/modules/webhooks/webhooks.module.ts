import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { ServicesModule } from '../../services/services.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [ServicesModule, PaymentsModule],
  controllers: [WebhooksController],
  providers: [],
  exports: [],
})
export class WebhooksModule {}
