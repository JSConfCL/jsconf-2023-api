import {
  REDEMPTIONS_REPOSITORY,
  REDEMPTIONS_TYPES_REPOSITORY,
  REDEMPTIONS_TYPES_TICKETS_REPOSITORY,
} from 'src/core/constants';
import { Redemptions } from './redemption.entity';
import { RedemptionTypes } from './redemptionType.entity';
import { RedemptionTypesTickets } from './redemptionTypesTickets.entity';

export const redemptionProviders = [
  {
    provide: REDEMPTIONS_REPOSITORY,
    useValue: Redemptions,
  },
  {
    provide: REDEMPTIONS_TYPES_TICKETS_REPOSITORY,
    useValue: RedemptionTypesTickets,
  },
  {
    provide: REDEMPTIONS_TYPES_REPOSITORY,
    useValue: RedemptionTypes,
  },
];
