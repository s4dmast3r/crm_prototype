import { describe, expect, it } from 'vitest'
import { loadEnv } from '../../../src/shared/infrastructure/config/env.js'

const validEnv = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://user:password@localhost:5432/test',
  REDIS_URL: 'redis://localhost:6379',
}

describe('loadEnv', () => {
  it('applies safe defaults and keeps AI in mock mode without an API key', () => {
    const env = loadEnv(validEnv)

    expect(env.PORT).toBe(3000)
    expect(env.AI_PROVIDER).toBe('mock')
    expect(env.OPENAI_API_KEY).toBeUndefined()
    expect(env.CORS_ORIGINS).toEqual(['http://localhost:5173'])
  })

  it('rejects malformed dependency URLs', () => {
    expect(() =>
      loadEnv({
        ...validEnv,
        DATABASE_URL: 'not-a-url',
      }),
    ).toThrow('Invalid environment configuration')
  })
})
