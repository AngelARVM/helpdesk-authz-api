import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserDTO } from './dtos/user.dto';
import { UserService } from './user.service';
import { CreateUserInput } from './dtos/create-user.input';
import { Authed } from '../../common/middlewares/decorators/authed.decorator';
import { RolesCatalog } from '../../common/types/user-role.catalog';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() input: CreateUserInput): Promise<UserDTO> {
    return this.userService.create(input);
  }

  @ApiOkResponse({
    description: 'List all users',
    type: UserDTO,
    isArray: true,
  })
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
  @ApiOkResponse({ description: 'User found', type: UserDTO })
  @Authed([RolesCatalog.ADMIN, RolesCatalog.MODERATOR])
  @Get(':id')
  async user(@Param('id') id: string): Promise<UserDTO> {
    return this.userService.user({ id });
  }
}
