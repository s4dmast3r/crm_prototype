import type {
  DependencyHealth,
  DependencyHealthPort,
} from '../ports/dependency-health.port.js'

export interface ReadinessResult {
  status: 'ready' | 'not_ready'
  dependencies: DependencyHealth[]
}

export class CheckReadiness {
  constructor(private readonly dependencies: DependencyHealthPort[]) {}

  async execute(): Promise<ReadinessResult> {
    const dependencies = await Promise.all(
      this.dependencies.map(async (dependency): Promise<DependencyHealth> => {
        const startedAt = performance.now()

        try {
          return await dependency.check()
        } catch {
          return {
            name: dependency.name,
            status: 'down',
            latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
            message: 'Dependency check failed',
          }
        }
      }),
    )

    return {
      status: dependencies.every((dependency) => dependency.status === 'up') ? 'ready' : 'not_ready',
      dependencies,
    }
  }
}
