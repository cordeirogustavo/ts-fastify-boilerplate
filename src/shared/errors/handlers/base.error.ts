export class BaseError extends Error {
  public readonly status: number
  public readonly code: string
  public readonly metadata?: unknown
  public readonly messageParams?: Record<string, unknown>

  constructor(
    message?: string | { key: string; params: Record<string, unknown> },
    {
      status = 500,
      code = 'INTERNAL_ERROR',
      metadata,
    }: {
      status?: number
      code?: string
      metadata?: unknown
    } = {},
  ) {
    super(typeof message === 'string' ? message : message?.key)
    this.messageParams = typeof message === 'string' ? {} : message?.params
    this.status = status
    this.code = code
    this.metadata = metadata

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
