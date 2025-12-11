import { inject, singleton } from 'tsyringe'
import z from 'zod'
import { ErrorSchema } from '@/shared/errors'
import type { IRouter } from '@/shared/interfaces'
import type { FastifyTypedInstance } from '@/shared/types'
import type { UserController } from './user.controller'
import { UserDTO } from './user.schema'
import { UserSymbols } from './user.symbols'

const PREFIX = '/user'

@singleton()
export class UserRouter implements IRouter {
  constructor(
    @inject(UserSymbols.UserController)
    private controller: UserController,
  ) {}

  public register(app: FastifyTypedInstance): void {
    app.get(
      `${PREFIX}/:userId`,
      {
        schema: {
          tags: ['user'],
          summary: 'getUserById',
          description: 'Get user by id',
          params: z.object({ userId: z.uuid() }),
          response: {
            200: z.object(UserDTO.shape),
            404: ErrorSchema,
          },
        },
      },
      this.controller.getUserById,
    )
  }
}
