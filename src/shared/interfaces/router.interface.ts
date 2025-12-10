import type { FastifyInstance } from 'fastify'

export interface IRouter {
  register(app: FastifyInstance): Promise<void> | void
}
