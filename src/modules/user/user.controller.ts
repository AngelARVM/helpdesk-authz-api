import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserDTO } from './dtos/user.dto';
import { UserService } from './user.service';
import { CreateUserInput } from './dtos/create-user.input';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() input: CreateUserInput): Promise<UserDTO> {
    return this.userService.create(input);
  }

  @Get()
  async users(): Promise<UserDTO[]> {
    return this.userService.users();
  }
}
