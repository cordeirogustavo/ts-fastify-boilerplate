import type { FastifyReply, FastifyRequest } from 'fastify'
import { container } from 'tsyringe'
import { UnauthorizedError } from '@/shared/errors'
import { ServicesSymbols, type TokenService } from '../services'
import type { TUserPermissionDTO } from '../types'

export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  try {
    const tokenService = container.resolve<TokenService>(ServicesSymbols.TokenService)
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('unauthorized')
    }

    const token = authHeader.split(' ')[1]

    const decoded = tokenService.verify<{
      userId: string
      name: string
      email: string
      userPicture: string
      scopes: TUserPermissionDTO
    }>(token)

    if (!decoded.valid || !decoded.payload) {
      throw new UnauthorizedError('invalidToken')
    }
    request.authUser = {
      userId: decoded.payload.userId,
      name: decoded.payload.name,
      email: decoded.payload.email,
      userPicture: decoded.payload.userPicture,
      scopes: decoded.payload.scopes,
    }
  } catch (_error) {
    throw new UnauthorizedError('unauthorized')
  }
}
