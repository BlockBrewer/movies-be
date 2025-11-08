import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { CreateMovieDto } from './create-movie.dto';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Movie poster image file (optional, JPEG, PNG, or WebP)',
    required: false,
  })
  @IsOptional()
  poster?: Express.Multer.File;
}
