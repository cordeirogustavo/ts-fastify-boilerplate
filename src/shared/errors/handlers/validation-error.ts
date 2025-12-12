import { BaseError } from './base.error'

export class ValidationError extends BaseError {
  constructor(
    message?: string | { key: string; params: Record<string, unknown> },
    issues?: unknown,
  ) {
    super(message || 'Validation error', {
      status: 400,
      code: 'VALIDATION_ERROR',
      metadata: issues,
    })
  }
}
