import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  type DeleteObjectsCommandInput,
  GetObjectCommand,
  HeadObjectCommand,
  type HeadObjectCommandOutput,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Readable } from 'stream'
import { inject, singleton } from 'tsyringe'
import { type AppConfig, ConfigSymbols } from '@/config'
import type { IAWSS3Service } from './aws-s3.interface'
import type { TS3FileUpload, TS3OperationResult } from './aws-s3.types'

@singleton()
export class AWSS3Service implements IAWSS3Service {
  private readonly s3Client: S3Client

  constructor(
    @inject(ConfigSymbols.AppConfig)
    private readonly config: AppConfig,
  ) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.config.aws.accessKeyId,
        secretAccessKey: this.config.aws.secretAccessKey,
      },
      region: this.config.aws.region,
    })
  }

  async existsObject(bucket: string, key: string): Promise<boolean> {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })

      await this.s3Client.send(getCommand)

      return true
    } catch (err) {
      if ((err as Error)?.name === 'NoSuchKey') return false

      throw err
    }
  }

  async getObject(bucket: string, key: string): Promise<TS3OperationResult> {
    try {
      return {
        success: await this.existsObject(bucket, key),
      }
    } catch (err) {
      return {
        success: false,
        errorMessage: `Error retrieving object for key: ${key}: ${(err as Error)?.message}`,
      }
    }
  }

  async getObjectStream(bucket: string, key: string): Promise<TS3OperationResult> {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })

      const data = await this.s3Client.send(getCommand)
      const inputStream = data.Body

      return {
        success: true,
        fileStream: inputStream as Readable,
      }
    } catch (err) {
      return {
        success: false,
        errorMessage: `Error retrieving object for key: ${key}: ${(err as Error)?.message}`,
      }
    }
  }

  async uploadFile(file: TS3FileUpload): Promise<TS3OperationResult> {
    try {
      const { bucket, key, contents, metadata } = file

      const uploadParams: PutObjectCommandInput = {
        Bucket: bucket,
        Key: key,
        Body: contents,
        ContentType: metadata?.contentType,
        ContentEncoding: metadata?.contentEncoding,
        ContentDisposition: metadata?.contentDisposition,
      }

      await this.s3Client.send(new PutObjectCommand(uploadParams))

      return {
        success: true,
      }
    } catch (err) {
      return {
        success: false,
        errorMessage: (err as Error)?.message,
      }
    }
  }

  async deleteFile(bucket: string, key: string): Promise<TS3OperationResult> {
    try {
      const deleteParams = { Bucket: bucket, Key: key }

      await this.s3Client.send(new DeleteObjectCommand(deleteParams))

      return {
        success: true,
      }
    } catch (err) {
      return {
        success: false,
        errorMessage: (err as Error)?.message,
      }
    }
  }

  async deleteFiles(bucket: string, keys: string[]): Promise<TS3OperationResult> {
    const commandInput: DeleteObjectsCommandInput = {
      Bucket: bucket,
      Delete: {
        Objects: keys.map((k) => ({
          Key: k,
        })),
      },
    }

    try {
      await this.s3Client.send(new DeleteObjectsCommand(commandInput))

      return {
        success: true,
      }
    } catch (err) {
      return {
        success: false,
        errorMessage: (err as Error)?.message,
      }
    }
  }

  createPublicUrl(bucket: string, key: string): string {
    return `https://${bucket}.s3.amazonaws.com/${key}`
  }

  async getSignedUrl(
    bucket: string,
    key: string,
    expiresInMinutes = 15,
    responseContentDisposition?: string,
  ): Promise<string> {
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: responseContentDisposition,
    })

    const expiresIn = expiresInMinutes * 60

    return await getSignedUrl(this.s3Client, getCommand, { expiresIn })
  }

  async getUploadObjectSignedUrl(bucket: string, key: string, expiresIn = 15): Promise<string> {
    const uploadCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    return getSignedUrl(this.s3Client, uploadCommand, { expiresIn })
  }

  async getFileMetadata(
    bucket: string,
    key: string,
  ): Promise<HeadObjectCommandOutput | TS3OperationResult> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
      const response = await this.s3Client.send(command)
      return response
    } catch (err) {
      return {
        success: false,
        errorMessage: `Error retrieving metadata for key: ${key}: ${(err as Error)?.message}`,
      }
    }
  }
}
