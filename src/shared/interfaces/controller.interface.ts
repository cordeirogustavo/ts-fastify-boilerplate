import type { FastifyReply, FastifyRequest } from 'fastify'
import type z from 'zod'

type ExtractSchema<T extends z.ZodObject<any>> = {
  Params: T['shape'] extends { params: z.ZodTypeAny } ? z.infer<T['shape']['params']> : never

  Body: T['shape'] extends { body: z.ZodTypeAny } ? z.infer<T['shape']['body']> : never

  Query: T['shape'] extends { query: z.ZodTypeAny } ? z.infer<T['shape']['query']> : never

  Headers: T['shape'] extends { headers: z.ZodTypeAny } ? z.infer<T['shape']['headers']> : never

  Response: T['shape'] extends { response: Record<string, z.ZodTypeAny> }
    ? {
        [K in keyof T['shape']['response']]: z.infer<T['shape']['response'][K]>
      }
    : never
}

export type IHandle<TSchema extends z.ZodObject<any>> = (
  req: FastifyRequest<ExtractSchema<TSchema>>,
  reply: FastifyReply,
) => Promise<any> | any
