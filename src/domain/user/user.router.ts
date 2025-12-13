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
  LoginWithFacebookSchema,
  LoginWithGoogleSchema,
  UserDTO,
  ValidatePasscodeSchema,
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
        onRequest: app.authenticate,
        schema: {
          tags: [PREFIX],
          operationId: 'getUserById',
          summary: 'Get user by id',
          description: 'Get user by id',
          security: [{ bearerAuth: [] }],
          params: z.object({ userId: z.uuid() }),
          response: {
            200: UserDTO,
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
          tags: [PREFIX],
          operationId: 'createUser',
          summary: 'Create new user account',
          description: 'Register a new user account with email verification',
          security: [],
          body: z.object(CreateUserSchema.shape),
          response: {
            201: UserDTO,
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
          tags: [PREFIX],
          operationId: 'confirmAccount',
          summary: 'Confirm user account',
          description: 'Confirm user account using verification token sent via email',
          security: [],
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
          tags: [PREFIX],
          operationId: 'loginUser',
          summary: 'User login',
          description: 'Authenticate user with email and password',
          security: [],
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

    app.post(
      `${PREFIX}/login-with-google`,
      {
        schema: {
          tags: [PREFIX],
          operationId: 'loginWithGoogle',
          summary: 'Login with Google',
          description: 'Authenticate user using Google OAuth',
          security: [],
          body: z.object(LoginWithGoogleSchema.shape),
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
        const { idToken } = req.body
        const googleUser = await this.userService.loginWithGoogle(idToken, req.language)
        reply.status(200).send(googleUser)
      },
    )

    app.post(
      `${PREFIX}/login-with-facebook`,
      {
        schema: {
          tags: [PREFIX],
          operationId: 'loginWithFacebook',
          summary: 'Login with Facebook',
          description: 'Authenticate user using Facebook OAuth',
          security: [],
          body: z.object(LoginWithFacebookSchema.shape),
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
        const { token, userId } = req.body
        const facebookUser = await this.userService.loginWithFacebook(userId, token, req.language)
        reply.status(200).send(facebookUser)
      },
    )

    app.post(
      `${PREFIX}/validate-passcode`,
      {
        schema: {
          tags: [PREFIX],
          operationId: 'validatePasscode',
          summary: 'Validate two-factor authentication code',
          description: 'Validate TOTP passcode for two-factor authentication',
          security: [],
          body: z.object(ValidatePasscodeSchema.shape),
          response: {
            200: AuthPayloadSchema,
            400: ErrorSchema,
          },
        },
      },
      async (req, reply) => {
        const { passcode, userId } = req.body
        const user = await this.userService.validatePasscode(userId, passcode)
        reply.status(200).send(user)
      },
    )
  }
}
