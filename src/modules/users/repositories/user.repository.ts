import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  create(data: Partial<UserEntity>): UserEntity {
    return this.repository.create(data);
  }

  save(entity: UserEntity): Promise<UserEntity> {
    return this.repository.save(entity);
  }

  async paginate(page: number, limit: number): Promise<{ data: UserEntity[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      withDeleted: false,
    });
    return { data, total };
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email } });
  }
}
