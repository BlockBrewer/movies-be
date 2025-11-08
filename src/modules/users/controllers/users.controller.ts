import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '@modules/auth/decorators/roles.decorator';
import { ROLES } from '@shared/constants/roles.constant';
import { PaginationQueryDto } from '@shared/dtos/pagination-query.dto';

import { UserResponseDto } from '../dtos/user-response.dto';
import { UsersService } from '../services/users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(ROLES.ADMIN)
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<{ data: UserResponseDto[]; total: number; page: number; limit: number }> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserResponseDto> {
    return this.usersService.findByIdOrFail(id);
  }
}
