import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@modules/users/entities/user.entity';
import { UsersModule } from '@modules/users/users.module';

import { AuthController } from './controllers/auth.controller';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET') ?? 'changeme';
        const expiresIn = configService.get<number>('JWT_EXPIRES_IN_SECONDS') ?? 3600;

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard, JwtAuthGuard, RefreshTokenRepository],
  exports: [AuthService, JwtStrategy, RolesGuard, JwtAuthGuard],
})
export class AuthModule {}
