import { DataSource } from 'typeorm';

import { MovieEntity } from '../../src/modules/movies/entities/movie.entity';

export async function seedMovies(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(MovieEntity);

  const existing = await repository.count();
  if (existing > 0) {
    return;
  }

  const examples = [
    repository.create({
      title: 'The Matrix',
      publishingYear: 1999,
      posterUrl: 'https://example.com/posters/the-matrix.jpg',
    }),
    repository.create({
      title: 'Interstellar',
      publishingYear: 2014,
      posterUrl: 'https://example.com/posters/interstellar.jpg',
    }),
  ];

  await repository.save(examples);
}
