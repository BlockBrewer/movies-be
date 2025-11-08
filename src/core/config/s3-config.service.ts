import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3ConfigService {
  private readonly logger = new Logger(S3ConfigService.name);

  constructor(private readonly configService: ConfigService) {
    this.validateConfiguration();
  }

  private validateConfiguration(): void {
    const requiredVars = [
      'AWS_REGION',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_S3_BUCKET_NAME',
    ];
    const missing = requiredVars.filter((key) => !this.configService.get(key));

    if (missing.length > 0) {
      this.logger.warn(
        `S3 configuration incomplete. Missing: ${missing.join(', ')}. S3 features will be disabled.`,
      );
    }
  }

  get isConfigured(): boolean {
    return !!(
      this.configService.get('AWS_REGION') &&
      this.configService.get('AWS_ACCESS_KEY_ID') &&
      this.configService.get('AWS_SECRET_ACCESS_KEY') &&
      this.configService.get('AWS_S3_BUCKET_NAME')
    );
  }

  get region(): string {
    return this.configService.get<string>('AWS_REGION', 'us-east-1');
  }

  get accessKeyId(): string {
    return this.configService.get<string>('AWS_ACCESS_KEY_ID', '');
  }

  get secretAccessKey(): string {
    return this.configService.get<string>('AWS_SECRET_ACCESS_KEY', '');
  }

  get bucketName(): string {
    return this.configService.get<string>('AWS_S3_BUCKET_NAME', 'default-bucket');
  }

  get bucketUrl(): string {
    const customUrl = this.configService.get<string>('AWS_S3_BUCKET_URL');
    if (customUrl) {
      return customUrl;
    }
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com`;
  }

  get maxFileSize(): number {
    return this.configService.get<number>('S3_MAX_FILE_SIZE') || 5 * 1024 * 1024;
  }

  get allowedMimeTypes(): string[] {
    const types = this.configService.get<string>('S3_ALLOWED_MIME_TYPES');
    if (types) {
      return types.split(',').map((type) => type.trim());
    }
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  }

  get signedUrlExpiration(): number {
    return this.configService.get<number>('S3_SIGNED_URL_EXPIRATION') || 3600;
  }

  get uploadFolder(): string {
    return this.configService.get<string>('S3_UPLOAD_FOLDER') || 'movies/posters';
  }
}
