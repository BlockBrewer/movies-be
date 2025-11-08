import { ApiProperty } from '@nestjs/swagger';

export class MovieResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  publishingYear!: number;

  @ApiProperty({ description: 'URL where the poster image is stored' })
  posterUrl!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
