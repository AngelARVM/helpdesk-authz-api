import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<Repository<UserEntity>>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserEntity>>;

    service = new UserService(repository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create a user and persist it', async () => {
    const dto = { email: 'test@example.com' };
    const createdUser = { email: dto.email } as UserEntity;
    const savedUser = { id: 'uuid', email: dto.email } as UserEntity;
    repository.create.mockReturnValue(createdUser);
    repository.save.mockResolvedValue(savedUser);

    const result = await service.create(dto);

    expect(result).toEqual(savedUser);
    expect(repository.create).toHaveBeenCalledWith({ email: dto.email });
    expect(repository.save).toHaveBeenCalledWith(createdUser);
  });

  it('should find a single user by criteria', async () => {
    const user = { id: 'uuid', email: 'find@example.com' } as UserEntity;
    repository.findOneBy.mockResolvedValue(user);

    const result = await service.user({ id: user.id });

    expect(result).toEqual(user);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: user.id });
  });

  it('should list all users', async () => {
    const users = [
      { id: '1', email: 'one@example.com' },
      { id: '2', email: 'two@example.com' },
    ] as UserEntity[];
    repository.find.mockResolvedValue(users);

    const result = await service.users();

    expect(result).toEqual(users);
    expect(repository.find).toHaveBeenCalledWith();
  });
});
