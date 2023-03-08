import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/user.entity';
import { Preference } from './preferences.entity';

@Table({
  tableName: 'users_preferences',
})
export class UsersPreferences extends Model<UsersPreferences> {
  @Column({
    type: DataType.UUIDV4,
    defaultValue: DataType.UUIDV4,
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
