import { describe, expect, it } from 'vitest'
import { isRateLimitExemptPath } from '../../../src/shared/interfaces/http/plugins/security.js'

describe('isRateLimitExemptPath', () => {
  it.each([
    '/health',
    '/ready',
    '/metrics',
    '/openapi.json',
    '/api/docs',
    '/api/docs/static/index.css',
    '/api/v1/system/info',
  ])(
    'exempts technical endpoint %s',
    (path) => {
      expect(isRateLimitExemptPath(path)).toBe(true)
    },
  )

  it('keeps business API routes rate limited', () => {
    expect(isRateLimitExemptPath('/api/v1/crm/prospects')).toBe(false)
  })
})
