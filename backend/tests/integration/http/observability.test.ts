import { afterEach, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../../../src/app.js'
import { loadEnv } from '../../../src/shared/infrastructure/config/env.js'
import type { DependencyHealthPort } from '../../../src/modules/system/application/ports/dependency-health.port.js'

const env = loadEnv({
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://user:password@localhost:5432/test',
  REDIS_URL: 'redis://localhost:6379',
  METRICS_ENABLED: 'true',
})

const healthyDependency: DependencyHealthPort = {
  name: 'postgres',
  check: () => Promise.resolve({ name: 'postgres', status: 'up', latencyMs: 1 }),
}

describe('HTTP observability', () => {
  let app: FastifyInstance | undefined

  afterEach(async () => {
    await app?.close()
  })

  it('returns the correlation ID and exposes Prometheus metrics', async () => {
    app = await buildApp({ env, dependencies: [healthyDependency] })

    const health = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        'x-correlation-id': 'test-correlation-id',
      },
    })
    const metrics = await app.inject({ method: 'GET', url: '/metrics' })

    expect(health.headers['x-correlation-id']).toBe('test-correlation-id')
    expect(metrics.statusCode).toBe(200)
    expect(metrics.headers['content-type']).toContain('text/plain')
    expect(metrics.body).toContain('alphamedi_http_requests_total')
    expect(metrics.body).toContain('alphamedi_http_request_duration_seconds')
  })
})
