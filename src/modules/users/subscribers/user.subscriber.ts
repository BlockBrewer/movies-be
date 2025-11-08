import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EventSubscriber, EntitySubscriberInterface, InsertEvent } from 'typeorm';

import { hashPassword } from '@shared/utils/password.util';

import { UserEntity } from '../entities/user.entity';

@EventSubscriber()
@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo(): typeof UserEntity {
    return UserEntity;
  }

  async beforeInsert(event: InsertEvent<UserEntity>): Promise<void> {
    if (event.entity.password) {
      event.entity.password = await hashPassword(event.entity.password);
    }
  }
}
