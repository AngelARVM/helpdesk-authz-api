import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthController } from '../src/modules/auth/auth.controller';
import { TicketController } from '../src/modules/ticket/ticket.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { TicketService } from '../src/modules/ticket/ticket.service';
import { UserService } from '../src/modules/user/user.service';
import { CredentialService } from '../src/modules/credential/credential.service';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import { RolesGuard } from '../src/common/middlewares/guards/roles.guard';
import { UserEntity } from '../src/modules/user/entities/user.entity';
import { CredentialEntity } from '../src/modules/credential/entities/credential.entity';
import { TicketEntity } from '../src/modules/ticket/entities/ticket.entity';
import { RolesCatalog } from '../src/common/types/user-role.catalog';
import { TicketStatusCatalog } from '../src/modules/ticket/types/ticket-status.catalog';

const JWT_SECRET = 'test-secret';

type Where<T> = Partial<T>;
type Select<T> = Partial<Record<keyof T, boolean>>;

const matchesWhere = <T>(entity: T, where?: Where<T>): boolean => {
  if (!where) return true;
  return Object.entries(where).every(([key, value]) => {
    return (entity as Record<string, unknown>)[key] === value;
  });
};

const applySelect = <T>(entity: T, select?: Select<T>): Partial<T> => {
  if (!select) return entity;
  return Object.entries(select).reduce((acc, [key, include]) => {
    if (include) {
      acc[key as keyof T] = entity[key as keyof T];
    }
    return acc;
  }, {} as Partial<T>);
};

const createInMemoryRepository = <
  T extends { id?: string; createdAt?: Date },
>() => {
  const data: T[] = [];
  return {
    data,
    create: jest.fn((entity: Partial<T>) => ({ ...entity } as T)),
    save: jest.fn(async (entity: T) => {
      const saved = {
        ...entity,
        id: entity.id ?? randomUUID(),
        createdAt: entity.createdAt ?? new Date(),
      };
      if (!('role' in saved) || (saved as Record<string, unknown>).role == null) {
        (saved as Record<string, unknown>).role = RolesCatalog.USER;
      }
      const index = data.findIndex((item) => item.id === saved.id);
      if (index >= 0) {
        data[index] = saved;
      } else {
        data.push(saved);
      }
      return saved;
    }),
    findOneBy: jest.fn(async (where: Where<T>) => {
      return data.find((item) => matchesWhere(item, where)) ?? null;
    }),
    findOne: jest.fn(
      async (options: { where: Where<T>; select?: Select<T> }) => {
        const found =
          data.find((item) => matchesWhere(item, options?.where)) ?? null;
        if (!found) {
          return null;
        }
        return applySelect(found, options?.select) as T;
      },
    ),
    find: jest.fn(
      async (options?: {
        where?: Where<T>;
        select?: Select<T>;
        order?: { createdAt?: 'ASC' | 'DESC' };
      }) => {
        let items = data.filter((item) => matchesWhere(item, options?.where));
        if (options?.order?.createdAt) {
          items = items.sort((a, b) => {
            const aTime = a.createdAt ? a.createdAt.getTime() : 0;
            const bTime = b.createdAt ? b.createdAt.getTime() : 0;
            return options.order.createdAt === 'DESC'
              ? bTime - aTime
              : aTime - bTime;
          });
        }
        return options?.select
          ? (items.map((item) => applySelect(item, options.select)) as T[])
          : items;
      },
    ),
    update: jest.fn(async (id: string, update: Partial<T>) => {
      const index = data.findIndex((item) => item.id === id);
      if (index >= 0) {
        data[index] = { ...data[index], ...update };
      }
    }),
  };
};

describe('Happy path auth + ticket flow (e2e)', () => {
  let app: INestApplication;
  const userRepo = createInMemoryRepository<UserEntity>();
  const credentialRepo = createInMemoryRepository<CredentialEntity>();
  const ticketRepo = createInMemoryRepository<TicketEntity>();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController, TicketController],
      providers: [
        AuthService,
        TicketService,
        UserService,
        CredentialService,
        JwtStrategy,
        RolesGuard,
        {
          provide: JwtService,
          useValue: new JwtService({
            secret: JWT_SECRET,
            signOptions: { expiresIn: '1h' },
          }),
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'jwtSecret') {
                return JWT_SECRET;
              }
              return undefined;
            },
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepo,
        },
        {
          provide: getRepositoryToken(CredentialEntity),
          useValue: credentialRepo,
        },
        {
          provide: getRepositoryToken(TicketEntity),
          useValue: ticketRepo,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows creating and triaging a ticket through admin/moderator flows', async () => {
    const server = app.getHttpServer();
    const email = `e2e+${Date.now()}@example.com`;
    const password = 'Ticket123!';

    const signUpResponse = await request(server)
      .post('/auth/sign-up')
      .send({ email, password })
      .expect(201);
    expect(signUpResponse.body.email).toBe(email);
    expect(signUpResponse.body.role).toBe(RolesCatalog.USER);

    const signInResponse = await request(server)
      .post('/auth/sign-in')
      .send({ email, password })
      .expect(201);
    expect(signInResponse.body.accessToken).toBeDefined();

    const ticketResponse = await request(server)
      .post('/tickets')
      .set('Authorization', `Bearer ${signInResponse.body.accessToken}`)
      .send({
        title: 'Printer on fire',
        description: 'Smoke coming out of the tray',
      })
      .expect(201);

    expect(ticketResponse.body.title).toBe('Printer on fire');
    expect(ticketResponse.body.description).toBe(
      'Smoke coming out of the tray',
    );
    expect(ticketResponse.body.ownerId).toBe(signUpResponse.body.id);

    const adminEmail = `admin+${Date.now()}@example.com`;
    await request(server)
      .post('/auth/sign-up')
      .send({ email: adminEmail, password })
      .expect(201);
    const adminUser = userRepo.data.find((user) => user.email === adminEmail);
    adminUser.role = RolesCatalog.ADMIN;
    const adminSignIn = await request(server)
      .post('/auth/sign-in')
      .send({ email: adminEmail, password })
      .expect(201);

    const moderatorEmail = `mod+${Date.now()}@example.com`;
    const moderatorSignUp = await request(server)
      .post('/auth/sign-up')
      .send({ email: moderatorEmail, password })
      .expect(201);
    const moderatorUser = userRepo.data.find(
      (user) => user.email === moderatorEmail,
    );
    moderatorUser.role = RolesCatalog.MODERATOR;
    const moderatorSignIn = await request(server)
      .post('/auth/sign-in')
      .send({ email: moderatorEmail, password })
      .expect(201);

    const assignmentResponse = await request(server)
      .patch(`/tickets/${ticketResponse.body.id}/assign`)
      .set('Authorization', `Bearer ${adminSignIn.body.accessToken}`)
      .send({ assignedToId: moderatorSignUp.body.id })
      .expect(200);
    expect(assignmentResponse.body.assignedToId).toBe(moderatorSignUp.body.id);

    const modStatusResponse = await request(server)
      .patch(`/tickets/${ticketResponse.body.id}/status`)
      .set('Authorization', `Bearer ${moderatorSignIn.body.accessToken}`)
      .send({ status: TicketStatusCatalog.IN_PROGRESS })
      .expect(200);
    expect(modStatusResponse.body.status).toBe(
      TicketStatusCatalog.IN_PROGRESS,
    );

    const adminCloseResponse = await request(server)
      .patch(`/tickets/${ticketResponse.body.id}/status`)
      .set('Authorization', `Bearer ${adminSignIn.body.accessToken}`)
      .send({ status: TicketStatusCatalog.CLOSED })
      .expect(200);
    expect(adminCloseResponse.body.status).toBe(TicketStatusCatalog.CLOSED);
  });
});
