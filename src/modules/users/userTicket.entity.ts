import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Payment } from '../payments/payment.entity';
import { UserTicketPreference } from '../preferences/entities/userTicketPreference.entity';
import { RedemptionTypesTickets } from '../redemption/redemptionTypesTickets.entity';
import { Ticket } from '../tickets/ticket.entity';
import { User } from './user.entity';

const statusValues = [
  'created',
  'not_paid',
  'failed',
  'eliminated',
  'reserved',
  'not_redeemed',
  'offered',
  'redeemed',
] as const;
@Table({
  tableName: 'user_tickets',
})
export class UserTicket extends Model<UserTicket> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    field: 'owner_id',
    allowNull: true,
  })
  ownerId: string;
  @BelongsTo(() => User, 'ownerId')
  owner: User;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'burned_at',
  })
  burnedAt: Date | null;

  @Column({
    type: DataType.STRING,
    field: 'payment_id',
    allowNull: true,
  })
  paymentId: string | null;
  @BelongsTo(() => Payment, 'paymentId')
  payment: Payment;

  @Column({
    type: DataType.STRING,
    field: 'ticket_id',
    allowNull: false,
  })
  ticketId: string;
  @BelongsTo(() => Ticket, 'ticketId')
  ticket: Ticket;

  @Column({
    type: DataType.ENUM,
    values: statusValues,
    defaultValue: 'created',
  })
  status: typeof statusValues[number];

  @HasMany(() => UserTicketPreference)
  preferences?: UserTicketPreference[];
}
