import { describe, expect, it } from 'vitest'
import { CheckReadiness } from '../../../src/modules/system/application/use-cases/check-readiness.js'
import type { DependencyHealthPort } from '../../../src/modules/system/application/ports/dependency-health.port.js'

function dependency(name: string, healthy: boolean): DependencyHealthPort {
  return {
    name,
    check: () => Promise.resolve({
      name,
      status: healthy ? 'up' : 'down',
      latencyMs: 2,
    }),
  }
}

describe('CheckReadiness', () => {
  it('reports ready when every dependency is healthy', async () => {
    const useCase = new CheckReadiness([dependency('postgres', true), dependency('redis', true)])

    await expect(useCase.execute()).resolves.toEqual({
      status: 'ready',
      dependencies: [
        { name: 'postgres', status: 'up', latencyMs: 2 },
        { name: 'redis', status: 'up', latencyMs: 2 },
      ],
    })
  })

  it('reports not ready when one dependency is unavailable', async () => {
    const useCase = new CheckReadiness([dependency('postgres', true), dependency('redis', false)])

    await expect(useCase.execute()).resolves.toMatchObject({
      status: 'not_ready',
    })
  })
})
