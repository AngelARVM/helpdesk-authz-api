import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IUser } from '../types/user.interface';
import { CredentialEntity } from '@/modules/credential/entities/credential.entity';
import { RolesCatalog } from '@/common/types/user-role.catalog';

@Entity('users')
export class UserEntity implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // IRL apps you may want to add an @Index() here
  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: RolesCatalog,
    default: RolesCatalog.USER,
  })
  role: RolesCatalog;

  @OneToMany(() => CredentialEntity, (credential) => credential.user)
  credentials: CredentialEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
