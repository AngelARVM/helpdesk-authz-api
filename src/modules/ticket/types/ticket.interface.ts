import { TicketStatusCatalog } from './ticket-status.catalog';

export interface ITicket {
  id: string;

  title: string;

  description: string;

  status: TicketStatusCatalog;

  ownerId: string;

  assignedToId?: string;

  internalNotes?: string;

  createdAt: string;

  /* NOTE: I think many other audit fields like createdBy, updatedAt, updatedBy,
   * lastMovement, can be added to Ticket, but it's out of the scope of this POC
   */
}
