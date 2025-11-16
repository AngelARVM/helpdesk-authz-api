import { PickType } from '@nestjs/swagger';
import { CredentialEntity } from '../entities/credential.entity';
import { IsUUID } from 'class-validator';

export class CreateCredentialInput extends PickType(CredentialEntity, [
  'key',
  'type',
]) {
  @IsUUID()
  userId: string;
}
