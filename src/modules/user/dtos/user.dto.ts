import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../types/user.interface';
import { IsDateString, IsEmail, IsUUID } from 'class-validator';

export class UserDTO implements IUser {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsDateString()
  createdAt: Date;
}
