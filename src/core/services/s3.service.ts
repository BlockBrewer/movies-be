import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { S3ConfigService } from '../config/s3-config.service';

export interface UploadFileOptions {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder?: string;
}

export interface S3UploadResult {
  key: string;
  url: string;
  bucket: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client | null;

  constructor(private readonly s3Config: S3ConfigService) {
    if (this.s3Config.isConfigured) {
      this.s3Client = new S3Client({
        region: this.s3Config.region,
        credentials: {
          accessKeyId: this.s3Config.accessKeyId,
          secretAccessKey: this.s3Config.secretAccessKey,
        },
      });
      this.logger.log('S3 client initialized successfully');
    } else {
      this.s3Client = null;
      this.logger.warn('S3 client not initialized - configuration missing');
    }
  }

  private ensureConfigured(): void {
    if (!this.s3Client) {
      throw new InternalServerErrorException(
        'S3 is not configured. Please set AWS environment variables.',
      );
    }
  }

  async uploadFile(options: UploadFileOptions): Promise<S3UploadResult> {
    this.ensureConfigured();
    const { buffer, originalName, mimeType, folder } = options;

    try {
      const fileExtension = this.getFileExtension(originalName);
      const uniqueFileName = `${randomUUID()}${fileExtension}`;
      const folderPath = folder || this.s3Config.uploadFolder;
      const key = `${folderPath}/${uniqueFileName}`;

      this.logger.log(`Uploading file to S3: ${key}`);

      const command = new PutObjectCommand({
        Bucket: this.s3Config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ServerSideEncryption: 'AES256',
        CacheControl: 'max-age=31536000',
        Metadata: {
          originalName,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client!.send(command);

      const url = `${this.s3Config.bucketUrl}/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        key,
        url,
        bucket: this.s3Config.bucketName,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error}`);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async deleteFile(key: string): Promise<void> {
    this.ensureConfigured();
    try {
      this.logger.log(`Deleting file from S3: ${key}`);

      const command = new DeleteObjectCommand({
        Bucket: this.s3Config.bucketName,
        Key: key,
      });

      await this.s3Client!.send(command);

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${error}`);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    this.ensureConfigured();
    try {
      const command = new GetObjectCommand({
        Bucket: this.s3Config.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client!, command, {
        expiresIn: expiresIn || this.s3Config.signedUrlExpiration,
      });

      return url;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error}`);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }

  async fileExists(key: string): Promise<boolean> {
    this.ensureConfigured();
    try {
      const command = new HeadObjectCommand({
        Bucket: this.s3Config.bucketName,
        Key: key,
      });

      await this.s3Client!.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  extractKeyFromUrl(url: string): string | null {
    try {
      const bucketUrl = this.s3Config.bucketUrl;
      if (url.startsWith(bucketUrl)) {
        return url.replace(`${bucketUrl}/`, '');
      }
      const urlPattern = new RegExp(
        `https://${this.s3Config.bucketName}\\.s3\\.([a-z0-9-]+)\\.amazonaws\\.com/(.+)`,
      );
      const match = url.match(urlPattern);
      return match ? match[2] : null;
    } catch {
      return null;
    }
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    if (parts.length > 1) {
      return `.${parts[parts.length - 1].toLowerCase()}`;
    }
    return '';
  }
}
