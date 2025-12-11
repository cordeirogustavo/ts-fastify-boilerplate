import type { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '@/shared/errors'

export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (_error) {
    throw new UnauthorizedError('unauthorized')
  }
}
