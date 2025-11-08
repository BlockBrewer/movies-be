import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { S3ConfigService } from './config/s3-config.service';
import { S3Service } from './services/s3.service';

@Module({
  imports: [ConfigModule],
  providers: [S3ConfigService, S3Service],
  exports: [S3ConfigService, S3Service],
})
export class S3Module {}
