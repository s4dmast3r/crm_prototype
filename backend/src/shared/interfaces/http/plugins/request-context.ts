import type { FastifyInstance } from 'fastify'

export function registerRequestContext(app: FastifyInstance): void {
  app.addHook('onRequest', (request, reply, done) => {
    void reply.header('x-correlation-id', request.id)
    done()
  })
}
