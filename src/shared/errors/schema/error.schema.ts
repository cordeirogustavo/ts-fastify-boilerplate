import { z } from 'zod'

export const ErrorSchema = z.object({
  status: z.number(),
  code: z.string(),
  message: z.string(),
  metadata: z.any().optional(),
})
