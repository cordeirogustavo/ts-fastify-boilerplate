import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Readable } from 'stream'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateInstanceMock } from '@/mocks/instance-mocks'
import type { AWSS3Service } from '../aws-s3.service'
import type { TS3FileUpload } from '../aws-s3.types'

vi.mock('@aws-sdk/client-s3', () => {
  const send = vi.fn()

  class FakeS3Client {
    send = send
  }

  return {
    S3Client: FakeS3Client,
    GetObjectCommand: class {},
    PutObjectCommand: class {},
    DeleteObjectCommand: class {},
    DeleteObjectsCommand: class {},
    HeadObjectCommand: class {},
  }
})

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(),
}))

describe('AWSS3Service', () => {
  let s3Service: AWSS3Service
  let mockS3Client: { send: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    vi.clearAllMocks()
    const { s3Service: s3Instance } = generateInstanceMock()
    s3Service = s3Instance
    mockS3Client = (s3Service as any).s3Client
  })

  describe('existsObject', () => {
    it('should return true if object exists', async () => {
      mockS3Client.send.mockResolvedValueOnce({})
      const result = await s3Service.existsObject('test-bucket', 'test-key')
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(GetObjectCommand))
      expect(result).toBe(true)
    })

    it('should return false if object does not exist', async () => {
      const error = new Error('NoSuchKey')
      error.name = 'NoSuchKey'
      mockS3Client.send.mockRejectedValueOnce(error)
      const result = await s3Service.existsObject('test-bucket', 'test-key')
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(GetObjectCommand))
      expect(result).toBe(false)
    })

    it('should throw error if S3 client fails with different error', async () => {
      const error = new Error('S3 client error')
      mockS3Client.send.mockRejectedValueOnce(error)
      await expect(s3Service.existsObject('test-bucket', 'test-key')).rejects.toThrow(
        'S3 client error',
      )
    })
  })

  describe('getObject', () => {
    it('should return success true if object exists', async () => {
      mockS3Client.send.mockResolvedValueOnce({})
      const result = await s3Service.getObject('test-bucket', 'test-key')
      expect(result.success).toBe(true)
    })

    it('should return success false if object does not exist', async () => {
      const error = new Error('NoSuchKey')
      error.name = 'NoSuchKey'
      mockS3Client.send.mockRejectedValueOnce(error)
      const result = await s3Service.getObject('test-bucket', 'test-key')
      expect(result.success).toBe(false)
    })

    it('should return error message when S3 client fails', async () => {
      const error = new Error('S3 client error')
      mockS3Client.send.mockRejectedValueOnce(error)
      const result = await s3Service.getObject('test-bucket', 'test-key')
      expect(result.success).toBe(false)
      expect(result.errorMessage).toContain('S3 client error')
    })
  })

  describe('getObjectStream', () => {
    it('should return a stream when object exists', async () => {
      const mockStream = new Readable()
      mockS3Client.send.mockResolvedValueOnce({
        Body: mockStream,
      })
      const result = await s3Service.getObjectStream('test-bucket', 'test-key')
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(GetObjectCommand))
      expect(result.success).toBe(true)
      expect(result.fileStream).toBe(mockStream)
    })

    it('should return error when S3 client fails', async () => {
      const error = new Error('S3 client error')
      mockS3Client.send.mockRejectedValueOnce(error)
      const result = await s3Service.getObjectStream('test-bucket', 'test-key')
      expect(result.success).toBe(false)
      expect(result.errorMessage).toContain('S3 client error')
    })
  })

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      mockS3Client.send.mockResolvedValueOnce({})
      const fileUpload: TS3FileUpload = {
        bucket: 'test-bucket',
        key: 'test-key',
        contents: 'test-content',
        metadata: {
          contentType: 'text/plain',
          contentEncoding: 'utf-8',
          contentDisposition: 'inline',
        },
      }
      const result = await s3Service.uploadFile(fileUpload)
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand))
      expect(result.success).toBe(true)
    })

    it('should return error when S3 client fails', async () => {
      const error = new Error('S3 client error')
      mockS3Client.send.mockRejectedValueOnce(error)
      const fileUpload: TS3FileUpload = {
        bucket: 'test-bucket',
        key: 'test-key',
        contents: 'test-content',
      }
      const result = await s3Service.uploadFile(fileUpload)
      expect(result.success).toBe(false)
      expect(result.errorMessage).toBe('S3 client error')
    })
  })

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockS3Client.send.mockResolvedValueOnce({})
      const result = await s3Service.deleteFile('test-bucket', 'test-key')
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand))
      expect(result.success).toBe(true)
    })

    it('should return error when S3 client fails', async () => {
      const error = new Error('S3 client error')
      mockS3Client.send.mockRejectedValueOnce(error)
      const result = await s3Service.deleteFile('test-bucket', 'test-key')
      expect(result.success).toBe(false)
      expect(result.errorMessage).toBe('S3 client error')
    })
  })

  describe('deleteFiles', () => {
    it('should delete multiple files successfully', async () => {
      mockS3Client.send.mockResolvedValueOnce({})
      const keys = ['key1', 'key2', 'key3']
      const result = await s3Service.deleteFiles('test-bucket', keys)
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectsCommand))
      expect(result.success).toBe(true)
    })

    it('should return error when S3 client fails', async () => {
      const error = new Error('S3 client error')
      mockS3Client.send.mockRejectedValueOnce(error)
      const keys = ['key1', 'key2', 'key3']
      const result = await s3Service.deleteFiles('test-bucket', keys)
      expect(result.success).toBe(false)
      expect(result.errorMessage).toBe('S3 client error')
    })
  })

  describe('createPublicUrl', () => {
    it('should create a public URL with correct format', () => {
      const url = s3Service.createPublicUrl('test-bucket', 'test-key')
      expect(url).toBe('https://test-bucket.s3.amazonaws.com/test-key')
    })
  })

  describe('getSignedUrl', () => {
    it('should get a signed URL successfully', async () => {
      const mockSignedUrl = 'https://signed-url.example.com'
      vi.mocked(getSignedUrl).mockResolvedValueOnce(mockSignedUrl)
      const result = await s3Service.getSignedUrl('test-bucket', 'test-key')
      expect(getSignedUrl).toHaveBeenCalledWith(expect.anything(), expect.any(GetObjectCommand), {
        expiresIn: 15 * 60,
      })
      expect(result).toBe(mockSignedUrl)
    })

    it('should pass the response content disposition if provided', async () => {
      const mockSignedUrl = 'https://signed-url.example.com'
      vi.mocked(getSignedUrl).mockResolvedValueOnce(mockSignedUrl)
      const disposition = 'attachment; filename=test.pdf'
      const result = await s3Service.getSignedUrl('test-bucket', 'test-key', 30, disposition)
      expect(getSignedUrl).toHaveBeenCalled()
      expect(result).toBe(mockSignedUrl)
    })
  })

  describe('getUploadObjectSignedUrl', () => {
    it('should get a signed URL for uploading objects', async () => {
      const mockSignedUrl = 'https://upload-signed-url.example.com'
      vi.mocked(getSignedUrl).mockResolvedValueOnce(mockSignedUrl)
      const result = await s3Service.getUploadObjectSignedUrl('test-bucket', 'test-key')
      expect(getSignedUrl).toHaveBeenCalledWith(expect.anything(), expect.any(PutObjectCommand), {
        expiresIn: 15,
      })
      expect(result).toBe(mockSignedUrl)
    })
  })

  describe('getFileMetadata', () => {
    it('should get file metadata successfully', async () => {
      const mockMetadata = {
        ContentType: 'application/json',
        ContentLength: 1024,
      }
      mockS3Client.send.mockResolvedValueOnce(mockMetadata)
      const result = await s3Service.getFileMetadata('test-bucket', 'test-key')
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(HeadObjectCommand))
      expect(result).toBe(mockMetadata)
    })

    it('should return error when S3 client fails', async () => {
      const error = new Error('S3 client error')
      mockS3Client.send.mockRejectedValueOnce(error)
      const result = await s3Service.getFileMetadata('test-bucket', 'test-key')
      expect(result).toHaveProperty('success', false)
      expect(result).toHaveProperty('errorMessage')
      expect((result as any).errorMessage).toContain('S3 client error')
    })
  })
})
