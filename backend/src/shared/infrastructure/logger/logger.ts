import type { LoggerOptions } from 'pino'
import type { AppEnv } from '../config/env.js'

export function createLoggerOptions(env: AppEnv): LoggerOptions {
  return {
    level: env.LOG_LEVEL,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers.set-cookie',
        '*.password',
        '*.token',
        '*.accessToken',
        '*.refreshToken',
        '*.apiKey',
      ],
      censor: '[REDACTED]',
    },
  }
}
