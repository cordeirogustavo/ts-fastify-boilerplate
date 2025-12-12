import type { z } from 'zod'
import type { AuthPayloadSchema } from '../errors'

export type TAuthPayload = z.infer<typeof AuthPayloadSchema>
