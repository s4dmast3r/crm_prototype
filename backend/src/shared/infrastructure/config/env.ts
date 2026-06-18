import { z } from 'zod'
import { AppError } from '../../domain/errors/app-error.js'

const booleanFromString = z
  .enum(['true', 'false'])
  .default('true')
  .transform((value) => value === 'true')

const optionalSecret = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim()
    return trimmed ? trimmed : undefined
  })

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.url().refine((value) => value.startsWith('postgresql://') || value.startsWith('postgres://'), {
    message: 'DATABASE_URL must use PostgreSQL',
  }),
  REDIS_URL: z.url().refine((value) => value.startsWith('redis://') || value.startsWith('rediss://'), {
    message: 'REDIS_URL must use Redis',
  }),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),
  METRICS_ENABLED: booleanFromString,
  SENTRY_DSN: optionalSecret,
  AI_PROVIDER: z.enum(['mock', 'openai']).default('mock'),
  OPENAI_API_KEY: optionalSecret,
})

export type AppEnv = z.infer<typeof envSchema>

export function loadEnv(source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): AppEnv {
  const result = envSchema.safeParse(source)

  if (!result.success) {
    throw new AppError({
      code: 'INVALID_ENVIRONMENT',
      message: 'Invalid environment configuration',
      statusCode: 500,
      details: z.flattenError(result.error).fieldErrors,
    })
  }

  if (result.data.AI_PROVIDER === 'openai' && !result.data.OPENAI_API_KEY) {
    throw new AppError({
      code: 'INVALID_ENVIRONMENT',
      message: 'Invalid environment configuration',
      statusCode: 500,
      details: { OPENAI_API_KEY: ['OPENAI_API_KEY is required when AI_PROVIDER=openai'] },
    })
  }

  return result.data
}
