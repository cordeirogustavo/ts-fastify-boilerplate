import type z from 'zod'
import type { LanguageHeaderSchema } from '../schemas'

export type TLanguages = z.infer<typeof LanguageHeaderSchema.shape.language>
