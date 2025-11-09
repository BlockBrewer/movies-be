import { ApiProperty } from '@nestjs/swagger';

import type { UploadedFile as UploadedFilePayload } from '@shared/types/uploaded-file.type';

export class UploadPosterDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Movie poster image file (JPEG, PNG, or WebP)',
  })
  file!: UploadedFilePayload;
}

export class UploadPosterResponseDto {
  @ApiProperty({ example: 'movies/posters/550e8400-e29b-41d4-a716-446655440000.jpg' })
  key!: string;

  @ApiProperty({
    example:
      'https://bucket-name.s3.region.amazonaws.com/movies/posters/550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  url!: string;

  @ApiProperty({ example: 'bucket-name' })
  bucket!: string;
}
