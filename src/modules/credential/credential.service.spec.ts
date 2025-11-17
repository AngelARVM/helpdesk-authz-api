import { CredentialService } from './credential.service';
import { Repository } from 'typeorm';
import { CredentialEntity } from './entities/credential.entity';

describe('CredentialService', () => {
  let service: CredentialService;
  let repository: jest.Mocked<Repository<CredentialEntity>>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<CredentialEntity>>;

    service = new CredentialService(repository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should hash the password and persist credential', async () => {
      const hashPasswordSpy = jest
        .spyOn(service as any, 'hashPassword')
        .mockResolvedValue({ hash: 'hashed', salt: 'salt' });
      const dto = { userId: 'user', key: 'secret', type: 'PWD' };
      const entity = {
        ...dto,
        key: 'hashed',
        salt: 'salt',
      } as CredentialEntity;
      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(result).toBe(true);
      expect(hashPasswordSpy).toHaveBeenCalledWith('secret');
      expect(repository.create).toHaveBeenCalledWith({
        userId: 'user',
        type: 'PWD',
        key: 'hashed',
        salt: 'salt',
      });
      expect(repository.save).toHaveBeenCalledWith(entity);
    });

    it('should return false if persistence fails', async () => {
      jest
        .spyOn(service as any, 'hashPassword')
        .mockResolvedValue({ hash: 'hash', salt: 'salt' });
      repository.create.mockReturnValue({} as CredentialEntity);
      repository.save.mockRejectedValue(new Error('boom'));

      const result = await service.create({
        userId: 'user',
        key: 'pwd',
        type: 'PWD',
      });

      expect(result).toBe(false);
    });
  });

  describe('validate', () => {
    it('should return false if credential not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.validate({
        userId: 'missing',
        key: 'pwd',
        type: 'PWD',
      });

      expect(result).toBe(false);
    });

    it('should validate stored credential using scrypt', async () => {
      const password = 'StrongPwd1!';
      const hashed = await (service as any).hashPassword(password);
      repository.findOne.mockResolvedValue({
        userId: 'user',
        type: 'PWD',
        key: hashed.hash,
        salt: hashed.salt,
      } as CredentialEntity);

      const result = await service.validate({
        userId: 'user',
        key: password,
        type: 'PWD',
      });

      expect(result).toBe(true);
    });
  });
});
