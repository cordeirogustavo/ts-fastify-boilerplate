import type { z } from 'zod'
import type { AuthPayloadSchema } from '../schemas'

export type TAuthPayload = z.infer<typeof AuthPayloadSchema>
