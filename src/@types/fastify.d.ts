import 'fastify'
import type { TAuthPayload, TLanguages } from '@/shared/types'

type AuthHook = (request: FastifyRequest, reply: FastifyReply) => Promise<void>
type ValidateRecaptchaHook = (request: FastifyRequest, reply: FastifyReply) => Promise<void>

declare module 'fastify' {
  interface FastifyRequest {
    authUser: Omit<TAuthPayload, 'token'>
    language: TLanguages
  }
  interface FastifyInstance {
    authenticate: AuthHook
    validateRecaptcha: ValidateRecaptchaHook
  }
  interface FastifyContextConfig {
    hasAuth?: boolean
    validateRecaptcha?: boolean
  }
}
