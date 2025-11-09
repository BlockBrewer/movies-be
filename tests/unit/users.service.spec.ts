import { Test } from '@nestjs/testing';

import { RegisterRequestDto } from '../../src/modules/auth/dtos/register-request.dto';
import { UserRepository } from '../../src/modules/users/repositories/user.repository';
import { UsersService } from '../../src/modules/users/services/users.service';

jest.mock('../../src/shared/utils/password.util', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-pass'),
}));

const { hashPassword } = jest.requireMock('../../src/shared/utils/password.util') as {
  hashPassword: jest.Mock;
};

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  paginate: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repository: ReturnType<typeof mockUserRepository>;

  beforeEach(async () => {
    hashPassword.mockClear();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
    repository = moduleRef.get(UserRepository);
  });

  it('should create user and return saved entity', async () => {
    const dto: RegisterRequestDto = {
      email: 'USER@Example.com',
      password: 'Password1!',
      fullName: 'User Example',
    } as RegisterRequestDto;

    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockReturnValue({ id: '1', email: dto.email.toLowerCase() });
    repository.save.mockResolvedValue({ id: '1', email: dto.email.toLowerCase() });

    const saved = await service.create(dto);

    expect(repository.findByEmail).toHaveBeenCalledWith(dto.email.toLowerCase());
    // Password hashing is now handled by UserSubscriber.beforeInsert(), not in the service
    expect(hashPassword).not.toHaveBeenCalled();
    expect(repository.create).toHaveBeenCalledWith({
      email: dto.email.toLowerCase(),
      fullName: dto.fullName,
      password: dto.password,
      phoneNumber: undefined,
    });
    expect(repository.save).toHaveBeenCalled();
    expect(saved.email).toEqual(dto.email.toLowerCase());
  });

  it('should throw conflict when email already exists', async () => {
    const dto: RegisterRequestDto = {
      email: 'user@example.com',
      password: 'Password1!',
      fullName: 'User Example',
    } as RegisterRequestDto;

    repository.findByEmail.mockResolvedValue({ id: 'existing' });

    await expect(service.create(dto)).rejects.toThrow();
    expect(hashPassword).not.toHaveBeenCalled();
  });

  it('should return sanitized data on findAll', async () => {
    repository.paginate.mockResolvedValue({
      data: [
        {
          id: '1',
          email: 'user@example.com',
          fullName: 'User Example',
          roles: ['customer'],
          createdAt: new Date(),
          password: 'hashed',
        },
      ],
      total: 1,
    });

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data[0]).not.toHaveProperty('password');
  });

  it('should normalize email on lookup', async () => {
    repository.findByEmail.mockResolvedValue({ id: '1' });

    await service.findByEmail(' User@Example.COM ');

    expect(repository.findByEmail).toHaveBeenCalledWith('user@example.com');
  });
});
