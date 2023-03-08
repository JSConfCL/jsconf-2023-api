import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Ticket } from './ticket.entity';

@Table({
  tableName: 'ticket_dependencies',
})
export class TicketDependencies extends Model<TicketDependencies> {
  @Column({
    type: DataType.STRING,
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

  @BelongsTo(() => Ticket, 'ticketId')
  ticket: Ticket;

  @ForeignKey(() => Ticket)
  @Column({
    type: DataType.STRING,
    field: 'requirement_id',
    allowNull: false,
  })
  requirementId: string;

  @BelongsTo(() => Ticket, 'requirementId')
  requirement: Ticket;

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
