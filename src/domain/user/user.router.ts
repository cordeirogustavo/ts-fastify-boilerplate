import { inject, singleton } from 'tsyringe'
import z from 'zod'
import type { IRouter } from '@/shared/interfaces'
import { AuthPayloadSchema, ErrorSchema } from '@/shared/schemas'
import type { FastifyTypedInstance } from '@/shared/types'
import {
  ChangePasswordSchema,
  ConfirmAccountSchema,
  CreateUserSchema,
  ForgotPasswordSchema,
  LoginRequirePasscodeSchema,
  LoginSchema,
  LoginWithFacebookSchema,
  LoginWithGoogleSchema,
  ResetPasswordSchema,
  UpdateUserSchema,
  UserDTO,
  ValidatePasscodeSchema,
} from './user.schema'
import type { IUserService } from './user.service'
import { UserSymbols } from './user.symbols'

const PREFIX = 'user'

@singleton()
export class UserRouter implements IRouter {
  constructor(
    @inject(UserSymbols.UserService)
    protected userService: IUserService,
  ) {}

  public register(app: FastifyTypedInstance): void {
    app.get(
      `/${PREFIX}/:userId`,
      {
        config: { hasAuth: true },
        schema: {
          tags: [PREFIX],
          operationId: 'getUserById',
          summary: 'Get user by id',
          description: 'Get user by id',
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
      `/${PREFIX}`,
      {
        config: { validateRecaptcha: true },
        schema: {
          tags: [PREFIX],
          operationId: 'createUser',
          summary: 'Create new user account',
          description: 'Register a new user account with email verification',
          security: [],
          body: CreateUserSchema,
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
      `/${PREFIX}/confirm-account`,
      {
        schema: {
          tags: [PREFIX],
          operationId: 'confirmAccount',
          summary: 'Confirm user account',
          description: 'Confirm user account using verification token sent via email',
          security: [],
          body: ConfirmAccountSchema,
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
      `/${PREFIX}/login`,
      {
        config: { validateRecaptcha: true },
        schema: {
          tags: [PREFIX],
          operationId: 'loginUser',
          summary: 'User login',
          description: 'Authenticate user with email and password',
          security: [],
          body: LoginSchema,
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
      `/${PREFIX}/login-with-google`,
      {
        schema: {
          tags: [PREFIX],
          operationId: 'loginWithGoogle',
          summary: 'Login with Google',
          description: 'Authenticate user using Google OAuth',
          security: [],
          body: LoginWithGoogleSchema,
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
      `/${PREFIX}/login-with-facebook`,
      {
        schema: {
          tags: [PREFIX],
          operationId: 'loginWithFacebook',
          summary: 'Login with Facebook',
          description: 'Authenticate user using Facebook OAuth',
          security: [],
          body: LoginWithFacebookSchema,
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
      `/${PREFIX}/validate-passcode`,
      {
        schema: {
          tags: [PREFIX],
          operationId: 'validatePasscode',
          summary: 'Validate two-factor authentication code',
          description: 'Validate TOTP passcode for two-factor authentication',
          security: [],
          body: ValidatePasscodeSchema,
          response: {
            200: AuthPayloadSchema,
            400: ErrorSchema,
            404: ErrorSchema,
            410: ErrorSchema,
          },
        },
      },
      async (req, reply) => {
        const { passcode, userId } = req.body
        const user = await this.userService.validatePasscode(userId, passcode)
        reply.status(200).send(user)
      },
    )

    app.post(
      `/${PREFIX}/forgot-password`,
      {
        schema: {
          tags: [PREFIX],
          operationId: 'forgotPassword',
          summary: 'Request password reset',
          description: 'Send password reset email to user',
          security: [],
          body: z.object({ email: z.email() }),
          response: {
            200: ForgotPasswordSchema,
            400: ErrorSchema,
          },
        },
      },
      async (req, reply) => {
        const { email } = req.body
        const forgotPassword = await this.userService.forgotPassword(email, req.language)
        reply.status(200).send(forgotPassword)
      },
    )

    app.post(
      `/${PREFIX}/reset-password`,
      {
        schema: {
          tags: [PREFIX],
          operationId: 'resetPassword',
          summary: 'Reset user password',
          description: 'Reset user password using token from email',
          security: [],
          body: ResetPasswordSchema,
          response: {
            200: AuthPayloadSchema,
            400: ErrorSchema,
            404: ErrorSchema,
          },
        },
      },
      async (req, reply) => {
        const { newPassword, token } = req.body
        const user = await this.userService.resetPassword(token, newPassword)
        reply.status(200).send(user)
      },
    )

    app.put(
      `/${PREFIX}/:userId`,
      {
        preValidation: async (req) => {
          const rawBody = Object.fromEntries((await req.formData()).entries())
          req.body = UpdateUserSchema.parse(rawBody)
        },
        schema: {
          config: { hasAuth: true },
          tags: [PREFIX],
          operationId: 'updateUser',
          summary: 'Update user information',
          description: 'Update user basic information and settings',
          consumes: ['multipart/form-data'],
          params: z.object({ userId: z.string() }),
          body: UpdateUserSchema,
          response: {
            200: UserDTO,
            400: ErrorSchema,
            404: ErrorSchema,
          },
        },
      },
      async (req, reply) => {
        const { userId } = req.params
        const user = await this.userService.updateUser(userId, req.body)
        reply.status(200).send(user)
      },
    )

    app.put(
      `/${PREFIX}/:userId/change-password`,
      {
        schema: {
          config: { hasAuth: true },
          tags: [PREFIX],
          operationId: 'changePassword',
          summary: 'Change user password',
          description: 'Change user password with current password verification',
          params: z.object({ userId: z.string() }),
          body: ChangePasswordSchema,
          response: {
            200: z.object({ success: z.boolean().describe('Password changed') }),
            400: ErrorSchema,
            404: ErrorSchema,
          },
        },
      },
      async (req, reply) => {
        const { userId } = req.params
        const changed = await this.userService.changePassword(userId, req.body)
        reply.status(200).send({ success: changed })
      },
    )
  }
}
