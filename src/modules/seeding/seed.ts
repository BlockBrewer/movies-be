import { ConfigModule, ConfigService } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

import { configurationLoaders } from '@core/config/cache-config.service';
import { buildDataSourceOptions } from '@core/config/typeorm-config.service';

import { seedMovies } from '../../../db/seeds/seed-movies';
import { seedUsers } from '../../../db/seeds/seed-users';

async function bootstrap(): Promise<void> {
  dotenvConfig({ path: join(process.cwd(), '.env') });
  void ConfigModule.forRoot({ isGlobal: true, load: configurationLoaders });
  const configService = new ConfigService();

  const dataSource = new DataSource(buildDataSourceOptions(configService));
  await dataSource.initialize();

  await seedUsers(dataSource);
  await seedMovies(dataSource);

  await dataSource.destroy();
}

void bootstrap();
