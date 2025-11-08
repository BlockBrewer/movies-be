import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { RefreshTokenRepository } from '../../src/modules/auth/repositories/refresh-token.repository';
import { AuthService } from '../../src/modules/auth/services/auth.service';
import { UserResponseDto } from '../../src/modules/users/dtos/user-response.dto';
import { UserEntity } from '../../src/modules/users/entities/user.entity';
import { UsersService } from '../../src/modules/users/services/users.service';

jest.mock('bcryptjs', () => ({ compare: jest.fn().mockResolvedValue(true) }));

const userFixture: UserEntity = {
  id: 'uuid-user',
  email: 'user@example.com',
  roles: ['customer'],
  password: 'hashed',
  fullName: 'User Example',
  phoneNumber: undefined,
  refreshTokens: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let refreshTokenRepository: RefreshTokenRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(userFixture),
            findByEmail: jest.fn().mockResolvedValue({ ...userFixture }),
            findById: jest.fn().mockResolvedValue({
              id: userFixture.id,
              roles: userFixture.roles,
            } as UserResponseDto),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('access-token') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(3600) },
        },
        {
          provide: RefreshTokenRepository,
          useValue: {
            createAndSave: jest.fn().mockResolvedValue({ token: 'refresh-token' }),
            findValid: jest.fn(),
            invalidate: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);
    jwtService = moduleRef.get(JwtService);
    refreshTokenRepository = moduleRef.get(RefreshTokenRepository);
  });

  it('should register and return tokens', async () => {
    const response = await authService.register({
      email: 'user@example.com',
      password: 'Password1!',
      fullName: 'User Example',
    });

    expect(response).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600,
    });
    expect(usersService.create).toHaveBeenCalled();
  });

  it('should login and return tokens', async () => {
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ ...userFixture } as UserEntity);
    jest
      .spyOn(refreshTokenRepository, 'createAndSave')
      .mockResolvedValue({ token: 'refresh-token' } as never);
    const response = await authService.login({ email: 'user@example.com', password: 'Password1!' });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: userFixture.id,
      roles: userFixture.roles,
    });
    expect(response.refreshToken).toBe('refresh-token');
  });
});
