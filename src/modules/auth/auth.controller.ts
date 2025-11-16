import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpInput } from './dto/sign-up.input';
import { SignInInput } from './dto/sign-in.input';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() input: SignUpInput) {
    return this.authService.signUp(input);
  }

  @Post('sign-in')
  async signIn(@Body() input: SignInInput) {
    return this.authService.signIn(input);
  }
}
