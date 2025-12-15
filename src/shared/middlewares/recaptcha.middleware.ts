import type { FastifyReply, FastifyRequest } from 'fastify'
import { container } from 'tsyringe'
import type { AppConfig } from '@/config'
import { ConfigSymbols } from '@/config/config.symbols'
import { UnauthorizedError } from '../errors/handlers'

export async function recaptchaMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    const config = container.resolve<AppConfig>(ConfigSymbols.AppConfig)
    const token = request.headers['g-recaptcha-response']
    if (!token) throw new UnauthorizedError('failedInReCaptchaValidation')
    const verificationResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${config.google.recaptcha.secretKey}&response=${token}`,
      { method: 'POST' },
    )
    const { success } = (await verificationResponse.json()) as { success: boolean }
    if (!success) throw new UnauthorizedError('failedInReCaptchaValidation')
  } catch (_error: unknown) {
    throw new UnauthorizedError('failedInReCaptchaValidation')
  }
}
