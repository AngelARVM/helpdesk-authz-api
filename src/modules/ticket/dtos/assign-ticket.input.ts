import { IsUUID } from 'class-validator';

export class AssignTicketInput {
  @IsUUID()
  assignedToId: string;
}
