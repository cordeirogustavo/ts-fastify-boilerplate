import 'fastify'
import type { TAuthPayload, TLanguages } from '@/shared/types'

type AuthHook = (request: FastifyRequest, reply: FastifyReply) => Promise<void>

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: Omit<TAuthPayload, 'token'>
    payload: Omit<TAuthPayload, 'token'>
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    language: TLanguages
    jwtVerify: (options?: { allowedScopes?: string[] }) => Promise<void>
  }
  interface FastifyInstance {
    authenticate: AuthHook
  }
}
