import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateUserInput } from '@/modules/user/dtos/create-user.input';
import { IsStrongPassword } from 'class-validator';

export class SignUpInput extends PickType(CreateUserInput, ['email']) {
  @ApiProperty()
  @IsStrongPassword()
  password: string;
}
