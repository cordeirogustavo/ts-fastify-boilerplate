import type z from 'zod'
import type { UserDTO } from './user.schema'

export type TUserDTO = z.infer<typeof UserDTO>
