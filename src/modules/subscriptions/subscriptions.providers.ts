import { SUBSCRIPTION_REPOSITORY } from 'src/core/constants';
import { Subscription } from './subscriptions.entity';

export const subscriptionProviders = [
  {
    provide: SUBSCRIPTION_REPOSITORY,
    useValue: Subscription,
  },
];
