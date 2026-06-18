import 'dotenv/config'
import pino from 'pino'
import { loadEnv } from './shared/infrastructure/config/env.js'
import { createLoggerOptions } from './shared/infrastructure/logger/logger.js'
import {
  createBullMqConnectionOptions,
  createSystemWorker,
} from './shared/infrastructure/queue/system.queue.js'

const env = loadEnv()
const logger = pino(createLoggerOptions(env))
const worker = createSystemWorker(createBullMqConnectionOptions(env.REDIS_URL, true))

worker.on('completed', (job, result) => {
  logger.info({ jobId: job.id, jobName: job.name, result }, 'System job completed')
})

worker.on('failed', (job, error) => {
  logger.error({ jobId: job?.id, jobName: job?.name, err: error }, 'System job failed')
})

const shutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'Shutting down worker')
  await worker.close()
}

process.once('SIGINT', () => void shutdown('SIGINT'))
process.once('SIGTERM', () => void shutdown('SIGTERM'))

logger.info({ queue: worker.name }, 'System worker started')
