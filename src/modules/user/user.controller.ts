import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserDTO } from './dtos/user.dto';
import { UserService } from './user.service';
import { CreateUserInput } from './dtos/create-user.input';
import { Authed } from '../../common/middlewares/decorators/authed.decorator';
import { RolesCatalog } from '../../common/types/user-role.catalog';
import { ApiParam } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() input: CreateUserInput): Promise<UserDTO> {
    return this.userService.create(input);
  }

  @Authed([RolesCatalog.ADMIN, RolesCatalog.MODERATOR])
  @Get()
  async users(): Promise<UserDTO[]> {
    return this.userService.users();
  }

  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user to retrieve',
    type: String,
  })
  @Authed([RolesCatalog.ADMIN, RolesCatalog.MODERATOR])
  @Get(':id')
  async user(@Param('id') id: string): Promise<UserDTO> {
    return this.userService.user({ id });
  }
}
