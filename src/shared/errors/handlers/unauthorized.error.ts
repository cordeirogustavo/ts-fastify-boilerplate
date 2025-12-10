import { BaseError } from './base.error'

export class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized') {
    super(message, {
      status: 401,
      code: 'UNAUTHORIZED',
    })
  }
}
