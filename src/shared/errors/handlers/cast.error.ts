import { BaseError } from './base.error'

export class CastError extends BaseError {
  constructor(message = 'CastError') {
    super(message, {
      status: 470,
      code: 'CAST_ERROR',
    })
  }
}
