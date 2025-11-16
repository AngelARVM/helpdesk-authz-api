import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Authed } from '@/common/middlewares/decorators/authed.decorator';
import { CurrentUser } from '@/common/middlewares/decorators/currnt-user.decorator';
import type { UserContext } from '@/common/types/user-context.interface';
import { AuthService } from './auth.service';
import { SignUpInput } from './dto/sign-up.input';
import { SignInInput } from './dto/sign-in.input';
import { SingInResponseDTO } from './dto/sign-in.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //IMP: add throttler
  @Post('sign-up')
  async signUp(@Body() input: SignUpInput) {
    return this.authService.signUp(input);
  }

  //IMP: add throttler
  @Post('sign-in')
  async signIn(@Body() input: SignInInput): Promise<SingInResponseDTO> {
    return this.authService.signIn(input);
  }

  @ApiBearerAuth()
  @Authed()
  @Get('/me')
  async me(@CurrentUser() user: UserContext) {
    return this.authService.me(user);
  }
}
