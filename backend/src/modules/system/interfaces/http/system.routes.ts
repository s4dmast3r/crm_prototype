import type { FastifyInstance } from 'fastify'
import type { CheckReadiness } from '../../application/use-cases/check-readiness.js'
import type { GetSystemInfo } from '../../application/use-cases/get-system-info.js'

export interface SystemRoutesOptions {
  getSystemInfo: GetSystemInfo
  checkReadiness: CheckReadiness
}

const dependencySchema = {
  type: 'object',
  required: ['name', 'status', 'latencyMs'],
  properties: {
    name: { type: 'string' },
    status: { type: 'string', enum: ['up', 'down'] },
    latencyMs: { type: 'number', minimum: 0 },
    message: { type: 'string' },
  },
} as const

export function registerSystemRoutes(app: FastifyInstance, options: SystemRoutesOptions): void {
  app.get(
    '/health',
    {
      schema: {
        tags: ['System'],
        summary: 'Liveness check',
        response: {
          200: {
            type: 'object',
            required: ['status'],
            properties: {
              status: { type: 'string', const: 'ok' },
            },
          },
        },
      },
    },
    () => ({ status: 'ok' as const }),
  )

  app.get(
    '/ready',
    {
      schema: {
        tags: ['System'],
        summary: 'Readiness check for PostgreSQL and Redis',
        response: {
          200: {
            type: 'object',
            required: ['status', 'dependencies'],
            properties: {
              status: { type: 'string', const: 'ready' },
              dependencies: { type: 'array', items: dependencySchema },
            },
          },
          503: {
            type: 'object',
            required: ['status', 'dependencies'],
            properties: {
              status: { type: 'string', const: 'not_ready' },
              dependencies: { type: 'array', items: dependencySchema },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      const result = await options.checkReadiness.execute()
      return reply.status(result.status === 'ready' ? 200 : 503).send(result)
    },
  )

  app.get(
    '/api/v1/system/info',
    {
      schema: {
        tags: ['System'],
        summary: 'Safe runtime information',
        response: {
          200: {
            type: 'object',
            required: ['serviceName', 'version', 'environment', 'aiProvider', 'enabledModules'],
            properties: {
              serviceName: { type: 'string' },
              version: { type: 'string' },
              environment: { type: 'string' },
              aiProvider: { type: 'string', enum: ['mock', 'openai'] },
              enabledModules: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    () => options.getSystemInfo.execute(),
  )
}
