import { PickType } from '@nestjs/swagger';
import { SignUpInput } from './sign-up.input';
import { IsString } from 'class-validator';

export class SignInInput extends PickType(SignUpInput, ['email']) {
  @IsString()
  password: string;
}
