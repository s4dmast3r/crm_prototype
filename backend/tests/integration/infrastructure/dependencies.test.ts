import { describe, expect, it } from 'vitest'
import { PrismaHealthAdapter } from '../../../src/modules/system/infrastructure/prisma-health.adapter.js'
import { RedisHealthAdapter } from '../../../src/modules/system/infrastructure/redis-health.adapter.js'

describe('dependency health adapters', () => {
  it('reports PostgreSQL as available after a successful query', async () => {
    const adapter = new PrismaHealthAdapter({
      $queryRawUnsafe: () => Promise.resolve([{ result: 1 }]),
    })

    await expect(adapter.check()).resolves.toMatchObject({
      name: 'postgres',
      status: 'up',
    })
  })

  it('reports Redis as available after PONG', async () => {
    const adapter = new RedisHealthAdapter({
      ping: () => Promise.resolve('PONG'),
    })

    await expect(adapter.check()).resolves.toMatchObject({
      name: 'redis',
      status: 'up',
    })
  })

  it('reports Redis as unavailable for an unexpected response', async () => {
    const adapter = new RedisHealthAdapter({
      ping: () => Promise.resolve('NOT_PONG'),
    })

    await expect(adapter.check()).resolves.toMatchObject({
      name: 'redis',
      status: 'down',
    })
  })
})
