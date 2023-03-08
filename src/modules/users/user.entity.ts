import { Table, Column, Model, DataType } from 'sequelize-typescript';

export const roleValues = ['user', 'volunteer', 'admin'] as const;
const providerValues = [
  'local',
  'google',
  'github',
  'twitter',
  'facebook',
] as const;

@Table({
  tableName: 'users',
})
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    field: 'provider_id',
  })
  providerId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  username: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email?: string;

  @Column({
    type: DataType.STRING,
  })
  password?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  photo: string;

  @Column({
    type: DataType.STRING,
  })
  country: string;

  @Column({
    type: DataType.STRING,
  })
  company: string;

  @Column({
    type: DataType.STRING,
  })
  position: string;

  @Column({
    type: DataType.STRING,
  })
  seniority: string;

  @Column({
    type: DataType.INTEGER,
    field: 'years_of_experience',
  })
  yearsOfExperience: number;

  @Column({
    type: DataType.ENUM,
    values: providerValues,
    defaultValue: 'local',
  })
  provider: string;

  @Column({
    type: DataType.STRING,
  })
  gender: string;

  @Column({
    type: DataType.ENUM,
    values: roleValues,
    defaultValue: 'user',
  })
  role: typeof roleValues[number];

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
