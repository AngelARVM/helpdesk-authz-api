import { IsIn } from 'class-validator';
import { TicketStatusCatalog } from '../types/ticket-status.catalog';

export class UpdateTicketStatusInput {
  @IsIn([TicketStatusCatalog.IN_PROGRESS, TicketStatusCatalog.CLOSED])
  status: TicketStatusCatalog;
}
