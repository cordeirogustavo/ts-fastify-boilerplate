import type z from 'zod'
import type {
  CreateUserSchema,
  ForgotPasswordSchema,
  LoginRequirePasscodeSchema,
  MfaKey,
  UserDTO,
  UserSchema,
} from './user.schema'

export type TUserFilters = {
  userId?: string
  email?: string
  status?: 'ACTIVE' | 'PENDING' | 'DEACTIVATED'
  provider?: 'API' | 'GOOGLE' | 'FACEBOOK'
}
export type TUserDTO = z.infer<typeof UserDTO>
export type TUser = z.infer<typeof UserSchema>
export type TMfaKey = z.infer<typeof MfaKey>
export type TCreateUserInput = z.infer<typeof CreateUserSchema>
export type TLoginRequirePasscode = z.infer<typeof LoginRequirePasscodeSchema>
export type TForgotPassword = z.infer<typeof ForgotPasswordSchema>
