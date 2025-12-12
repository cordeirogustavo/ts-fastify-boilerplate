import { inject, singleton } from 'tsyringe'
import z from 'zod'
import { AuthPayloadSchema, ErrorSchema } from '@/shared/errors'
import type { IRouter } from '@/shared/interfaces'
import type { FastifyTypedInstance } from '@/shared/types'
import {
  ConfirmAccountSchema,
  CreateUserSchema,
  LoginRequirePasscodeSchema,
  LoginSchema,
  UserDTO,
} from './user.schema'
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
          operationId: 'createUser',
          summary: 'Create new user account',
          description: 'Register a new user account with email verification',
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
          operationId: 'confirmAccount',
          summary: 'Confirm user account',
          description: 'Confirm user account using verification token sent via email',
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

    app.post(
      `${PREFIX}/login`,
      {
        schema: {
          tags: ['user'],
          operationId: 'loginUser',
          summary: 'User login',
          description: 'Authenticate user with email and password',
          body: z.object(LoginSchema.shape),
          response: {
            200: z.union([
              AuthPayloadSchema.describe('Authenticated user'),
              LoginRequirePasscodeSchema.describe('Require passcode'),
            ]),
            400: ErrorSchema,
          },
        },
      },
      async (req, reply) => {
        const { email, password } = req.body
        const auth = await this.userService.login(email, password, req.language)
        reply.status(200).send(auth)
      },
    )
  }
}
