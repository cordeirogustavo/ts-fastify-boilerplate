export class BaseError extends Error {
  public readonly status: number
  public readonly code: string
  public readonly metadata?: unknown

  constructor(
    message: string,
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
    super(message)
    this.status = status
    this.code = code
    this.metadata = metadata

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
