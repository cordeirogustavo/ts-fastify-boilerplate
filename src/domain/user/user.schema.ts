import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export const ImageFileSchema = z
  .file()
  .max(MAX_FILE_SIZE, {
    message: 'File size must be less than 5MB.',
  })
  .mime(ACCEPTED_IMAGE_TYPES, {
    message: 'Format not supported. Use JPEG, PNG, GIF or WEBP.',
  })

export const MfaKey = z.object({
  secret: z.string(),
  url: z.string(),
})

export const UserSchema = z.object({
  userId: z.uuid(),
  name: z.string().min(10),
  email: z.email(),
  password: z.string().min(6).nullable(),
  status: z.enum(['ACTIVE', 'PENDING', 'DEACTIVATED']).nullable().optional(),
  provider: z.enum(['API', 'GOOGLE', 'FACEBOOK']).nullable().optional(),
  userPicture: z.string().nullable().optional(),
  providerIdentifier: z.string().nullable().optional(),
  mfaEnabled: z.coerce.number().min(0).max(1).nullable().optional(),
  mfaKey: MfaKey.optional(),
  mfaMethod: z.enum(['EMAIL', 'APP']).nullable().optional(),
})

export const UserDTO = z.object({
  userId: z.uuid(),
  name: z.string(),
  email: z.string(),
  userPicture: z.string().optional().nullable(),
  mfaEnabled: z.coerce.number().min(0).max(1),
  mfaMethod: z.enum(['EMAIL', 'APP']).optional().nullable(),
  mfaKey: MfaKey.optional().nullable(),
  provider: z.enum(['API', 'GOOGLE', 'FACEBOOK']).nullable().optional().default('API'),
})

export const CreateUserSchema = z.object(UserSchema.omit({ userId: true }).shape)

export const UpdateUserSchema = z
  .object({
    ...UserSchema.shape,
    picturePath: z.string().optional(),
    file: ImageFileSchema.optional(),
  })
  .omit({
    userId: true,
    email: true,
    password: true,
    provider: true,
    providerIdentifier: true,
  })
  .refine((data) => data.mfaEnabled !== 1 || !!data.mfaMethod, {
    message: 'MFA method is required',
    path: ['mfaMethod'],
  })

export const ConfirmAccountSchema = z.object({
  token: z.jwt(),
})

export const ForgotPasswordSchema = z.object({
  email: z.email(),
  success: z.boolean(),
})

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
})

export const LoginRequirePasscodeSchema = z.object({
  userId: z.uuid(),
  email: z.email(),
  requirePasscode: z.boolean(),
  method: z.enum(['EMAIL', 'APP']),
})

export const LoginWithGoogleSchema = z.object({
  idToken: z.string().min(10),
})

export const LoginWithFacebookSchema = z.object({
  userId: z.string(),
  token: z.string().min(10),
})

export const ResetPasswordSchema = z.object({
  token: z.jwt(),
  newPassword: z.string().min(6),
})

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

export const ValidatePasscodeSchema = z.object({
  userId: z.uuid(),
  email: z.email(),
  passcode: z.string().min(6),
  method: z.enum(['EMAIL', 'APP']),
})
