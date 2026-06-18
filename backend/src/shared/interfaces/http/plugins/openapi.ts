import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'

export async function registerOpenApi(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'alphaMedi IPS Backend API',
        description: 'API interna modular para el sistema centralizado de la IPS.',
        version: '0.1.0',
      },
      servers: [{ url: '/' }],
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/api/docs',
  })

  app.get(
    '/openapi.json',
    {
      schema: {
        hide: true,
      },
    },
    () => app.swagger(),
  )
}
