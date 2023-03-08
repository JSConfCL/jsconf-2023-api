import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { UserTicket } from '../../users/userTicket.entity';
import { Preference } from './preferences.entity';

@Table({
  tableName: 'user_tickets_preferences',
})
export class UserTicketPreference extends Model<UserTicketPreference> {
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

  @ForeignKey(() => Preference)
  @Column({
    type: DataType.STRING,
    field: 'preference_id',
    allowNull: false,
  })
  preferenceId: string;
  @BelongsTo(() => Preference, 'preferenceId')
  preference: Preference;

  @Column({
    type: DataType.STRING,
    field: 'preference_value',
    allowNull: false,
  })
  preferenceValue: string;

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
