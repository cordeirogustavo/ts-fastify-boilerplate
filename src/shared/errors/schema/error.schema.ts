import { z } from 'zod'

export const ErrorSchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
  metadata: z.any().optional(),
})
