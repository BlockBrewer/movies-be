import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { RegisterRequestDto } from '@modules/auth/dtos/register-request.dto';
import { PaginationQueryDto } from '@shared/dtos/pagination-query.dto';
import { hashPassword } from '@shared/utils/password.util';

import { UserResponseDto } from '../dtos/user-response.dto';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(request: RegisterRequestDto): Promise<UserEntity> {
    const normalizedEmail = request.email.trim().toLowerCase();
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await hashPassword(request.password);

    const user = this.userRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
      fullName: request.fullName,
      phoneNumber: request.phoneNumber,
    });

    return this.userRepository.save(user);
  }

  async findAll({ page = 1, limit = 25 }: PaginationQueryDto): Promise<{
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { data, total } = await this.userRepository.paginate(page, limit);
    return { data: data.map((user) => this.sanitize(user)), total, page, limit };
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return this.userRepository.findByEmail(normalizedEmail);
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findById(id);
    return user ? this.sanitize(user) : null;
  }

  async findByIdOrFail(id: string): Promise<UserResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  private sanitize(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      createdAt: user.createdAt,
    };
  }
}
