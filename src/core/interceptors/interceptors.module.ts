import { Global, Module } from '@nestjs/common';

import { ResponseWrapperInterceptor } from './response-wrapper.interceptor';
import { TimeoutInterceptor } from './timeout.interceptor';

@Global()
@Module({
  providers: [ResponseWrapperInterceptor, TimeoutInterceptor],
  exports: [ResponseWrapperInterceptor, TimeoutInterceptor],
})
export class InterceptorsModule {}
