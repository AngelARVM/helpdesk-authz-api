import { Injectable } from '@nestjs/common';
import { CredentialService } from '../credential/credential.service';
import { UserService } from '../user/user.service';
import { SignUpInput } from './dto/sign-up.input';
import { UserDTO } from '../user/dtos/user.dto';
import { SignInInput } from './dto/sign-in.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly credentialService: CredentialService,
  ) {}

  async signUp(input: SignUpInput): Promise<UserDTO> {
    const { email, password } = input;

    /* Note: aifly assuming this inserts will always succeed,
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
  async signIn(input: SignInInput): Promise<boolean> {
    const { email, password } = input;
    const user = await this.userService.user({ email });

    return this.credentialService.validate({
      userId: user.id,
      key: password,
      type: 'PWD',
    });
  }
}
