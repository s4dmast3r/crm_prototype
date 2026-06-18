import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'
import type { Redis } from 'ioredis'
import type { AppEnv } from '../../../infrastructure/config/env.js'

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
  })
}
