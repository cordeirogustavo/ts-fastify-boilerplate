import type { FastifyInstance } from 'fastify'
import { inject, singleton } from 'tsyringe'
import type { IRouter } from '@/shared/interfaces'
import type { UserController } from './user.controller'
import { GetUserById } from './user.schema'
import { UserSymbols } from './user.symbols'

const PREFIX = '/user'

@singleton()
export class UserRouter implements IRouter {
  constructor(
    @inject(UserSymbols.UserController)
    private controller: UserController,
  ) {}

  public register(app: FastifyInstance): void {
    app.get(
      `${PREFIX}/:userId`,
      {
        schema: {
          summary: 'Get user by id',
          params: GetUserById.shape.params,
          response: GetUserById.shape.response,
        },
      },
      this.controller.getUserById,
    )
  }
}
