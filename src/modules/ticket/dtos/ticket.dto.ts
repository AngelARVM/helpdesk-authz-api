import {
  IsEnum,
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { TicketStatusCatalog } from '../types/ticket-status.catalog';
import { ITicket } from '../types/ticket.interface';

export class TicketDTO implements ITicket {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(TicketStatusCatalog)
  status: TicketStatusCatalog;

  @IsUUID()
  ownerId: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsDateString()
  createdAt: string;
}
