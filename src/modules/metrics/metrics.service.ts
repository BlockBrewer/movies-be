import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram, Counter } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly httpDurationHistogram: Histogram<string>,
    @InjectMetric('http_requests_total')
    private readonly httpRequestCounter: Counter<string>,
  ) {}

  observeRequest(durationSeconds: number, labels: Record<string, string>): void {
    this.httpDurationHistogram.observe(labels, durationSeconds);
  }

  incrementRequest(labels: Record<string, string>): void {
    this.httpRequestCounter.inc(labels);
  }
}
