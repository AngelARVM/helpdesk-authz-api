import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Authed } from '@/common/middlewares/decorators/authed.decorator';
import { CurrentUser } from '@/common/middlewares/decorators/currnt-user.decorator';
import type { UserContext } from '@/common/types/user-context.interface';
import { AuthService } from './auth.service';
import { SignUpInput } from './dto/sign-up.input';
import { SignInInput } from './dto/sign-in.input';
import { SingInResponseDTO } from './dto/sign-in.response';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //IMP: add throttler
  @Post('sign-up')
  async signUp(@Body() input: SignUpInput) {
    return this.authService.signUp(input);
  }

  // TODO: add throttler
  @ApiBody({
    type: SignInInput,
    examples: {
      user1: {
        summary: 'USER1 login',
        value: {
          email: 'user1@example.com',
          password: 'User1234!',
        },
      },
      user2: {
        summary: 'USER2 login',
        value: {
          email: 'user2@example.com',
          password: 'User1234!',
        },
      },
      moderator1: {
        summary: 'MODERATOR1 login',
        value: {
          email: 'moderator1@example.com',
          password: 'Mod1234!',
        },
      },
      moderator2: {
        summary: 'MODERATOR2 login',
        value: {
          email: 'moderator2@example.com',
          password: 'Mod1234!',
        },
      },
      admin: {
        summary: 'ADMIN login',
        value: {
          email: 'admin@example.com',
          password: 'Admin1234!',
        },
      },
    },
  })
  @ApiOkResponse({
    type: SingInResponseDTO,
    description: 'Access token',
    example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
  })
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
