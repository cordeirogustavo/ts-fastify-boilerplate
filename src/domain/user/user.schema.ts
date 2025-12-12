import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export const imageFileSchema = z
  .any()
  .refine((file) => file?.size <= MAX_FILE_SIZE, {
    message: 'File size must be less than 5MB.',
  })
  .refine((file) => file && ACCEPTED_IMAGE_TYPES.includes(file.mimetype), {
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
  mfaEnabled: z.number().min(0).max(1).nullable().optional(),
  mfaKey: MfaKey.optional(),
  mfaMethod: z.enum(['EMAIL', 'APP']).nullable().optional(),
})

export const UserDTO = z.object({
  userId: z.uuid(),
  name: z.string(),
  email: z.string(),
  userPicture: z.string().optional().nullable(),
  mfaEnabled: z.number().min(0).max(1),
  mfaMethod: z.enum(['EMAIL', 'APP']).optional().nullable(),
  mfaKey: z
    .object({
      secret: z.string(),
      url: z.string(),
    })
    .optional()
    .nullable(),
  provider: z.enum(['API', 'GOOGLE', 'FACEBOOK']).nullable().optional(),
})

export const CreateUserSchema = z.object({
  body: z.object(UserSchema.omit({ userId: true }).shape),
})

export const UpdateUserSchema = z.object({
  params: z.object({ userId: z.uuid() }),
  body: z.object(UserSchema.shape).omit({
    userId: true,
    email: true,
    password: true,
    provider: true,
    providerIdentifier: true,
  }),
})

export const ConfirmAccountSchema = z.object({
  body: z.object({
    token: z.jwt(),
  }),
})

export const ForgotPasswordSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
})

export const LoginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(6),
    recaptchaToken: z.string().optional(),
  }),
})

export const LoginWithGoogleSchema = z.object({
  body: z.object({
    idToken: z.string().min(10),
  }),
})

export const LoginWithFacebookSchema = z.object({
  body: z.object({
    userId: z.string(),
    token: z.string().min(10),
  }),
})

export const ResetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    newPassword: z.string().min(6),
  }),
})

export const ChangePasswordSchema = z.object({
  params: z.object({ userId: z.uuid() }),
  body: z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6),
  }),
})

export const UpdateProfileSchema = z.object({
  params: z.object({ userId: z.uuid() }),
  body: z
    .object({
      name: z.string().min(10),
      mfaEnabled: z.string().transform((val) => parseInt(val, 10)),
      mfaMethod: z.enum(['EMAIL', 'APP']).optional().nullable(),
      picturePath: z.string().optional(),
    })
    .refine((data) => data.mfaEnabled !== 1 || !!data.mfaMethod, {
      message: 'MFA method is required',
      path: ['mfaMethod'],
    }),
  file: imageFileSchema.optional(),
})

export const ValidatePasscodeSchema = z.object({
  body: z.object({
    userId: z.uuid(),
    email: z.email(),
    passcode: z.string().min(6),
    method: z.enum(['EMAIL', 'APP']),
  }),
})
