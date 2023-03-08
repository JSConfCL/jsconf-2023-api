import { User } from './user.entity';
import { UserTicket } from './userTicket.entity';

import { USER_REPOSITORY } from '../../core/constants';
import { USER_TICKET_REPOSITORY } from '../../core/constants';

export const usersProviders = [
  {
    provide: USER_REPOSITORY,
    useValue: User,
  },
  {
    provide: USER_TICKET_REPOSITORY,
    useValue: UserTicket,
  },
];
