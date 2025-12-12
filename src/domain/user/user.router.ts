import { inject, singleton } from 'tsyringe'
import z from 'zod'
import { AuthPayloadSchema, ErrorSchema } from '@/shared/errors'
import type { IRouter } from '@/shared/interfaces'
import type { FastifyTypedInstance } from '@/shared/types'
import { ConfirmAccountSchema, CreateUserSchema, UserDTO } from './user.schema'
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
        // onRequest: app.authenticate,
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
        reply.status(200).send(await this.userService.getUserById(userId))
      },
    )

    app.post(
      `${PREFIX}`,
      {
        schema: {
          tags: ['user'],
          summary: 'createUser',
          description: 'Create user',
          body: z.object(CreateUserSchema.shape),
          response: {
            201: z.object(UserDTO.shape),
            400: ErrorSchema,
          },
        },
      },
      async (req, reply) => {
        const user = await this.userService.createUser(req.body, req.language)
        reply.status(201).send(user)
      },
    )

    app.post(
      `${PREFIX}/confirm-account`,
      {
        schema: {
          tags: ['user'],
          summary: 'confirmAccount',
          description: 'Confirm account',
          body: z.object(ConfirmAccountSchema.shape),
          response: {
            200: AuthPayloadSchema,
            400: ErrorSchema,
          },
        },
      },
      async (req, reply) => {
        const user = await this.userService.confirmAccount(req.body.token)
        reply.status(200).send(user)
      },
    )
  }
}
