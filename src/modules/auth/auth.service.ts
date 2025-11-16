import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CredentialService } from '../credential/credential.service';
import { UserService } from '../user/user.service';
import { SignUpInput } from './dto/sign-up.input';
import { UserDTO } from '../user/dtos/user.dto';
import { SignInInput } from './dto/sign-in.input';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '../user/types/user.interface';
import { UserContext } from '../../common/types/user-context.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly credentialService: CredentialService,
  ) {}

  async signUp(input: SignUpInput): Promise<UserDTO> {
    const { email, password } = input;

    /* Note: naifly assuming this inserts will always succeed,
     *  but can be handled with query runner to do it by transactions
     */
    const user = await this.userService.create({ email });
    await this.credentialService.create({
      userId: user.id,
      type: 'PWD',
      key: password,
    });

    return user;
  }

  // TODO: response with {access_token}
  async signIn(input: SignInInput): Promise<{ accessToken: string } | null> {
    const { email, password } = input;
    const user = await this.userService.user({ email });

    const hasValidCredentials = await this.credentialService.validate({
      userId: user.id,
      key: password,
      type: 'PWD',
    });

    if (!hasValidCredentials) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const payload = this.createPayload(user);
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async me(user: UserContext): Promise<UserDTO> {
    return this.userService.user({ id: user.userId });
  }

  private createPayload(user: IUser): UserContext {
    return {
      userId: user.id,
      email: user.email,
      sub: user.id,
    };
  }
}
