import Fastify, { type FastifyInstance } from 'fastify'
import type { Redis } from 'ioredis'
import { CheckReadiness } from './modules/system/application/use-cases/check-readiness.js'
import { GetSystemInfo } from './modules/system/application/use-cases/get-system-info.js'
import type { DependencyHealthPort } from './modules/system/application/ports/dependency-health.port.js'
import { registerSystemRoutes } from './modules/system/interfaces/http/system.routes.js'
import type { AppEnv } from './shared/infrastructure/config/env.js'
import { createLoggerOptions } from './shared/infrastructure/logger/logger.js'
import { createMetricsRegistry } from './shared/infrastructure/metrics/metrics.js'
import { registerErrorHandler } from './shared/interfaces/http/plugins/error-handler.js'
import { registerMetrics } from './shared/interfaces/http/plugins/metrics.js'
import { registerOpenApi } from './shared/interfaces/http/plugins/openapi.js'
import { registerRequestContext } from './shared/interfaces/http/plugins/request-context.js'
import { registerSecurity } from './shared/interfaces/http/plugins/security.js'

export interface BuildAppOptions {
  env: AppEnv
  dependencies: DependencyHealthPort[]
  rateLimitRedis?: Redis
}

export async function buildApp(options: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.env.NODE_ENV === 'test' ? false : createLoggerOptions(options.env),
    bodyLimit: 1_048_576,
    requestIdHeader: 'x-correlation-id',
    genReqId: (request) => request.headers['x-correlation-id']?.toString() ?? crypto.randomUUID(),
  })

  registerErrorHandler(app)
  registerRequestContext(app)
  await registerSecurity(app, options.env, options.rateLimitRedis)
  await registerOpenApi(app)
  registerMetrics(app, createMetricsRegistry(), options.env.METRICS_ENABLED)
  registerSystemRoutes(app, {
    getSystemInfo: new GetSystemInfo({
      serviceName: 'alphamedi-ips-backend',
      version: '0.1.0',
      environment: options.env.NODE_ENV,
      aiProvider: options.env.AI_PROVIDER,
      enabledModules: ['system'],
    }),
    checkReadiness: new CheckReadiness(options.dependencies),
  })

  return app
}
