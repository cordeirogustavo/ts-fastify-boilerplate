import type { Readable } from 'node:stream'

export type TS3FileContent = string | Uint8Array | Buffer | Readable | ReadableStream | Blob

export type TS3FileUpload = {
  bucket: string
  key: string
  contents: TS3FileContent
  metadata?: {
    contentType?: string
    contentEncoding?: string
    contentDisposition?: string
  }
}

export type TS3OperationResult = {
  success: boolean
  errorMessage?: string
  fileStream?: Readable
}
