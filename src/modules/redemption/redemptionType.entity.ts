import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'redemption_types',
})
export class RedemptionTypes extends Model<RedemptionTypes> {
  @Column({
    type: DataType.UUIDV4,
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
