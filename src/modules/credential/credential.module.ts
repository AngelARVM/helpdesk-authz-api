import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialEntity } from './entities/credential.entity';
import { CredentialService } from './credential.service';

@Module({
  imports: [TypeOrmModule.forFeature([CredentialEntity])],
  providers: [CredentialService],
  exports: [CredentialService],
})
export class CredentialModule {}
