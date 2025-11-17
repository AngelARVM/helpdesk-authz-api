import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CredentialService } from '../credential/credential.service';
import { UnauthorizedException } from '@nestjs/common';
import { RolesCatalog } from '../../common/types/user-role.catalog';
import { UserContext } from '../../common/types/user-context.interface';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let userService: jest.Mocked<UserService>;
  let credentialService: jest.Mocked<CredentialService>;

  const user = {
    id: 'user-id',
    email: 'auth@example.com',
    role: RolesCatalog.USER,
  };

  beforeEach(() => {
    jwtService = {
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    userService = {
      create: jest.fn(),
      user: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    credentialService = {
      create: jest.fn(),
      validate: jest.fn(),
    } as unknown as jest.Mocked<CredentialService>;

    service = new AuthService(jwtService, userService, credentialService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('signUp', () => {
    it('should create user credentials and return the user', async () => {
      userService.create.mockResolvedValue(user as any);
      credentialService.create.mockResolvedValue(true);

      const result = await service.signUp({
        email: user.email,
        password: 'Secret123!',
      });

      expect(result).toEqual(user);
      expect(userService.create).toHaveBeenCalledWith({ email: user.email });
      expect(credentialService.create).toHaveBeenCalledWith({
        userId: user.id,
        type: 'PWD',
        key: 'Secret123!',
      });
    });
  });

  describe('signIn', () => {
    it('should generate a JWT when credentials are valid', async () => {
      userService.user.mockResolvedValue(user as any);
      credentialService.validate.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token');

      const result = await service.signIn({
        email: user.email,
        password: 'Secret123!',
      });

      expect(result).toEqual({ accessToken: 'token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        role: user.role,
        sub: user.id,
        userId: user.id,
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      userService.user.mockResolvedValue(null);

      await expect(
        service.signIn({ email: user.email, password: 'irrelevant' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(credentialService.validate).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      userService.user.mockResolvedValue(user as any);
      credentialService.validate.mockResolvedValue(false);

      await expect(
        service.signIn({ email: user.email, password: 'bad' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('should resolve user by id from context', async () => {
      const context: UserContext = {
        userId: user.id,
        email: user.email,
        role: user.role,
        sub: user.id,
      };
      userService.user.mockResolvedValue(user as any);

      const result = await service.me(context);

      expect(result).toEqual(user);
      expect(userService.user).toHaveBeenCalledWith({ id: user.id });
    });
  });
});
