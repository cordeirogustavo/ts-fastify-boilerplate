import { BaseError } from './base.error'

export class ExpiredError extends BaseError {
  constructor(message = 'Expired') {
    super(message, {
      status: 410,
      code: 'EXPIRED',
    })
  }
}
