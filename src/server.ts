import 'reflect-metadata'
import '@/shared/app/app.container'

import { fastifyCors } from '@fastify/cors'
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
import { AppRouter } from './shared/app/app.router'
import { setupErrorHandler } from './shared/errors/handlers'

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

const app = fastify({
  logger: {
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss',
            },
          }
        : undefined,
  },
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API Boilerplate',
      description: 'API Boilerplate',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(ScalarApiReference, {
  routePrefix: '/docs',
  logLevel: 'silent',
})

const appRouter = container.resolve(AppRouter)
appRouter.register(app)

setupErrorHandler(app)

app.listen({ port: port, host: '0.0.0.0' }).then(() => {
  console.log(`Server is running on port: ${port}`)
  console.log('Docs available at: /docs')
})
