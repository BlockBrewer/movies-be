import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { OpenTelemetryModule } from '@modules/metrics/opentelemetry.module';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: true }), OpenTelemetryModule],
  exports: [EventEmitterModule, OpenTelemetryModule],
})
export class ProvidersModule {}
