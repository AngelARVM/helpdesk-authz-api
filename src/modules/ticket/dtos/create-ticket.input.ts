import { PickType } from '@nestjs/swagger';
import { TicketDTO } from './ticket.dto';

export class CreateTicketInput extends PickType(TicketDTO, [
  'title',
  'description',
]) {}
