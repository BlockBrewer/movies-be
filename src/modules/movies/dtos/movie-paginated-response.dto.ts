import { ApiProperty } from '@nestjs/swagger';

import { MovieResponseDto } from './movie-response.dto';

export class MoviePaginatedResponseDto {
  @ApiProperty({ type: [MovieResponseDto] })
  data!: MovieResponseDto[];

  @ApiProperty({ description: 'Total number of movies available' })
  total!: number;

  @ApiProperty({ description: 'Current page index (1-based)' })
  page!: number;

  @ApiProperty({ description: 'Number of items returned per page' })
  limit!: number;
}


