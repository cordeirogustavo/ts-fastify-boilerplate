import { inject, singleton } from 'tsyringe'
import z from 'zod'
import { ErrorSchema, NotFoundError } from '@/shared/errors'
import type { IRouter } from '@/shared/interfaces'
import type { FastifyTypedInstance } from '@/shared/types'
import { UserDTO } from './user.schema'
import type { IUserService } from './user.service'
import { UserSymbols } from './user.symbols'

const PREFIX = '/user'

@singleton()
export class UserRouter implements IRouter {
  constructor(
    @inject(UserSymbols.UserService)
    protected userService: IUserService,
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
      async (req, reply) => {
        const { userId } = req.params
        const user = await this.userService.getUserById(userId)
        if (!user) {
          throw new NotFoundError('userNotFound')
        }
        reply.status(200).send(user)
      },
    )
  }
}
