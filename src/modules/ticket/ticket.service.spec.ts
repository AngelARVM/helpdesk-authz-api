import { TicketService } from './ticket.service';
import { Repository } from 'typeorm';
import { TicketEntity } from './entities/ticket.entity';
import { RolesCatalog } from '@/common/types/user-role.catalog';
import { UserContext } from '@/common/types/user-context.interface';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TicketStatusCatalog } from './types/ticket-status.catalog';

describe('TicketService', () => {
  let service: TicketService;
  let repository: jest.Mocked<Repository<TicketEntity>>;

  const baseUserContext: UserContext = {
    userId: 'user-1',
    role: RolesCatalog.USER,
    email: 'user@example.com',
    sub: 'user-1',
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<TicketEntity>>;

    service = new TicketService(repository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create tickets owned by the authenticated user', async () => {
    const dto = { title: 'New ticket', description: 'desc' } as TicketEntity;
    const entity = { ...dto, ownerId: baseUserContext.userId } as TicketEntity;
    repository.create.mockReturnValue(entity);
    repository.save.mockResolvedValue(entity);

    const result = await service.create(dto, baseUserContext);

    expect(result).toEqual(entity);
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      ownerId: baseUserContext.userId,
    });
    expect(repository.save).toHaveBeenCalledWith(entity);
  });

  it('should retrieve a ticket with role-based constraints', async () => {
    const ticket = {
      id: 'ticket-id',
      ownerId: baseUserContext.userId,
    } as TicketEntity;
    repository.findOne.mockResolvedValue(ticket);

    const result = await service.ticket(ticket.id, baseUserContext);

    expect(result).toEqual(ticket);
    expect(repository.findOne).toHaveBeenCalledWith({
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
      },
      where: {
        ownerId: baseUserContext.userId,
        id: ticket.id,
      },
    });
  });

  it('should throw NotFoundException when ticket does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.ticket('missing', baseUserContext),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should forbid users from accessing tickets they do not own', async () => {
    const ticket = { id: 'ticket-id', ownerId: 'other-user' } as TicketEntity;
    repository.findOne.mockResolvedValue(ticket);

    await expect(
      service.ticket(ticket.id, baseUserContext),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should list admin tickets with all fields ordered by creation date', async () => {
    const adminContext: UserContext = {
      ...baseUserContext,
      role: RolesCatalog.ADMIN,
    };
    const tickets = [{} as TicketEntity];
    repository.find.mockResolvedValue(tickets);

    const result = await service.tickets(adminContext);

    expect(result).toEqual(tickets);
    expect(repository.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        ownerId: true,
        assignedToId: true,
        internalNotes: true,
      },
    });
  });

  it('should update tickets and return the refreshed entity', async () => {
    const ticket = { id: 'ticket-id' } as TicketEntity;
    repository.findOneBy.mockResolvedValue(ticket);

    const result = await service.update(ticket.id, {
      status: TicketStatusCatalog.CLOSED,
    });

    expect(repository.update).toHaveBeenCalledWith(ticket.id, {
      status: TicketStatusCatalog.CLOSED,
    });
    expect(result).toEqual(ticket);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: ticket.id });
  });

  it('should assign the ticket to the provided moderator', async () => {
    const ticket = { id: 'ticket-id' } as TicketEntity;
    const assignedTicket = { ...ticket, assignedToId: 'mod-1' } as TicketEntity;
    repository.findOne.mockResolvedValue(ticket);
    repository.findOneBy.mockResolvedValue(assignedTicket);

    const result = await service.assignTicket(ticket.id, 'mod-1');

    expect(repository.update).toHaveBeenCalledWith(ticket.id, {
      assignedToId: 'mod-1',
    });
    expect(result).toEqual(assignedTicket);
  });

  it('should allow moderators to update status when ticket assigned to them', async () => {
    const moderatorContext: UserContext = {
      ...baseUserContext,
      role: RolesCatalog.MODERATOR,
      userId: 'mod-1',
    };
    const ticket = {
      id: 'ticket-id',
      assignedToId: moderatorContext.userId,
    } as TicketEntity;
    const updated = { ...ticket, status: TicketStatusCatalog.IN_PROGRESS };
    repository.findOne.mockResolvedValue(ticket);
    repository.findOneBy.mockResolvedValue(updated);

    const result = await service.updateStatus(
      ticket.id,
      TicketStatusCatalog.IN_PROGRESS,
      moderatorContext,
    );

    expect(repository.update).toHaveBeenCalledWith(ticket.id, {
      status: TicketStatusCatalog.IN_PROGRESS,
    });
    expect(result).toEqual(updated);
  });

  it('should prevent moderators from updating status of unassigned tickets', async () => {
    const moderatorContext: UserContext = {
      ...baseUserContext,
      role: RolesCatalog.MODERATOR,
      userId: 'mod-1',
    };
    const ticket = {
      id: 'ticket-id',
      assignedToId: 'someone-else',
    } as TicketEntity;
    repository.findOne.mockResolvedValue(ticket);

    await expect(
      service.updateStatus(
        ticket.id,
        TicketStatusCatalog.IN_PROGRESS,
        moderatorContext,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
