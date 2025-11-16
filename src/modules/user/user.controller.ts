import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserDTO } from './dtos/user.dto';
import { UserService } from './user.service';
import { CreateUserInput } from './dtos/create-user.input';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

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

  // TODO: make available only for admins or some high role
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async user(@Param('id') id: string): Promise<UserDTO> {
    return this.userService.user({ id });
  }
}
