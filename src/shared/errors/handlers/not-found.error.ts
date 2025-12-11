import { BaseError } from './base.error'

export class NotFoundError extends BaseError {
  constructor(message: string, metadata?: unknown) {
    super(message, {
      status: 404,
      code: 'NOT_FOUND',
      metadata,
    })
  }
}
