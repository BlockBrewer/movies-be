import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import type { UploadedFile as UploadedFilePayload } from '@shared/types/uploaded-file.type';

import { S3ConfigService } from '@core/config/s3-config.service';

export interface FileValidationOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  required?: boolean;
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSize: number;
  private readonly allowedMimeTypes: string[];
  private readonly required: boolean;

  constructor(
    private readonly s3Config: S3ConfigService,
    options?: FileValidationOptions,
  ) {
    this.maxSize = options?.maxSize || this.s3Config.maxFileSize;
    this.allowedMimeTypes = options?.allowedMimeTypes || this.s3Config.allowedMimeTypes;
    this.required = options?.required !== undefined ? options.required : false;
  }

  transform(file: UploadedFilePayload | undefined): UploadedFilePayload {
    if (!file) {
      if (this.required) {
        throw new BadRequestException('File is required');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return file as any;
    }

    if (file.size > this.maxSize) {
      const maxSizeMB = (this.maxSize / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (this.containsPathTraversal(file.originalname)) {
      throw new BadRequestException('Invalid file name');
    }

    if (file.originalname.includes('\0')) {
      throw new BadRequestException('Invalid file name');
    }

    if (file.size === 0) {
      throw new BadRequestException('File is empty');
    }

    return file;
  }

  private containsPathTraversal(filename: string): boolean {
    const pathTraversalPatterns = ['../', '..\\', '%2e%2e/', '%2e%2e\\'];
    return pathTraversalPatterns.some((pattern) => filename.toLowerCase().includes(pattern));
  }
}
