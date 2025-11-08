import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';

interface DynamicConfigStore {
  [key: string]: unknown;
}

@Injectable()
export class DynamicConfigService implements OnModuleInit {
  private readonly cache = new Map<string, unknown>();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const path = this.configService.get<string>('app.dynamicConfigPath');
    if (!path) {
      return;
    }

    try {
      const absolute = join(process.cwd(), path);
      const fileContent = await fs.readFile(absolute, 'utf-8');
      const parsed = JSON.parse(fileContent) as DynamicConfigStore;
      Object.entries(parsed).forEach(([key, value]) => {
        this.cache.set(key, value);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Dynamic config load failed', error);
    }
  }

  get<T>(key: string, defaultValue?: T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    return this.configService.get<T>(key) ?? (defaultValue as T);
  }
}
