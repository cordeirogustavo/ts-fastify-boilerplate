import z from 'zod'

export const UserPermissionSchema = z.object({
  global: z.array(z.string()),
  organizations: z.record(
    z.uuid(),
    z.object({
      name: z.string(),
      isDefault: z.boolean(),
      scopes: z.array(z.string()),
    }),
  ),
})

export const AuthPayloadSchema = z.object({
  userId: z.uuid(),
  email: z.email(),
  name: z.string(),
  userPicture: z.string(),
  token: z.jwt(),
  scopes: UserPermissionSchema,
})
