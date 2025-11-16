import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ICredential } from '../types/credential.interface';
import { UserEntity } from '@/modules/user/entities/user.entity';

@Entity('credentials')
export class CredentialEntity implements ICredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  key: string;

  @Column()
  salt: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expired_at', nullable: true })
  expiredAt?: Date;

  @Column()
  userId: string;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => UserEntity, (user) => user.credentials)
  user: UserEntity;
}
