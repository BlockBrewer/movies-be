import { ApiProperty } from '@nestjs/swagger';

import { Role } from '@shared/constants/roles.constant';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ type: [String] })
  roles!: Role[];

  @ApiProperty()
  createdAt!: Date;
}
