import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PinoLogger } from 'nestjs-pino';
import { VolunteerSubscriptionDTO } from './requests/dto/VolunteerSubscription.dto';
import { Subscription } from './subscriptions.entity';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(SubscriptionsService.name);
  }

  async createVolunteerSubscription(subscription: VolunteerSubscriptionDTO) {
    const newSubscription = new Subscription();
    newSubscription.id = `subscription_${nanoid()}`;
    newSubscription.name = subscription.name;
    newSubscription.lastName = subscription.lastName;
    newSubscription.why = subscription.why;
    newSubscription.email = subscription.email;
    const createdSubscription = await newSubscription.save();
    return createdSubscription;
  }
}
