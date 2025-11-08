import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { S3Module } from '@core/s3.module';

import { MoviesController } from './controllers/movies.controller';
import { MovieEntity } from './entities/movie.entity';
import { MovieRepository } from './repositories/movie.repository';
import { MoviesService } from './services/movies.service';

@Module({
  imports: [TypeOrmModule.forFeature([MovieEntity]), S3Module],
  controllers: [MoviesController],
  providers: [MoviesService, MovieRepository],
  exports: [MoviesService, MovieRepository],
})
export class MoviesModule {}
