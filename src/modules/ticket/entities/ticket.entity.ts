import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ITicket } from '../types/ticket.interface';
import { TicketStatusCatalog } from '../types/ticket-status.catalog';

@Entity('tickets')
export class TicketEntity implements ITicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  // NOTE: Indexable
  @Column({
    type: 'enum',
    enum: TicketStatusCatalog,
    default: TicketStatusCatalog.OPEN,
  })
  status: TicketStatusCatalog;

  // NOTE: Indexable
  @Column({
    name: 'owner_id',
  })
  ownerId: string;

  // NOTE: Indexable
  @Column({
    name: 'assigned_to_id',
    nullable: true,
  })
  assignedToId?: string;

  @Column({
    name: 'internal_notes',
    nullable: true,
  })
  internalNotes?: string;

  // NOTE: Indexable
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: string;
}
