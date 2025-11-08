import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';

import { configurationLoaders } from '@core/config/cache-config.service';
import { CoreModule } from '@core/core.module';
import { HttpExceptionFilter } from '@core/filters/http-exception.filter';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { HealthModule } from '@modules/health/health.module';
import { MetricsModule } from '@modules/metrics/metrics.module';
import { MoviesModule } from '@modules/movies/movies.module';
import { UsersModule } from '@modules/users/users.module';
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: configurationLoaders,
    }),
    TerminusModule,
    CoreModule,
    SharedModule,
    MetricsModule,
    AuthModule,
    UsersModule,
    MoviesModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
