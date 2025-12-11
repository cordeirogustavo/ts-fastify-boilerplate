import type { FastifyTypedInstance } from '../types'

export interface IRouter {
  register(app: FastifyTypedInstance): Promise<void> | void
}
