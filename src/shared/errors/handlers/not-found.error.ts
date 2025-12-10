import { BaseError } from './base.error'

export class NotFoundError extends BaseError {
  constructor(resource: string, metadata?: unknown) {
    super(`${resource} not found`, {
      status: 404,
      code: 'NOT_FOUND',
      metadata,
    })
  }
}
