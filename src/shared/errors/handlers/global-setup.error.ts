import type { FastifyError } from 'fastify'
import type { FastifyTypedInstance } from '@/shared/types'
import { BaseError } from './base.error'

export function setupErrorHandler(app: FastifyTypedInstance) {
  app.setErrorHandler((error: FastifyError | BaseError, _req, reply) => {
    if (error instanceof BaseError) {
      return reply.status(error.status).send({
        statusCode: error.status,
        code: error.code,
        message: error.message,
        metadata: error.metadata,
      })
    }

    if (error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        code: 'SCHEMA_VALIDATION_ERROR',
        message: error.message,
        issues: error.validation,
      })
    }

    reply.status(500).send({
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
    })
  })
}
