import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client'

export interface MetricsRegistry {
  registry: Registry
  httpRequestsTotal: Counter<'method' | 'route' | 'status_code'>
  httpRequestDuration: Histogram<'method' | 'route' | 'status_code'>
}

export function createMetricsRegistry(): MetricsRegistry {
  const registry = new Registry()
  collectDefaultMetrics({
    register: registry,
    prefix: 'alphamedi_',
  })

  const httpRequestsTotal = new Counter({
    name: 'alphamedi_http_requests_total',
    help: 'Total HTTP requests processed by the API.',
    labelNames: ['method', 'route', 'status_code'],
    registers: [registry],
  })

  const httpRequestDuration = new Histogram({
    name: 'alphamedi_http_request_duration_seconds',
    help: 'HTTP request duration in seconds.',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [registry],
  })

  return {
    registry,
    httpRequestsTotal,
    httpRequestDuration,
  }
}
