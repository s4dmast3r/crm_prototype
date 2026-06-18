import type {
  DependencyHealth,
  DependencyHealthPort,
} from '../application/ports/dependency-health.port.js'

export interface PrismaHealthClient {
  $queryRawUnsafe(query: string): Promise<unknown>
}

export class PrismaHealthAdapter implements DependencyHealthPort {
  readonly name = 'postgres'

  constructor(private readonly client: PrismaHealthClient) {}

  async check(): Promise<DependencyHealth> {
    const startedAt = performance.now()

    try {
      await this.client.$queryRawUnsafe('SELECT 1')
      return {
        name: this.name,
        status: 'up',
        latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
      }
    } catch {
      return {
        name: this.name,
        status: 'down',
        latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
        message: 'PostgreSQL is unavailable',
      }
    }
  }
}
