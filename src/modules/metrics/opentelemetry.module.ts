import { Module, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NodeSDK } from '@opentelemetry/sdk-node';

@Module({})
export class OpenTelemetryModule implements OnApplicationBootstrap, OnApplicationShutdown {
  private sdk?: NodeSDK;

  constructor(private readonly configService: ConfigService) {}

  async onApplicationBootstrap(): Promise<void> {
    const collectorUrl = this.configService.get<string>('OTEL_EXPORTER_OTLP_ENDPOINT');

    this.sdk = new NodeSDK({
      traceExporter: collectorUrl ? new OTLPTraceExporter({ url: collectorUrl }) : undefined,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    await this.sdk.start();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.sdk?.shutdown();
  }
}
