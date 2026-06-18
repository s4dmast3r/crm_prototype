import { Redis } from 'ioredis'

export interface RedisClientOptions {
  worker?: boolean
}

export function createRedisClient(url: string, options: RedisClientOptions = {}): Redis {
  return new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: options.worker ? null : 1,
    enableOfflineQueue: options.worker ?? false,
  })
}
