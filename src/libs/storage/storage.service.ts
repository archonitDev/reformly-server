import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type PresignMethod = 'getObject' | 'putObject';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string | null;

  constructor(private readonly configService: ConfigService) {
    const storage = this.configService.get('storage');

    this.bucket = storage.bucket;
    this.publicBaseUrl = storage.publicBaseUrl;

    this.client = new S3Client({
      region: storage.region || 'us-east-1',
      endpoint: storage.endpoint,
      forcePathStyle: Boolean(storage.forcePathStyle),
      credentials: {
        accessKeyId: storage.accessKeyId,
        secretAccessKey: storage.secretAccessKey,
      },
    });
  }

  async ensureBucketExists(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (err: unknown) {
      const error = err as { $metadata?: { httpStatusCode?: number } };
      if (error?.$metadata?.httpStatusCode === 404) {
        await this.client.send(
          new CreateBucketCommand({ Bucket: this.bucket }),
        );
        this.logger.log(`Created bucket: ${this.bucket}`);
      } else {
        throw err;
      }
    }
  }

  async uploadObject(params: {
    key: string;
    body: Buffer | Uint8Array | Blob | string;
    contentType?: string;
    cacheControl?: string;
  }): Promise<{ key: string; url: string | null }> {
    const { key, body, contentType, cacheControl } = params;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body as Buffer<ArrayBufferLike>,
        ContentType: contentType,
        CacheControl: cacheControl,
      }),
    );

    return { key, url: this.getPublicUrl(key) };
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async getPresignedUrl(params: {
    key: string;
    expiresInSeconds?: number;
    method: PresignMethod;
    contentType?: string;
  }): Promise<string> {
    const { key, expiresInSeconds = 900, method, contentType } = params;

    if (method === 'putObject') {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });
      return getSignedUrl(this.client, command, {
        expiresIn: expiresInSeconds,
      });
    }

    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  getPublicUrl(key: string): string | null {
    if (!this.publicBaseUrl) return null;

    const trimmedBase = this.publicBaseUrl.replace(/\/$/, '');
    // if base already contains bucket, avoid duplicating
    const containsBucket = new RegExp(`/${this.bucket}(/|$)`).test(trimmedBase);
    if (containsBucket) {
      return `${trimmedBase}/${key}`;
    }
    return `${trimmedBase}/${this.bucket}/${key}`;
  }

  /**
   * Initiates a multipart upload and returns the upload ID
   */
  async initiateMultipartUpload(params: {
    key: string;
    contentType?: string;
  }): Promise<{ uploadId: string; key: string }> {
    const { key, contentType } = params;

    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const response = await this.client.send(command);

    if (!response.UploadId) {
      throw new Error('Failed to initiate multipart upload');
    }

    this.logger.log(`Initiated multipart upload for key: ${key}`);
    return { uploadId: response.UploadId, key };
  }

  /**
   * Uploads a single part of a multipart upload
   */
  async uploadPart(params: {
    key: string;
    uploadId: string;
    partNumber: number;
    body: Buffer;
  }): Promise<{ ETag: string; PartNumber: number }> {
    const { key, uploadId, partNumber, body } = params;

    const command = new UploadPartCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: body,
    });

    const response = await this.client.send(command);

    if (!response.ETag) {
      throw new Error(`Failed to upload part ${partNumber}`);
    }

    this.logger.log(`Uploaded part ${partNumber} for key: ${key}`);
    return { ETag: response.ETag, PartNumber: partNumber };
  }

  /**
   * Completes a multipart upload
   */
  async completeMultipartUpload(params: {
    key: string;
    uploadId: string;
    parts: Array<{ ETag: string; PartNumber: number }>;
  }): Promise<{ key: string; url: string | null }> {
    const { key, uploadId, parts } = params;

    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
      },
    });

    await this.client.send(command);

    this.logger.log(`Completed multipart upload for key: ${key}`);
    return { key, url: this.getPublicUrl(key) };
  }

  /**
   * Aborts a multipart upload
   */
  async abortMultipartUpload(params: {
    key: string;
    uploadId: string;
  }): Promise<void> {
    const { key, uploadId } = params;

    const command = new AbortMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
    });

    await this.client.send(command);
    this.logger.log(`Aborted multipart upload for key: ${key}`);
  }
}
