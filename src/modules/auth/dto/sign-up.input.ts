/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateUserInput } from '../../user/dtos/create-user.input';
import { IsStrongPassword } from 'class-validator';

export class SignUpInput extends PickType(CreateUserInput, ['email']) {
  @ApiProperty()
  @IsStrongPassword()
  password: string;
}
