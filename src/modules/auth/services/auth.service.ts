import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

import { UserResponseDto } from '@modules/users/dtos/user-response.dto';
import { UserEntity } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/services/users.service';

import { LoginRequestDto } from '../dtos/login-request.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { RegisterRequestDto } from '../dtos/register-request.dto';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(dto: RegisterRequestDto): Promise<LoginResponseDto> {
    const user = await this.usersService.create(dto);
    return this.buildAuthResponse({
      id: user.id,
      roles: user.roles,
    });
  }

  async login({ email, password }: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse({ id: user.id, roles: user.roles });
  }

  private async buildAuthResponse(
    user: Pick<UserEntity, 'id' | 'roles'>,
  ): Promise<LoginResponseDto> {
    const payload = { sub: user.id, roles: user.roles };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.issueRefreshToken(user.id);

    this.eventEmitter.emit('audit.user.login', { userId: user.id, roles: user.roles });

    const expiresInConfig = this.configService.get<string>('JWT_EXPIRES_IN_SECONDS');
    const expiresIn = expiresInConfig ? Number(expiresInConfig) : 3600;

    return {
      accessToken,
      refreshToken,
      expiresIn,
    } satisfies LoginResponseDto;
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const token = await this.refreshTokenRepository.createAndSave(userId);

    return token.token;
  }

  async validateUser(userId: string): Promise<UserResponseDto | null> {
    return this.usersService.findById(userId);
  }

  async refreshToken(token: string): Promise<LoginResponseDto> {
    const stored = await this.refreshTokenRepository.findValid(token);

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.refreshTokenRepository.invalidate(stored.id);
    return this.buildAuthResponse(user);
  }
}
