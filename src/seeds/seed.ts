import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { CredentialEntity } from '@/modules/credential/entities/credential.entity';
import { TicketEntity } from '@/modules/ticket/entities/ticket.entity';
import { RolesCatalog } from '@/common/types/user-role.catalog';
import { TicketStatusCatalog } from '@/modules/ticket/types/ticket-status.catalog';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

async function hashPassword(
  password: string,
): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userRepo = queryRunner.manager.getRepository(UserEntity);
    const credentialRepo = queryRunner.manager.getRepository(CredentialEntity);
    const ticketRepo = queryRunner.manager.getRepository(TicketEntity);

    const ensureUser = async (
      email: string,
      password: string,
      role: RolesCatalog,
    ): Promise<UserEntity> => {
      let user = await userRepo.findOne({ where: { email } });

      if (!user) {
        user = userRepo.create({ email, role });
        user = await userRepo.save(user);
        console.log(`Created user ${email} with role ${role}`);
      } else if (user.role !== role) {
        user.role = role;
        user = await userRepo.save(user);
        console.log(`Updated user ${email} role to ${role}`);
      } else {
        console.log(`User ${email} already exists with role ${role}`);
      }

      // credencial PWD si no existe
      const existingCredential = await credentialRepo.findOne({
        where: { userId: user.id, type: 'PWD' },
      });

      if (!existingCredential) {
        const { hash, salt } = await hashPassword(password);
        const credential = credentialRepo.create({
          userId: user.id,
          type: 'PWD',
          key: hash,
          salt,
        });
        await credentialRepo.save(credential);
        console.log(`Created PWD credential for ${email}`);
      }

      return user;
    };

    // Users: 2 USER, 2 MODERATOR, 1 ADMIN
    const admin = await ensureUser(
      'admin@example.com',
      'Admin1234!',
      RolesCatalog.ADMIN,
    );

    const moderator1 = await ensureUser(
      'moderator1@example.com',
      'Mod1234!',
      RolesCatalog.MODERATOR,
    );

    const moderator2 = await ensureUser(
      'moderator2@example.com',
      'Mod1234!',
      RolesCatalog.MODERATOR,
    );

    const user1 = await ensureUser(
      'user1@example.com',
      'User1234!',
      RolesCatalog.USER,
    );

    const user2 = await ensureUser(
      'user2@example.com',
      'User1234!',
      RolesCatalog.USER,
    );

    // Clear table
    await ticketRepo.clear();

    // Create 5 tickets
    // T1, T2 by user1
    const t1 = ticketRepo.create({
      title: 'Login issue',
      description: 'I cannot log into my account from my laptop.',
      status: TicketStatusCatalog.OPEN,
      ownerId: user1.id,
    });
    const savedT1 = await ticketRepo.save(t1);

    const t2 = ticketRepo.create({
      title: 'Billing problem',
      description: 'I was charged twice for the same month.',
      status: TicketStatusCatalog.OPEN,
      ownerId: user1.id,
    });
    const savedT2 = await ticketRepo.save(t2);

    // T3, T4, T5 by user2
    const t3 = ticketRepo.create({
      title: 'Feature request',
      description: 'Please add dark mode to the dashboard.',
      status: TicketStatusCatalog.OPEN,
      ownerId: user2.id,
    });
    const savedT3 = await ticketRepo.save(t3);

    const t4 = ticketRepo.create({
      title: 'Security concern',
      description: 'I saw login attempts I do not recognize.',
      status: TicketStatusCatalog.OPEN,
      ownerId: user2.id,
    });
    const savedT4 = await ticketRepo.save(t4);

    const t5 = ticketRepo.create({
      title: 'Account upgrade',
      description: 'I want to upgrade my plan to Pro.',
      status: TicketStatusCatalog.OPEN,
      ownerId: user2.id,
    });
    const savedT5 = await ticketRepo.save(t5);

    // T2: assigned to moderator1, IN_PROGRESS
    savedT2.assignedToId = moderator1.id;
    savedT2.status = TicketStatusCatalog.IN_PROGRESS;
    await ticketRepo.save(savedT2);

    // T3: assigned to moderator2, CLOSED
    savedT3.assignedToId = moderator2.id;
    savedT3.status = TicketStatusCatalog.CLOSED;
    await ticketRepo.save(savedT3);

    // T4: assigned to admin, IN_PROGRESS, with internalNotes
    savedT4.assignedToId = admin.id;
    savedT4.status = TicketStatusCatalog.IN_PROGRESS;
    savedT4.internalNotes =
      'FLAG: monitor this account closely. Possible fraud.';
    await ticketRepo.save(savedT4);

    // T5: assigned to moderator2, OPEN
    savedT5.assignedToId = moderator2.id;
    // status OPEN
    await ticketRepo.save(savedT5);

    await queryRunner.commitTransaction();

    console.log('Seeding completed ✅');
    console.log('Users created:');
    console.log('  ADMIN:      admin@example.com / Admin1234!');
    console.log('  MODERATOR1: moderator1@example.com / Mod1234!');
    console.log('  MODERATOR2: moderator2@example.com / Mod1234!');
    console.log('  USER1:      user1@example.com / User1234!');
    console.log('  USER2:      user2@example.com / User1234!');

    console.log('\nTickets:');
    console.log(
      `  T1 (OPEN):         owner=user1, unassigned (id=${savedT1.id})`,
    );
    console.log(
      `  T2 (IN_PROGRESS):  owner=user1, assignedTo=moderator1 (id=${savedT2.id})`,
    );
    console.log(
      `  T3 (CLOSED):       owner=user2, assignedTo=moderator2 (id=${savedT3.id})`,
    );
    console.log(
      `  T4 (IN_PROGRESS):  owner=user2, assignedTo=admin (id=${savedT4.id}), internalNotes set`,
    );
    console.log(
      `  T5 (OPEN):         owner=user2, assignedTo=moderator2 (id=${savedT5.id})`,
    );
  } catch (err) {
    console.error('Seeding failed ❌');
    console.error(err);
    await queryRunner.rollbackTransaction();
    process.exitCode = 1;
  } finally {
    await queryRunner.release();
    await app.close();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
