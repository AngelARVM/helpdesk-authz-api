import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { RolesCatalog } from '@/common/types/user-role.catalog';
import { CurrentUser } from '@/common/middlewares/decorators/currnt-user.decorator';
import type { UserContext } from '@/common/types/user-context.interface';
import { Authed } from '@/common/middlewares/decorators/authed.decorator';
import { CreateTicketInput } from './dtos/create-ticket.input';
import { TicketDTO } from './dtos/ticket.dto';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Authed([RolesCatalog.USER])
  @Post()
  async create(
    @Body() input: CreateTicketInput,
    @CurrentUser() user: UserContext,
  ) {
    return this.ticketService.create(input, user);
  }

  @Authed([RolesCatalog.USER, RolesCatalog.MODERATOR, RolesCatalog.ADMIN])
  @Get(':id')
  async ticket(
    @Param('id') id: TicketDTO['id'],
    @CurrentUser() user: UserContext,
  ) {
    return this.ticketService.ticket(id, user);
  }

  @Authed([RolesCatalog.USER, RolesCatalog.MODERATOR, RolesCatalog.ADMIN])
  @Get()
  async tickets(
    @CurrentUser() user: UserContext,
  ): Promise<Partial<TicketDTO>[]> {
    return this.ticketService.tickets(user);
  }
}
