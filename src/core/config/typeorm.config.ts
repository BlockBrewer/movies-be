import { ConfigModule, ConfigService } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

import { configurationLoaders } from './cache-config.service';
import { buildDataSourceOptions } from './typeorm-config.service';

dotenvConfig({ path: join(process.cwd(), '.env') });

void ConfigModule.forRoot({
  isGlobal: true,
  load: configurationLoaders,
});

const configService = new ConfigService();

export default new DataSource(buildDataSourceOptions(configService));
