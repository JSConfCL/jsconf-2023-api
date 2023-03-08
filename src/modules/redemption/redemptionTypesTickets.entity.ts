import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';
import { Ticket } from '../tickets/ticket.entity';
import { RedemptionTypes } from './redemptionType.entity';

export const statusOptions = ['redeemed', 'not_redeemed'] as const;

export type RedemptionStatus = typeof statusOptions[number];
@Table({
  tableName: 'redemption_types_tickets',
})
export class RedemptionTypesTickets extends Model<RedemptionTypesTickets> {
  @Column({
    type: DataType.UUIDV4,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Ticket)
  @Column({
    type: DataType.STRING,
    field: 'ticket_id',
    allowNull: false,
  })
  ticketId: string;

  @BelongsTo(() => Ticket, 'ticket_id')
  ticket: Ticket;

  @ForeignKey(() => RedemptionTypes)
  @Column({
    type: DataType.UUIDV4,
    field: 'redemption_type_id',
    allowNull: false,
  })
  redemptionTypeId: string;

  @BelongsTo(() => RedemptionTypes, 'redemption_type_id')
  redemptionType: RedemptionTypes;

  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt?: Date;

  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  updatedAt?: Date;
}
