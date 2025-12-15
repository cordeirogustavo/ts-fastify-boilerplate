import z from 'zod'

export const LanguageHeaderSchema = z.object({ language: z.enum(['en', 'pt']).default('en') })
