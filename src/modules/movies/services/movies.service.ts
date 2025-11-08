import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { S3Service } from '@core/services/s3.service';

import { CreateMovieWithUploadDto } from '../dtos/create-movie-with-upload.dto';
import { CreateMovieDto } from '../dtos/create-movie.dto';
import { MovieResponseDto } from '../dtos/movie-response.dto';
import { UpdateMovieDto } from '../dtos/update-movie.dto';
import { UploadPosterResponseDto } from '../dtos/upload-poster.dto';
import { MovieEntity } from '../entities/movie.entity';
import { MovieRepository } from '../repositories/movie.repository';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly s3Service: S3Service,
  ) {}

  async create(dto: CreateMovieDto): Promise<MovieResponseDto> {
    const titleExists = await this.movieRepository.existsWithTitle(dto.title);
    if (titleExists) {
      throw new ConflictException(`Movie titled "${dto.title}" already exists`);
    }

    const movie = this.movieRepository.create({
      title: dto.title.trim(),
      publishingYear: dto.publishingYear,
      posterUrl: dto.posterUrl,
    });

    const saved = await this.movieRepository.save(movie);
    return this.mapToResponse(saved);
  }

  async createWithUpload(
    dto: CreateMovieWithUploadDto,
    poster?: Express.Multer.File,
  ): Promise<MovieResponseDto> {
    const titleExists = await this.movieRepository.existsWithTitle(dto.title);
    if (titleExists) {
      throw new ConflictException(`Movie titled "${dto.title}" already exists`);
    }

    let posterUrl = '';

    if (poster) {
      const uploadResult = await this.s3Service.uploadFile({
        buffer: poster.buffer,
        originalName: poster.originalname,
        mimeType: poster.mimetype,
      });
      posterUrl = uploadResult.url;
      this.logger.log(`Poster uploaded for movie "${dto.title}": ${posterUrl}`);
    }

    const movie = this.movieRepository.create({
      title: dto.title.trim(),
      publishingYear: dto.publishingYear,
      posterUrl,
    });

    const saved = await this.movieRepository.save(movie);
    return this.mapToResponse(saved);
  }

  async uploadPoster(file: Express.Multer.File): Promise<UploadPosterResponseDto> {
    const uploadResult = await this.s3Service.uploadFile({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });

    this.logger.log(`Poster uploaded: ${uploadResult.key}`);

    return {
      key: uploadResult.key,
      url: uploadResult.url,
      bucket: uploadResult.bucket,
    };
  }

  async findAll(): Promise<MovieResponseDto[]> {
    const movies = await this.movieRepository.findAll();
    return movies.map((movie) => this.mapToResponse(movie));
  }

  async findById(id: string): Promise<MovieResponseDto> {
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new NotFoundException(`Movie ${id} not found`);
    }

    return this.mapToResponse(movie);
  }

  async update(
    id: string,
    dto: UpdateMovieDto,
    poster?: Express.Multer.File,
  ): Promise<MovieResponseDto> {
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new NotFoundException(`Movie ${id} not found`);
    }

    if (dto.title && dto.title !== movie.title) {
      const titleExists = await this.movieRepository.existsWithTitle(dto.title);
      if (titleExists) {
        throw new ConflictException(`Movie titled "${dto.title}" already exists`);
      }
      movie.title = dto.title.trim();
    }

    if (dto.publishingYear !== undefined) {
      movie.publishingYear = dto.publishingYear;
    }

    if (poster) {
      if (movie.posterUrl) {
        await this.deleteOldPoster(movie.posterUrl);
      }

      const uploadResult = await this.s3Service.uploadFile({
        buffer: poster.buffer,
        originalName: poster.originalname,
        mimeType: poster.mimetype,
      });
      movie.posterUrl = uploadResult.url;
      this.logger.log(`Poster file uploaded for movie ${id}: ${uploadResult.url}`);
    } else if (dto.posterUrl !== undefined) {
      if (movie.posterUrl && dto.posterUrl !== movie.posterUrl) {
        await this.deleteOldPoster(movie.posterUrl);
      }
      movie.posterUrl = dto.posterUrl;
      this.logger.log(`Poster URL updated for movie ${id}: ${dto.posterUrl || 'removed'}`);
    }

    const updated = await this.movieRepository.save(movie);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new NotFoundException(`Movie ${id} not found`);
    }

    if (movie.posterUrl) {
      await this.deleteOldPoster(movie.posterUrl);
    }

    await this.movieRepository.remove(id);
  }

  private async deleteOldPoster(posterUrl: string): Promise<void> {
    try {
      const key = this.s3Service.extractKeyFromUrl(posterUrl);
      if (key) {
        await this.s3Service.deleteFile(key);
        this.logger.log(`Deleted old poster from S3: ${key}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to delete old poster from S3: ${error}`);
    }
  }

  private mapToResponse(movie: MovieEntity): MovieResponseDto {
    return {
      id: movie.id,
      title: movie.title,
      publishingYear: movie.publishingYear,
      posterUrl: movie.posterUrl,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
    } satisfies MovieResponseDto;
  }
}
