import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateMovieWithUploadDto {
  @ApiProperty({ example: 'Inception' })
  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 2010 })
  @Type(() => Number)
  @IsInt()
  @Min(1888)
  @Max(new Date().getFullYear() + 1)
  publishingYear!: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Movie poster image file (optional, JPEG, PNG, or WebP)',
    required: false,
  })
  @IsOptional()
  poster?: Express.Multer.File;
}
