import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { PaymentsModule } from 'src/modules/payments/payments.module';

@Module({
  imports: [UsersModule, PaymentsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
