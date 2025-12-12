import { BaseError } from './base.error'

export class ExpiredError extends BaseError {
  constructor(message?: string | { key: string; params: Record<string, unknown> }) {
    super(message || 'Expired', {
      status: 410,
      code: 'EXPIRED',
    })
  }
}
