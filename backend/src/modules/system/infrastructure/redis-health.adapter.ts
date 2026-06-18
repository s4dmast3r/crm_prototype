import type {
  DependencyHealth,
  DependencyHealthPort,
} from '../application/ports/dependency-health.port.js'

export interface RedisHealthClient {
  ping(): Promise<string>
}

export class RedisHealthAdapter implements DependencyHealthPort {
  readonly name = 'redis'

  constructor(private readonly client: RedisHealthClient) {}

  async check(): Promise<DependencyHealth> {
    const startedAt = performance.now()

    try {
      const response = await this.client.ping()
      const status = response === 'PONG' ? 'up' : 'down'
      return {
        name: this.name,
        status,
        latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
        ...(status === 'down' ? { message: 'Redis returned an unexpected response' } : {}),
      }
    } catch {
      return {
        name: this.name,
        status: 'down',
        latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
        message: 'Redis is unavailable',
      }
    }
  }
}
