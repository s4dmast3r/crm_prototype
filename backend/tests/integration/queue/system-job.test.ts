import { describe, expect, it } from 'vitest'
import { processHealthSnapshot } from '../../../src/shared/infrastructure/queue/system.queue.js'

describe('system.health-snapshot processor', () => {
  it('returns a durable snapshot result for a valid job payload', async () => {
    const result = await processHealthSnapshot({
      source: 'integration-test',
      requestedAt: '2026-06-17T12:00:00.000Z',
    })

    expect(result.source).toBe('integration-test')
    expect(result.requestedAt).toBe('2026-06-17T12:00:00.000Z')
    expect(result.status).toBe('recorded')
    expect(Number.isNaN(Date.parse(result.processedAt))).toBe(false)
  })
})
