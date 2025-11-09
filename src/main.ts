import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

import { DynamicConfigService } from '@core/config/dynamic-config.service';
import { HttpExceptionFilter } from '@core/filters/http-exception.filter';
import { ResponseWrapperInterceptor } from '@core/interceptors/response-wrapper.interceptor';
import { TimeoutInterceptor } from '@core/interceptors/timeout.interceptor';
import { WinstonLoggerService } from '@core/logger/winston-logger.service';
import { RequestIdMiddleware } from '@core/middleware/request-id.middleware';
import { MetricsInterceptor } from '@modules/metrics/interceptors/metrics.interceptor';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const dynamicConfigService = app.get(DynamicConfigService);
  const port = configService.get<number>('app.port', { infer: true }) ?? 3025;

  app.useLogger(app.get(WinstonLoggerService));
  app.useGlobalFilters(new HttpExceptionFilter(app.get(WinstonLoggerService)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: true,
      validationError: { target: false },
    }),
  );

  app.useGlobalInterceptors(
    app.get(ResponseWrapperInterceptor),
    app.get(MetricsInterceptor),
    app.get(TimeoutInterceptor),
  );

  // Enable CORS with explicit configuration
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://d2vahum1kkb4av.amplifyapp.com',
    'https://main.d2vahum1kkb4av.amplifyapp.com',
    'https://api.movielist.shop',
  ];

  app.enableCors({
    origin: dynamicConfigService.get<string[]>('cors.allowedOrigins') ?? defaultOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 3600,
  });

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );
  app.use(compression());
  app.use(RequestIdMiddleware);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Movie Platform API')
    .setDescription('Enterprise-grade backend API for the movie platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  Logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
