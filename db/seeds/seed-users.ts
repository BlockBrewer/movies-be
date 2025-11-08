import { DataSource } from 'typeorm';
import { UserEntity } from '../../src/modules/users/entities/user.entity';
import { hashPassword } from '../../src/shared/utils/password.util';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(UserEntity);
  const admin = repository.create({
    email: 'admin@example.com',
    password: await hashPassword('Admin123!'),
    fullName: 'Administrator',
    roles: ['admin'],
  });

  await repository.save(admin);
}
