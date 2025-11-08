import { Global, Module } from '@nestjs/common';

import { DatabaseModule } from './config/database.module';
import { DynamicConfigService } from './config/dynamic-config.service';
import { ExceptionsModule } from './exceptions/exceptions.module';
import { InterceptorsModule } from './interceptors/interceptors.module';
import { WinstonLoggerModule } from './logger/winston-logger.module';
import { PipesModule } from './pipes/pipes.module';
import { ProvidersModule } from './providers/providers.module';

@Global()
@Module({
  imports: [
    WinstonLoggerModule,
    DatabaseModule,
    ExceptionsModule,
    InterceptorsModule,
    PipesModule,
    ProvidersModule,
  ],
  providers: [DynamicConfigService],
  exports: [
    WinstonLoggerModule,
    DatabaseModule,
    ExceptionsModule,
    InterceptorsModule,
    PipesModule,
    ProvidersModule,
    DynamicConfigService,
  ],
})
export class CoreModule {}
