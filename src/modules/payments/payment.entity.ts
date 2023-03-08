import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../../modules/users/user.entity';
import { UserTicket } from '../users/userTicket.entity';

export const gatewayOptions = ['mercadopago', 'stripe'] as const;
export const statusOptions = [
  'in_process',
  'approved',
  'cancelled',
  'rejected',
] as const;
@Table({
  tableName: 'payments',
})
export class Payment extends Model<Payment> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    field: 'user_id',
    allowNull: false,
  })
  userId: string;
  @BelongsTo(() => User, 'userId')
  user: User;

  @Column({
    type: DataType.ENUM,
    values: gatewayOptions,
    allowNull: false,
  })
  gateway: typeof gatewayOptions[number];

  @Column({
    type: DataType.ENUM,
    values: statusOptions,
    allowNull: false,
    defaultValue: 'in_process',
  })
  status: typeof statusOptions[number];

  @Column({
    type: DataType.STRING,
    field: 'reference_gateway_id',
  })
  referenceGatewayId: string;

  @Column({
    type: DataType.ENUM,
    values: ['clp', 'usd'],
    defaultValue: 'clp',
  })
  currency: string;

  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt?: Date;

  @Column({
    type: DataType.DATE,
    field: 'validated_at',
    defaultValue: null,
  })
  validatedAt?: Date | null;

  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  updatedAt?: Date;

  @HasMany(() => UserTicket, {
    foreignKey: 'payment_id',
  })
  userTickets: UserTicket[];
}
