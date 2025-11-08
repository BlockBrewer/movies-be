import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { RefreshTokenEntity } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly repository: Repository<RefreshTokenEntity>,
    private readonly configService: ConfigService,
  ) {}

  async createAndSave(userId: string): Promise<RefreshTokenEntity> {
    const ttl = this.configService.get<number>('REFRESH_TOKEN_TTL_SECONDS') ?? 604800;
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const token = this.repository.create({ userId, expiresAt });
    return this.repository.save(token);
  }

  async findValid(token: string): Promise<RefreshTokenEntity | null> {
    return this.repository.findOne({
      where: { token, isRevoked: false, expiresAt: MoreThan(new Date()) },
    });
  }

  async invalidate(id: string): Promise<void> {
    await this.repository.update(id, { isRevoked: true });
  }
}
