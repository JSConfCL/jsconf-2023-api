import { Module } from '@nestjs/common';
import { usersProviders } from '../users/users.providers';
import { RedemptionController } from './redemption.controller';
import { redemptionProviders } from './redemption.providers';
import { RedemptionService } from './redemption.service';

@Module({
  controllers: [RedemptionController],
  providers: [RedemptionService, ...redemptionProviders, ...usersProviders],
})
export class RedemptionModule {}
