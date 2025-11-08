import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

import { WinstonLoggerService } from '@core/logger/winston-logger.service';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
  requestId?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    const errorResponse: ErrorResponseBody = {
      statusCode: status,
      message: this.extractMessage(message),
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.headers['x-request-id'] as string,
    };

    this.logger.error('Handled exception', JSON.stringify(errorResponse), HttpExceptionFilter.name);
    response.status(status).json(errorResponse);
  }

  private extractMessage(response: string | object): string | string[] {
    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && 'message' in response) {
      const message = (response as Record<string, unknown>).message;
      return Array.isArray(message) ? message : (message as string);
    }

    return 'Unexpected error';
  }
}
