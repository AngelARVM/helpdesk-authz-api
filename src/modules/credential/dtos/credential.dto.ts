import { IsDateString, IsString, IsUUID } from 'class-validator';
import { ICredential } from '../types/credential.interface';

export class CredentialDTO implements ICredential {
  @IsUUID()
  id: string;

  @IsString()
  type: string;

  @IsString()
  key: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  expiredAt: Date;
}
