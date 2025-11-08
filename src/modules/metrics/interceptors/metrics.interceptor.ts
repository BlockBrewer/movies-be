import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { MetricsService } from '../metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.route?.path ?? request.url;
    const start = process.hrtime.bigint();

    this.metricsService.incrementRequest({ method, path });

    return next.handle().pipe(
      tap(() => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1e9;
        this.metricsService.observeRequest(duration, { method, path });
      }),
    );
  }
}
