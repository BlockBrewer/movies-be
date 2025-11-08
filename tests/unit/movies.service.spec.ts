import { Test } from '@nestjs/testing';

import { CreateMovieDto } from '../../src/modules/movies/dtos/create-movie.dto';
import { UpdateMovieDto } from '../../src/modules/movies/dtos/update-movie.dto';
import { MovieRepository } from '../../src/modules/movies/repositories/movie.repository';
import { MoviesService } from '../../src/modules/movies/services/movies.service';

const movieFixture = {
  id: 'movie-uuid',
  title: 'The Matrix',
  publishingYear: 1999,
  posterUrl: 'https://example.com/matrix.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: jest.Mocked<MovieRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: MovieRepository,
          useValue: {
            existsWithTitle: jest.fn().mockResolvedValue(false),
            create: jest.fn().mockReturnValue({ ...movieFixture }),
            save: jest.fn().mockResolvedValue({ ...movieFixture }),
            findAll: jest.fn().mockResolvedValue([movieFixture]),
            findById: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(MoviesService);
    repository = moduleRef.get(MovieRepository) as jest.Mocked<MovieRepository>;
  });

  it('creates a movie', async () => {
    const dto: CreateMovieDto = {
      title: 'The Matrix',
      publishingYear: 1999,
      posterUrl: 'https://example.com/matrix.jpg',
    };

    const result = await service.create(dto);

    expect(repository.existsWithTitle).toHaveBeenCalledWith(dto.title);
    expect(repository.save).toHaveBeenCalled();
    expect(result.title).toEqual(dto.title);
  });

  it('finds all movies', async () => {
    const result = await service.findAll();

    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('updates a movie', async () => {
    repository.findById.mockResolvedValue({ ...movieFixture });

    const payload: UpdateMovieDto = { posterUrl: 'https://example.com/new.jpg' };
    repository.save.mockResolvedValue({
      ...movieFixture,
      posterUrl: payload.posterUrl ?? movieFixture.posterUrl,
    });

    const result = await service.update(movieFixture.id, payload);

    expect(repository.save).toHaveBeenCalled();
    expect(result.posterUrl).toEqual(payload.posterUrl);
  });
});
