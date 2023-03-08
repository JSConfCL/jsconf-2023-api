import { Payment } from './payment.entity';
import { PAYMENT_REPOSITORY } from '../../core/constants';

export const paymentsProviders = [
  {
    provide: PAYMENT_REPOSITORY,
    useValue: Payment,
  },
];
