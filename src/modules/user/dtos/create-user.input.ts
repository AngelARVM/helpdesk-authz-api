import { PickType } from '@nestjs/swagger';
import { UserDTO } from './user.dto';

export class CreateUserInput extends PickType(UserDTO, ['email']) {}
