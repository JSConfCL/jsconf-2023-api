import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'subscriptions',
})
export class Subscription extends Model<Subscription> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
  })
  email: string;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  lastName: string;

  @Column({
    type: DataType.STRING(1000),
  })
  why: string;
}
