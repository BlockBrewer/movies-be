import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUrl, Max, Min, MinLength } from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ example: 'Inception' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ example: 2010 })
  @IsInt()
  @Min(1888)
  @Max(new Date().getFullYear() + 1)
  publishingYear!: number;

  @ApiProperty({ example: 'https://example.com/posters/inception.jpg' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  posterUrl!: string;
}
