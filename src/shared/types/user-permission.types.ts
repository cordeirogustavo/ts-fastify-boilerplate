import type { z } from 'zod'
import type { UserPermissionSchema } from '../errors'

export type TUserPermissionDTO = z.infer<typeof UserPermissionSchema>
