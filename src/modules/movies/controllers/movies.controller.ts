import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { S3ConfigService } from '@core/config/s3-config.service';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { ROLES } from '@shared/constants/roles.constant';
import { FileValidationPipe } from '@shared/pipes/file-validation.pipe';

import { CreateMovieWithUploadDto } from '../dtos/create-movie-with-upload.dto';
import { CreateMovieDto } from '../dtos/create-movie.dto';
import { MovieResponseDto } from '../dtos/movie-response.dto';
import { UpdateMovieDto } from '../dtos/update-movie.dto';
import { UploadPosterResponseDto } from '../dtos/upload-poster.dto';
import { MoviesService } from '../services/movies.service';

@ApiTags('Movies')
@ApiBearerAuth()
@Controller({ path: 'movies', version: '1' })
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly s3ConfigService: S3ConfigService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new movie (URL-based poster)',
    description:
      'Creates a movie with a poster URL. Use /with-upload endpoint to upload poster files.',
  })
  @ApiResponse({ status: 201, description: 'Movie created successfully', type: MovieResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'Movie with this title already exists' })
  async create(@Body() dto: CreateMovieDto): Promise<MovieResponseDto> {
    return this.moviesService.create(dto);
  }

  @Post('with-upload')
  @UseInterceptors(FileInterceptor('poster'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new movie with poster upload',
    description:
      'Creates a movie and uploads the poster to S3. The poster file is optional. Accepts JPEG, PNG, and WebP images up to 5MB.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'publishingYear'],
      properties: {
        title: {
          type: 'string',
          description: 'Movie title',
          example: 'Inception',
        },
        publishingYear: {
          type: 'integer',
          description: 'Year the movie was published',
          example: 2010,
          minimum: 1888,
        },
        poster: {
          type: 'string',
          format: 'binary',
          description: 'Movie poster image file (optional, max 5MB, JPEG/PNG/WebP)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Movie created successfully with poster',
    type: MovieResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or file validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'Movie with this title already exists' })
  @ApiResponse({ status: 500, description: 'Failed to upload file to S3' })
  async createWithUpload(
    @Body() dto: CreateMovieWithUploadDto,
    @UploadedFile() poster?: Express.Multer.File,
  ): Promise<MovieResponseDto> {
    if (poster) {
      const validationPipe = new FileValidationPipe(this.s3ConfigService, { required: false });
      validationPipe.transform(poster);
    }
    return this.moviesService.createWithUpload(dto, poster);
  }

  @Post('upload-poster')
  @Roles(ROLES.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a movie poster to S3',
    description:
      'Uploads a poster image to S3 and returns the URL. This endpoint only uploads the file without creating a movie record. Maximum file size: 5MB. Supported formats: JPEG, PNG, WebP.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Movie poster image file (required, max 5MB, JPEG/PNG/WebP)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Poster uploaded successfully',
    type: UploadPosterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'File validation failed or file is required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 500, description: 'Failed to upload file to S3' })
  async uploadPoster(@UploadedFile() file?: Express.Multer.File): Promise<UploadPosterResponseDto> {
    const validationPipe = new FileValidationPipe(this.s3ConfigService, { required: true });
    const validatedFile = validationPipe.transform(file);
    return this.moviesService.uploadPoster(validatedFile);
  }

  @Get()
  @ApiOperation({ summary: 'Get all movies', description: 'Returns a list of all movies' })
  @ApiResponse({
    status: 200,
    description: 'Movies retrieved successfully',
    type: [MovieResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<MovieResponseDto[]> {
    return this.moviesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a movie by ID', description: 'Returns a single movie by its UUID' })
  @ApiResponse({ status: 200, description: 'Movie found', type: MovieResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<MovieResponseDto> {
    return this.moviesService.findById(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('poster'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Update a movie',
    description:
      'Updates movie details and optionally replaces the poster. You can update the poster in two ways: 1) Upload a new file (recommended) - old S3 poster is automatically deleted. 2) Provide a posterUrl - useful for external URLs or to clear the poster. File upload takes precedence if both are provided.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Movie title (optional)',
          example: 'Inception - Updated',
        },
        publishingYear: {
          type: 'integer',
          description: 'Year the movie was published (optional)',
          example: 2010,
          minimum: 1888,
        },
        posterUrl: {
          type: 'string',
          description:
            'Movie poster URL (optional). Use this to set an external URL or empty string to clear. If a file is also uploaded, the file takes precedence.',
          example: 'https://example.com/posters/inception.jpg',
        },
        poster: {
          type: 'string',
          format: 'binary',
          description:
            'Upload a new movie poster file (optional, max 5MB, JPEG/PNG/WebP). Takes precedence over posterUrl. Old S3 poster is automatically deleted.',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Movie updated successfully', type: MovieResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input or file validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({ status: 409, description: 'Movie with this title already exists' })
  @ApiResponse({ status: 500, description: 'Failed to upload file to S3' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateMovieDto,
    @UploadedFile() poster?: Express.Multer.File,
  ): Promise<MovieResponseDto> {
    if (poster) {
      const validationPipe = new FileValidationPipe(this.s3ConfigService, { required: false });
      validationPipe.transform(poster);
    }
    return this.moviesService.update(id, dto, poster);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a movie',
    description: 'Soft deletes a movie and automatically removes the associated poster from S3.',
  })
  @ApiResponse({ status: 200, description: 'Movie deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.moviesService.remove(id);
  }
}
