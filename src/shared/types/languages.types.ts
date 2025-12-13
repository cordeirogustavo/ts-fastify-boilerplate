import type z from 'zod'
import type { LanguageHeaderSchema } from '../errors'

export type TLanguages = z.infer<typeof LanguageHeaderSchema.shape.language>
