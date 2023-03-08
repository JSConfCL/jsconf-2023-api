import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../users/user.entity';
import { UserTicket } from '../users/userTicket.entity';
import { RedemptionTypesTickets } from './redemptionTypesTickets.entity';

export const statusOptions = ['redeemed', 'not_redeemed'] as const;

export type RedemptionStatus = typeof statusOptions[number];
@Table({
  tableName: 'redemptions',
})
export class Redemptions extends Model<Redemptions> {
  @Column({
    type: DataType.UUIDV4,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => UserTicket)
  @Column({
    type: DataType.STRING,
    field: 'user_ticket_id',
    allowNull: false,
  })
  userTicketId: string;

  @BelongsTo(() => UserTicket, 'userTicketId')
  userTicket: UserTicket;

  @ForeignKey(() => RedemptionTypesTickets)
  @Column({
    type: DataType.UUIDV4,
    field: 'redemption_types_tickets_id',
    allowNull: false,
  })
  redemptionTypesTicketsId: string;

  @HasMany(() => RedemptionTypesTickets, {
    foreignKey: 'id',
  })
  redemptions: RedemptionTypesTickets[];

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    field: 'redeemer_id',
    allowNull: false,
  })
  redeemerId: string;

  @BelongsTo(() => User, 'redeemerId')
  user: User;

  @Column({
    type: DataType.ENUM,
    values: statusOptions,
    allowNull: false,
    defaultValue: 'in_process',
  })
  status: RedemptionStatus;

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
