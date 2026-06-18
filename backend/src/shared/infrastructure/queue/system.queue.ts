import { Queue, Worker } from 'bullmq'
import type { ConnectionOptions, Job } from 'bullmq'

export const SYSTEM_QUEUE_NAME = 'system-jobs'
export const HEALTH_SNAPSHOT_JOB = 'system.health-snapshot'

export interface SystemHealthSnapshotData {
  source: string
  requestedAt: string
}

export interface SystemHealthSnapshotResult {
  source: string
  requestedAt: string
  processedAt: string
  status: 'recorded'
}

export function processHealthSnapshot(
  data: SystemHealthSnapshotData,
): Promise<SystemHealthSnapshotResult> {
  return Promise.resolve({
    source: data.source,
    requestedAt: data.requestedAt,
    processedAt: new Date().toISOString(),
    status: 'recorded',
  })
}

export function createBullMqConnectionOptions(url: string, worker = false): ConnectionOptions {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    ...(parsed.username ? { username: decodeURIComponent(parsed.username) } : {}),
    ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
    ...(parsed.protocol === 'rediss:' ? { tls: {} } : {}),
    maxRetriesPerRequest: worker ? null : 1,
    enableOfflineQueue: worker,
  }
}

export type SystemQueue = Queue<SystemHealthSnapshotData, SystemHealthSnapshotResult, string>

export function createSystemQueue(connection: ConnectionOptions): SystemQueue {
  return new Queue<SystemHealthSnapshotData, SystemHealthSnapshotResult, string>(SYSTEM_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1_000,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  })
}

export async function enqueueHealthSnapshot(
  queue: SystemQueue,
  data: SystemHealthSnapshotData,
): Promise<string | undefined> {
  const job = await queue.add(HEALTH_SNAPSHOT_JOB, data)
  return job.id
}

export function createSystemWorker(
  connection: ConnectionOptions,
): Worker<SystemHealthSnapshotData, SystemHealthSnapshotResult, string> {
  return new Worker<SystemHealthSnapshotData, SystemHealthSnapshotResult, string>(
    SYSTEM_QUEUE_NAME,
    (job: Job<SystemHealthSnapshotData>) => processHealthSnapshot(job.data),
    {
      connection,
      concurrency: 2,
    },
  )
}
