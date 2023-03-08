import {
  USER_TICKETS_PREFERENCES_REPOSITORY,
  PREFERENCES_REPOSITORY,
  USERS_PREFERENCES_REPOSITORY,
} from '../../core/constants';
import { UserTicketPreference } from './entities/userTicketPreference.entity';
import { Preference } from './entities/preferences.entity';
import { UsersPreferences } from './entities/userPreference.entity';

export const preferencesProviders = [
  {
    provide: USER_TICKETS_PREFERENCES_REPOSITORY,
    useValue: UserTicketPreference,
  },
  {
    provide: PREFERENCES_REPOSITORY,
    useValue: Preference,
  },
  {
    provide: USERS_PREFERENCES_REPOSITORY,
    useValue: UsersPreferences,
  },
];
