import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';

import { WinstonLoggerService } from './winston-logger.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('app.env');
        return {
          transports: [
            new transports.Console({
              level: env === 'production' ? 'info' : 'debug',
              format: format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                format.json(),
              ),
            }),
          ],
        };
      },
    }),
  ],
  providers: [WinstonLoggerService],
  exports: [WinstonLoggerService],
})
export class WinstonLoggerModule {}
