import type { FastifyInstance } from 'fastify'
import type { MetricsRegistry } from '../../../infrastructure/metrics/metrics.js'

export function registerMetrics(app: FastifyInstance, metrics: MetricsRegistry, enabled: boolean): void {
  const requestStartedAt = new Map<string, number>()

  app.addHook('onRequest', (request, _reply, done) => {
    requestStartedAt.set(request.id, performance.now())
    done()
  })

  app.addHook('onResponse', (request, reply, done) => {
    const startedAt = requestStartedAt.get(request.id) ?? performance.now()
    const route = request.routeOptions.url ?? 'unmatched'
    const labels = {
      method: request.method,
      route,
      status_code: reply.statusCode.toString(),
    }

    metrics.httpRequestsTotal.inc(labels)
    metrics.httpRequestDuration.observe(labels, Math.max(0, performance.now() - startedAt) / 1000)
    requestStartedAt.delete(request.id)
    done()
  })

  app.get(
    '/metrics',
    {
      schema: {
        tags: ['System'],
        summary: 'Prometheus metrics',
        hide: !enabled,
      },
    },
    async (_request, reply) => {
      if (!enabled) {
        return reply.status(404).send({
          error: {
            code: 'METRICS_DISABLED',
            message: 'Metrics are disabled',
          },
        })
      }

      return reply.header('content-type', metrics.registry.contentType).send(await metrics.registry.metrics())
    },
  )
}
