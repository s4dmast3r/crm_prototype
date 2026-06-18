import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'
import type { Redis } from 'ioredis'
import type { AppEnv } from '../../../infrastructure/config/env.js'

const rateLimitExemptPaths = new Set([
  '/health',
  '/ready',
  '/metrics',
  '/openapi.json',
  '/api/v1/system/info',
])

export function isRateLimitExemptPath(path: string): boolean {
  const pathname = path.split('?', 1)[0] ?? path
  return rateLimitExemptPaths.has(pathname) || pathname === '/api/docs' || pathname.startsWith('/api/docs/')
}

export async function registerSecurity(app: FastifyInstance, env: AppEnv, redis?: Redis): Promise<void> {
  await app.register(helmet)
  await app.register(cors, {
    origin: env.CORS_ORIGINS,
    credentials: true,
  })
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    ...(redis ? { redis } : {}),
    allowList: (request) => isRateLimitExemptPath(request.url),
  })
}
