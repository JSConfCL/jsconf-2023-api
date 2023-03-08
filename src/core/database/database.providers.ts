import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../constants';
import { databaseConfig } from './database.config';
import { User } from '../../modules/users/user.entity';
import { Ticket } from '../../modules/tickets/ticket.entity';
import { Payment } from '../../modules/payments/payment.entity';
import { UserTicket } from '../../modules/users/userTicket.entity';
import { Subscription } from '../../modules/subscriptions/subscriptions.entity';
import { Redemptions } from '../../modules/redemption/redemption.entity';
import { RedemptionTypes } from '../../modules/redemption/redemptionType.entity';
import { RedemptionTypesTickets } from '../../modules/redemption/redemptionTypesTickets.entity';
import { UsersPreferences } from 'src/modules/preferences/entities/userPreference.entity';
import { Preference } from 'src/modules/preferences/entities/preferences.entity';
import { UserTicketPreference } from 'src/modules/preferences/entities/userTicketPreference.entity';
import { TicketDependencies } from 'src/modules/tickets/ticketDependencies.entity';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: () => {
      const sequelize = new Sequelize(databaseConfig);
      sequelize.addModels([
        User,
        Ticket,
        Payment,
        UserTicket,
        TicketDependencies,
        Subscription,
        Redemptions,
        RedemptionTypesTickets,
        RedemptionTypes,
        Preference,
        UsersPreferences,
        UserTicketPreference,
      ]);
      return sequelize;
    },
  },
];
