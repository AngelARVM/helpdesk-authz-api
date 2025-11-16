import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserDTO } from './dtos/user.dto';
import { CreateUserInput } from './dtos/create-user.input';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(input: CreateUserInput): Promise<UserDTO> {
    const { email } = input;
    const newUSer = this.userRepository.create({ email });
    return this.userRepository.save(newUSer);
  }

  async user(where: FindOptionsWhere<UserEntity>): Promise<UserDTO> {
    return this.userRepository.findOneBy(where);
  }

  async users(): Promise<UserDTO[]> {
    return this.userRepository.find();
  }
}
