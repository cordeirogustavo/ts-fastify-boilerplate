import type { FastifyReply, FastifyRequest } from 'fastify'
import type { TLanguages } from '../types'

export async function languageMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  const languageHeader = request.headers.language
  request.language = (typeof languageHeader === 'string' ? languageHeader : 'en') as TLanguages
}
