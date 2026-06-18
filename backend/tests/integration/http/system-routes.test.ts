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

function dependency(name: string, status: 'up' | 'down'): DependencyHealthPort {
  return {
    name,
    check: () => Promise.resolve({ name, status, latencyMs: 1 }),
  }
}

describe('system HTTP routes', () => {
  let app: FastifyInstance | undefined

  afterEach(async () => {
    await app?.close()
  })

  it('exposes liveness and safe system information', async () => {
    app = await buildApp({
      env,
      dependencies: [dependency('postgres', 'up'), dependency('redis', 'up')],
    })

    const health = await app.inject({ method: 'GET', url: '/health' })
    const info = await app.inject({ method: 'GET', url: '/api/v1/system/info' })

    expect(health.statusCode).toBe(200)
    expect(health.json()).toEqual({ status: 'ok' })
    expect(info.statusCode).toBe(200)
    expect(info.json()).toMatchObject({
      serviceName: 'alphamedi-ips-backend',
      aiProvider: 'mock',
      enabledModules: ['system'],
    })
    expect(info.body).not.toContain('DATABASE_URL')
    expect(info.body).not.toContain('OPENAI_API_KEY')
  })

  it('returns 503 when readiness dependencies are unavailable', async () => {
    app = await buildApp({
      env,
      dependencies: [dependency('postgres', 'up'), dependency('redis', 'down')],
    })

    const response = await app.inject({ method: 'GET', url: '/ready' })

    expect(response.statusCode).toBe(503)
    expect(response.json()).toMatchObject({
      status: 'not_ready',
    })
  })

  it('publishes an OpenAPI document with technical endpoints', async () => {
    app = await buildApp({
      env,
      dependencies: [dependency('postgres', 'up'), dependency('redis', 'up')],
    })

    const response = await app.inject({ method: 'GET', url: '/openapi.json' })

    expect(response.statusCode).toBe(200)
    const document = response.json<{ paths: Record<string, unknown> }>()

    expect('/health' in document.paths).toBe(true)
    expect('/ready' in document.paths).toBe(true)
    expect('/api/v1/system/info' in document.paths).toBe(true)
  })

  it('returns an app that still accepts lifecycle hooks before listen', async () => {
    app = await buildApp({
      env,
      dependencies: [dependency('postgres', 'up'), dependency('redis', 'up')],
    })

    expect(() => {
      app?.addHook('onClose', () => Promise.resolve())
    }).not.toThrow()
  })
})
