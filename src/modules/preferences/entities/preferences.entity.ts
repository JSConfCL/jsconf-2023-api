import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'preferences',
})
export class Preference extends Model<Preference> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    field: 'name',
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    field: 'description',
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    field: 'possible_values',
    defaultValue: [],
    allowNull: false,
  })
  possibleValues: string[];

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
