import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CredentialEntity } from './entities/credential.entity';
import { Repository } from 'typeorm';
import { CreateCredentialInput } from './dtos/create-credential.input';
import { scrypt as _scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class CredentialService {
  constructor(
    @InjectRepository(CredentialEntity)
    private readonly credentialRepo: Repository<CredentialEntity>,
  ) {}

  async create(input: CreateCredentialInput): Promise<boolean> {
    const { userId, key, type } = input;
    const { hash, salt } = await this.hashPassword(key);
    const newCredential = this.credentialRepo.create({
      userId,
      type,
      key: hash,
      salt,
    });
    try {
      await this.credentialRepo.save(newCredential);
      return true;
    } catch {
      return false;
    }
  }

  // TODO:
  async validate(input: CreateCredentialInput): Promise<boolean> {
    const { userId, key: pwd, type } = input;
    const credential = await this.credentialRepo.findOne({
      where: {
        userId,
        type,
      },
    });

    if (!credential) {
      return false;
    }

    const { key, salt } = credential;
    const scrypt = promisify(_scrypt);
    const storedHashBuffer = Buffer.from(key, 'hex');
    const derivedKey = (await scrypt(pwd, salt, 64)) as Buffer;

    return timingSafeEqual(derivedKey, storedHashBuffer);
  }

  private async hashPassword(
    password: string,
  ): Promise<Record<string, string>> {
    const scrypt = promisify(_scrypt);
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

    return {
      hash: derivedKey.toString('hex'),
      salt: salt,
    };
  }
}
