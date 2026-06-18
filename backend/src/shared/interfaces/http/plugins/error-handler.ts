import type { FastifyInstance } from 'fastify'
import { AppError } from '../../../domain/errors/app-error.js'

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    const appError =
      error instanceof AppError
        ? error
        : new AppError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            statusCode: 500,
            cause: error,
          })

    if (!(error instanceof AppError)) {
      request.log.error({ err: error }, 'Unhandled request error')
    }

    void reply.status(appError.statusCode).send({
      error: {
        code: appError.code,
        message: appError.message,
        correlationId: request.id,
        ...(appError.details === undefined ? {} : { details: appError.details }),
      },
    })
  })
}
