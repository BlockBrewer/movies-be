import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeHistogramProvider,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';

import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [PrometheusModule.register()],
  controllers: [MetricsController],
  providers: [
    MetricsService,
    MetricsInterceptor,
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request latency in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.1, 0.3, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path'],
    }),
  ],
  exports: [MetricsService, MetricsInterceptor],
})
export class MetricsModule {}
