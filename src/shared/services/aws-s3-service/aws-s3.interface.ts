import type { HeadObjectCommandOutput } from '@aws-sdk/client-s3'
import type { TS3FileUpload, TS3OperationResult } from './aws-s3.types'

export interface IAWSS3Service {
  /**
   * Check if S3 Object exists
   * @param bucket Bucket name
   * @param key Which key inside the bucket you want to get
   * @returns
   */
  existsObject(bucket: string, key: string): Promise<boolean>

  /**
   * Get S3 Object
   * @param bucket Bucket name
   * @param key Which key inside the bucket you want to get
   * @deprecated Use just existsObject
   * @returns
   */
  getObject(bucket: string, key: string): Promise<TS3OperationResult>

  /**
   * Returns a stream for an object
   * @param bucket
   * @param key
   * @returns
   */
  getObjectStream(bucket: string, key: string): Promise<TS3OperationResult>

  /**
   * Uploads some content to s3
   * @param file all the parameters required for such upload
   * @returns a flag of success and an optional error message
   */
  uploadFile(file: TS3FileUpload): Promise<TS3OperationResult>

  /**
   * Deletes some content from s3
   * @param bucket Bucket name
   * @param key Which key inside the bucket you want to delete
   * @returns a flag of success and an optional error message
   */
  deleteFile(bucket: string, key: string): Promise<TS3OperationResult>

  /**
   * Deletes many objects from S3
   * @param bucket Bucket name
   * @param keys Which keys inside the bucket you want to delete
   * @returns an operation result of success and an optional error message
   */
  deleteFiles(bucket: string, keys: string[]): Promise<TS3OperationResult>

  /**
   * Creates a public url for the resource inside s3
   * @param bucket Bucket name
   * @param key Bucket key
   * @returns The publish `https` url for the file
   */
  createPublicUrl(bucket: string, key: string): string

  /**
   * Create presigned URL (https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)
   * @param bucket Bucket name
   * @param key Bucket key
   * @param expiresInMinutes 15 minutes by default
   * @param responseContentDisposition Optional content disposition
   */
  getSignedUrl(
    bucket: string,
    key: string,
    expiresInMinutes?: number,
    responseContentDisposition?: string,
  ): Promise<string>

  /**
   * Create presigned URL to upload an object (https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
   * @param bucket Bucket name
   * @param key Bucket key
   * @param expiresInMinutes 15 minutes by default
   */
  getUploadObjectSignedUrl(bucket: string, key: string, expiresIn?: number): Promise<string>

  /**
   * Retrieve metadata for an object (https://docs.aws.amazon.com/AmazonS3/latest/userguide/HeadObjectCommand.html)
   * @param bucket Bucket name
   * @param key Bucket key
   */
  getFileMetadata(
    bucket: string,
    key: string,
  ): Promise<HeadObjectCommandOutput | TS3OperationResult>
}
