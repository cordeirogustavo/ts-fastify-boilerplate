import { BaseError } from './base.error'

export class CastError extends BaseError {
  constructor(message?: string | { key: string; params: Record<string, unknown> }) {
    super(message || 'Cast error', {
      status: 470,
      code: 'CAST_ERROR',
    })
  }
}
