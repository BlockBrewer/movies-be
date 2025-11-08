import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'movie-be',
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 15000),
  dynamicConfigPath: process.env.DYNAMIC_CONFIG_PATH ?? 'config/runtime.json',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  name: process.env.DB_NAME ?? 'movie',
  logging: process.env.DB_LOGGING === 'true',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
}));

export const configurationLoaders = [appConfig, databaseConfig];
