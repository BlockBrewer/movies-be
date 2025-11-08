import { Global, Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@core/filters/http-exception.filter';

@Global()
@Module({
  providers: [HttpExceptionFilter],
  exports: [HttpExceptionFilter],
})
export class ExceptionsModule {}
