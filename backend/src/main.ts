import 'dotenv/config'
import { buildApp } from './app.js'
import { PrismaHealthAdapter } from './modules/system/infrastructure/prisma-health.adapter.js'
import { RedisHealthAdapter } from './modules/system/infrastructure/redis-health.adapter.js'
import { loadEnv } from './shared/infrastructure/config/env.js'
import { createPrismaClient } from './shared/infrastructure/prisma/prisma.js'
import { createRedisClient } from './shared/infrastructure/redis/redis.js'

const env = loadEnv()
const prisma = createPrismaClient(env.DATABASE_URL)
const redis = createRedisClient(env.REDIS_URL)

const app = await buildApp({
  env,
  dependencies: [new PrismaHealthAdapter(prisma), new RedisHealthAdapter(redis)],
})

app.addHook('onClose', async () => {
  await Promise.all([prisma.$disconnect(), redis.quit()])
})

const shutdown = async (signal: string): Promise<void> => {
  app.log.info({ signal }, 'Shutting down API')
  await app.close()
}

process.once('SIGINT', () => void shutdown('SIGINT'))
process.once('SIGTERM', () => void shutdown('SIGTERM'))

await app.listen({
  host: env.HOST,
  port: env.PORT,
})
