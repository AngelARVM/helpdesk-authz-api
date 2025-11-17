import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { RolesCatalog } from '@/common/types/user-role.catalog';
import { CurrentUser } from '@/common/middlewares/decorators/current-user.decorator';
import type { UserContext } from '@/common/types/user-context.interface';
import { Authed } from '@/common/middlewares/decorators/authed.decorator';
import { CreateTicketInput } from './dtos/create-ticket.input';
import { TicketDTO } from './dtos/ticket.dto';
import { AssignTicketInput } from './dtos/assign-ticket.input';
import { UpdateTicketStatusInput } from './dtos/update-ticket-status.input';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @ApiCreatedResponse({
    description: 'Ticket created by USER',
    type: TicketDTO,
  })
  @ApiForbiddenResponse({ description: 'Only USER role can create tickets' })
  @Authed([RolesCatalog.USER])
  @Post()
  async create(
    @Body() input: CreateTicketInput,
    @CurrentUser() user: UserContext,
  ) {
    return this.ticketService.create(input, user);
  }

  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the ticket to retrieve',
    type: String,
  })
  @Authed([RolesCatalog.USER, RolesCatalog.MODERATOR, RolesCatalog.ADMIN])
  @Get(':id')
  async ticket(
    @Param('id') id: TicketDTO['id'],
    @CurrentUser() user: UserContext,
  ) {
    return this.ticketService.ticket(id, user);
  }

  @ApiOkResponse({
    description:
      'List of tickets for the current user, filtered and shaped based on role (ABAC-lite)',
    type: TicketDTO,
    isArray: true,
  })
  @Authed([RolesCatalog.USER, RolesCatalog.MODERATOR, RolesCatalog.ADMIN])
  @Get()
  async tickets(
    @CurrentUser() user: UserContext,
  ): Promise<Partial<TicketDTO>[]> {
    return this.ticketService.tickets(user);
  }

  @ApiOkResponse({
    description: 'Assigns a ticket to a moderator',
    type: TicketDTO,
  })
  @Authed([RolesCatalog.ADMIN])
  @Patch(':id/assign')
  async assignTicket(
    @Param('id') id: TicketDTO['id'],
    @Body() input: AssignTicketInput,
  ): Promise<TicketDTO> {
    return this.ticketService.assignTicket(id, input.assignedToId);
  }

  @ApiOkResponse({
    description: 'Updates the ticket status (IN_PROGRESS or CLOSED)',
    type: TicketDTO,
  })
  @Authed([RolesCatalog.ADMIN, RolesCatalog.MODERATOR])
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: TicketDTO['id'],
    @Body() input: UpdateTicketStatusInput,
    @CurrentUser() user: UserContext,
  ): Promise<TicketDTO> {
    return this.ticketService.updateStatus(id, input.status, user);
  }
}
