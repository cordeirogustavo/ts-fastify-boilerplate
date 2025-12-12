import { BaseError } from './base.error'

export class NotFoundError extends BaseError {
  constructor(
    message?: string | { key: string; params: Record<string, unknown> },
    metadata?: unknown,
  ) {
    super(message || 'Not found', {
      status: 404,
      code: 'NOT_FOUND',
      metadata,
    })
  }
}
