import { BaseError } from './base.error'

export class UnauthorizedError extends BaseError {
  constructor(message?: string | { key: string; params: Record<string, unknown> }) {
    super(message || 'Unauthorized', {
      status: 401,
      code: 'UNAUTHORIZED',
    })
  }
}
