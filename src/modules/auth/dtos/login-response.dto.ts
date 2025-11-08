import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken!: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken!: string;

  @ApiProperty({ description: 'Token expiration in seconds' })
  expiresIn!: number;
}
