import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { entities } from './entities';

interface DatabaseConfig {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  name?: string;
  logging?: boolean;
  synchronize?: boolean;
}

const MIGRATION_PATHS = [
  process.env.NODE_ENV === 'production' ? 'dist/db/migrations/*.js' : 'src/db/migrations/*.ts',
];

export const buildDataSourceOptions = (configService: ConfigService): DataSourceOptions => {
  const database = configService.get<DatabaseConfig>('database');

  const baseOptions: DataSourceOptions = database?.url
    ? {
        type: 'postgres',
        url: database.url,
        logging: database.logging,
        synchronize: database.synchronize ?? false,
      }
    : {
        type: 'postgres',
        host: database?.host ?? 'localhost',
        port: database?.port ?? 5432,
        username: database?.username ?? 'postgres',
        password: database?.password ?? 'postgres',
        database: database?.name ?? 'movie',
        logging: database?.logging,
        synchronize: database?.synchronize ?? false,
      };

  return {
    ...baseOptions,
    namingStrategy: new SnakeNamingStrategy(),
    uuidExtension: 'uuid-ossp',
    migrations: MIGRATION_PATHS,
    migrationsRun: false,
    entities,
  } satisfies DataSourceOptions;
};

@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const options = buildDataSourceOptions(this.configService);
    return {
      ...options,
      autoLoadEntities: false,
    } satisfies TypeOrmModuleOptions;
  }
}
