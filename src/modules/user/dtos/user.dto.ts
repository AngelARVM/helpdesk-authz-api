import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../types/user.interface';
import { IsDateString, IsEmail, IsEnum, IsUUID } from 'class-validator';
import { RolesCatalog } from '@/common/types/user-role.catalog';

export class UserDTO implements IUser {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsEnum(RolesCatalog)
  role: RolesCatalog;

  @ApiProperty()
  @IsDateString()
  createdAt: Date;
}
