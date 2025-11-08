import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MovieEntity } from '../entities/movie.entity';

@Injectable()
export class MovieRepository {
  constructor(
    @InjectRepository(MovieEntity)
    private readonly repository: Repository<MovieEntity>,
  ) {}

  create(data: Partial<MovieEntity>): MovieEntity {
    return this.repository.create(data);
  }

  save(entity: MovieEntity): Promise<MovieEntity> {
    return this.repository.save(entity);
  }

  findAll(): Promise<MovieEntity[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<MovieEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async existsWithTitle(title: string): Promise<boolean> {
    return (await this.repository.count({ where: { title } })) > 0;
  }
}
