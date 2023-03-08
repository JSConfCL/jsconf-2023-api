import { Ticket } from './ticket.entity';
import { TicketDependencies } from './ticketDependencies.entity';
import {
  TICKET_DEPENDENCIES_REPOSITORY,
  TICKET_REPOSITORY,
} from '../../core/constants';

export const ticketsProviders = [
  {
    provide: TICKET_REPOSITORY,
    useValue: Ticket,
  },
  {
    provide: TICKET_DEPENDENCIES_REPOSITORY,
    useValue: TicketDependencies,
  },
];
