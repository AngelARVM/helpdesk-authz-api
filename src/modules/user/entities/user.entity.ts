import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IUser } from '../types/user.interface';
import { CredentialEntity } from '../../credential/entities/credential.entity';

@Entity('users')
export class UserEntity implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @OneToMany(() => CredentialEntity, (credential) => credential.user)
  credentials: CredentialEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
