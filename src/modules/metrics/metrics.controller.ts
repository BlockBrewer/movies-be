import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Response } from 'express';

@Controller({ path: 'metrics', version: '1' })
export class MetricsController extends PrometheusController {
  @Get()
  @ApiExcludeEndpoint()
  override async index(@Res({ passthrough: true }) response: Response): Promise<string> {
    return super.index(response);
  }
}
