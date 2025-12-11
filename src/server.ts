import 'reflect-metadata'
import '@/shared/app/app.container'

import { fastifyCors } from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { fastifySwagger } from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { container } from 'tsyringe'
import { type AppConfig, ConfigSymbols } from './config'
import { AppRouter } from './shared/app/app.router'
import { setupErrorHandler } from './shared/errors/handlers'
import { authMiddleware, languageMiddleware } from './shared/middlewares'

const config = container.resolve<AppConfig>(ConfigSymbols.AppConfig)
const port = config.appPort

async function bootstrap() {
  const app = fastify({
    // logger: {
    //   transport:
    //     process.env.NODE_ENV !== 'production'
    //       ? {
    //           target: 'pino-pretty',
    //           options: {
    //             colorize: true,
    //             translateTime: 'HH:MM:ss',
    //           },
    //         }
    //       : undefined,
    // },
  }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.addHook('onRequest', languageMiddleware)

  app.register(fastifyJwt, {
    secret: config.appSecret,
  })

  app.decorate('authenticate', authMiddleware)

  await app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'API Boilerplate',
        description: 'API Boilerplate',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  })

  await app.register(ScalarApiReference, {
    routePrefix: '/docs',
    logLevel: 'silent',
  })

  setupErrorHandler(app)

  const appRouter = container.resolve(AppRouter)
  appRouter.register(app)

  await app.listen({ port: port, host: '0.0.0.0' })
  console.log(`Server is running on port: ${port}`)
  console.log(`Docs available at: http://localhost:${port}/docs`)
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
