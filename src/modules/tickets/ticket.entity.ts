import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'tickets',
})
export class Ticket extends Model<Ticket> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'stripe_price_id',
  })
  stripePriceId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.ENUM,
    values: ['student', 'adult', 'gift'],
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.ENUM,
    values: ['early_bird', 'presale', 'sale'],
    allowNull: false,
  })
  season: string;

  @Column({
    type: DataType.ENUM,
    values: ['on_sale', 'soon', 'sold_out'],
    allowNull: false,
    defaultValue: 'on_sale',
  })
  status: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'price_usd',
  })
  priceUSD: number;

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
