import type { z } from 'zod'
import type { UserPermissionSchema } from '../schemas'

export type TUserPermissionDTO = z.infer<typeof UserPermissionSchema>
