import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { UserContext } from '@/common/types/user-context.interface';
import { TicketEntity } from './entities/ticket.entity';
import { TicketDTO } from './dtos/ticket.dto';
import { CreateTicketInput } from './dtos/create-ticket.input';
import { RolesCatalog } from '../../common/types/user-role.catalog';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepo: Repository<TicketEntity>,
  ) {}

  async create(
    input: CreateTicketInput,
    user: UserContext,
  ): Promise<TicketDTO> {
    const ticketInput = this.ticketRepo.create({
      ...input,
      ownerId: user.userId,
    });
    const newTicket = await this.ticketRepo.save(ticketInput);

    return newTicket;
  }

  async ticket(id, user): Promise<Partial<TicketDTO>> {
    const options: FindOneOptions<TicketEntity> = this.findTicketOptionsBuilder(
      user,
      false,
    );
    options.where = { ...options.where, id };

    const ticket = await this.ticketRepo.findOne(options);

    if (user.role === RolesCatalog.USER && ticket.ownerId !== user.userId)
      throw new UnauthorizedException('You can only access your own tickets');

    return ticket;
  }

  async tickets(user: UserContext): Promise<Partial<TicketDTO>[]> {
    return this.ticketRepo.find(this.findTicketOptionsBuilder(user, true));
  }

  async update(id, update): Promise<TicketDTO> {
    await this.ticketRepo.update(id, update);
    return this.ticketRepo.findOneBy({ id });
  }

  /**
   * Builds TypeORM find options for ticket queries based on user context and role-based permissions.
   *
   * @param user - The user context containing userId and role information
   * @param isMany - Whether the query is for multiple records (affects ordering)
   * @returns TypeORM FindManyOptions with role-specific where clauses and field selections
   *
   * @remarks
   * - USER role: Can only see their own tickets with basic fields
   * - MODERATOR role: Can see tickets assigned to them with additional fields
   * - ADMIN role: Can see all tickets with all fields including internal notes
   */
  private findTicketOptionsBuilder(
    user: UserContext,
    isMany: boolean = false,
  ): FindManyOptions<TicketEntity> {
    const baseOptions = {
      order: {
        createdAt: 'DESC' as const,
      },
    };

    const roleOptions = {
      [RolesCatalog.USER]: {
        where: {
          ownerId: user.userId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
        },
      },
      [RolesCatalog.MODERATOR]: {
        where: {
          assignedToId: user.userId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          ownerId: true,
          assignedToId: true,
        },
      },
      [RolesCatalog.ADMIN]: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          ownerId: true,
          assignedToId: true,
          internalNotes: true,
        },
      },
    };

    return {
      ...(isMany ? baseOptions : {}),
      ...roleOptions[user.role],
    };
  }
}
