export type DependencyStatus = 'up' | 'down'

export interface DependencyHealth {
  name: string
  status: DependencyStatus
  latencyMs: number
  message?: string
}

export interface DependencyHealthPort {
  readonly name: string
  check(): Promise<DependencyHealth>
}
