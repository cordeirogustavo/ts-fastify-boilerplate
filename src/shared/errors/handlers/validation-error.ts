import { BaseError } from './base.error'

export class ValidationError extends BaseError {
  constructor(message: string, issues: unknown) {
    super(message, {
      status: 400,
      code: 'VALIDATION_ERROR',
      metadata: issues,
    })
  }
}
