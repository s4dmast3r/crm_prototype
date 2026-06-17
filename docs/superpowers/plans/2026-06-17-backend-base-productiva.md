# Backend Base Productiva Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir en `backend/` una base Fastify productiva, hexagonal, observable y ejecutable con PostgreSQL, Prisma, Redis y BullMQ.

**Architecture:** El backend será un proyecto TypeScript independiente. `buildApp` recibirá dependencias por inyección, las rutas técnicas delegarán en casos de uso y Prisma/Redis/BullMQ permanecerán dentro de infraestructura. La primera vertical real será el módulo `system`, con health, readiness, system info, métricas, OpenAPI y un job técnico BullMQ.

**Tech Stack:** Node.js, TypeScript, Fastify, PostgreSQL 16, Prisma ORM, Redis 7, BullMQ, Zod, Pino, Prometheus, Vitest, ESLint, Docker Compose y k6.

## Global Constraints

- El frontend actual permanece intacto.
- El backend vive únicamente en `backend/`.
- Las rutas no contienen lógica de negocio.
- Los casos de uso no conocen Fastify.
- El dominio no conoce Prisma.
- Prisma solo vive en infraestructura.
- No se crean endpoints vacíos ni carpetas decorativas.
- No se hardcodean secretos.
- `AI_PROVIDER=mock` funciona sin API key.
- La fase excluye Auth, CRM y módulos administrativos.

---

### Task 1: Toolchain, configuración y shared kernel

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/eslint.config.js`
- Create: `backend/vitest.config.ts`
- Create: `backend/.env.example`
- Create: `backend/src/shared/infrastructure/config/env.ts`
- Create: `backend/src/shared/domain/errors/app-error.ts`
- Create: `backend/src/shared/domain/pagination/pagination.ts`
- Test: `backend/tests/unit/shared/config.test.ts`
- Test: `backend/tests/unit/shared/pagination.test.ts`

**Interfaces:**
- Produces: `loadEnv(source?: NodeJS.ProcessEnv): AppEnv`
- Produces: `AppError`
- Produces: `normalizePagination(input): Pagination`

- [ ] Escribir pruebas que rechacen configuración inválida, apliquen defaults seguros y normalicen paginación.
- [ ] Ejecutar `npm run test:unit -- tests/unit/shared` y confirmar fallo por módulos inexistentes.
- [ ] Crear toolchain, dependencias, configuración Zod y shared kernel mínimo.
- [ ] Ejecutar las pruebas y confirmar estado verde.
- [ ] Ejecutar `npm run lint` y `npm run build`.
- [ ] Commit: `feat(backend): add toolchain and shared kernel`.

### Task 2: Módulo system y aplicación Fastify

**Files:**
- Create: `backend/src/modules/system/application/ports/dependency-health.port.ts`
- Create: `backend/src/modules/system/application/use-cases/get-system-info.ts`
- Create: `backend/src/modules/system/application/use-cases/check-readiness.ts`
- Create: `backend/src/modules/system/interfaces/http/system.routes.ts`
- Create: `backend/src/shared/interfaces/http/plugins/error-handler.ts`
- Create: `backend/src/shared/interfaces/http/plugins/security.ts`
- Create: `backend/src/shared/interfaces/http/plugins/openapi.ts`
- Create: `backend/src/app.ts`
- Test: `backend/tests/unit/system/get-system-info.test.ts`
- Test: `backend/tests/unit/system/check-readiness.test.ts`
- Test: `backend/tests/integration/http/system-routes.test.ts`

**Interfaces:**
- Consumes: `AppEnv`, `AppError`.
- Produces: `GetSystemInfo.execute(): SystemInfo`
- Produces: `CheckReadiness.execute(): Promise<ReadinessResult>`
- Produces: `buildApp(options): Promise<FastifyInstance>`

- [ ] Escribir pruebas para system info, readiness saludable/no saludable y contratos HTTP.
- [ ] Ejecutar pruebas y confirmar fallo por casos de uso/rutas inexistentes.
- [ ] Implementar casos de uso, plugins y rutas delgadas.
- [ ] Verificar `/health`, `/ready`, `/api/v1/system/info`, `/api/docs` y `/openapi.json`.
- [ ] Ejecutar pruebas, lint y build.
- [ ] Commit: `feat(backend): add system module and Fastify app`.

### Task 3: Métricas y logging seguro

**Files:**
- Create: `backend/src/shared/infrastructure/logger/logger.ts`
- Create: `backend/src/shared/infrastructure/metrics/metrics.ts`
- Create: `backend/src/shared/interfaces/http/plugins/request-context.ts`
- Create: `backend/src/shared/interfaces/http/plugins/metrics.ts`
- Modify: `backend/src/app.ts`
- Test: `backend/tests/integration/http/observability.test.ts`

**Interfaces:**
- Produces: `createLogger(env): LoggerOptions`
- Produces: `createMetricsRegistry(): MetricsRegistry`
- Produces: endpoint `/metrics`.

- [ ] Escribir prueba de correlation ID, formato Prometheus y ausencia de secretos en system info.
- [ ] Ejecutar prueba y confirmar fallo.
- [ ] Implementar logger con redacción y métricas HTTP.
- [ ] Ejecutar pruebas, lint y build.
- [ ] Commit: `feat(backend): add metrics and request observability`.

### Task 4: Prisma, Redis y readiness real

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/202606170001_init/migration.sql`
- Create: `backend/prisma/seed.ts`
- Create: `backend/src/shared/infrastructure/prisma/prisma.ts`
- Create: `backend/src/shared/infrastructure/redis/redis.ts`
- Create: `backend/src/modules/system/infrastructure/prisma-health.adapter.ts`
- Create: `backend/src/modules/system/infrastructure/redis-health.adapter.ts`
- Create: `backend/src/main.ts`
- Test: `backend/tests/integration/infrastructure/dependencies.test.ts`

**Interfaces:**
- Produces: `createPrismaClient()`
- Produces: `createRedisClient(url)`
- Produces adapters de `DependencyHealthPort`.

- [ ] Escribir pruebas de contrato para adaptadores de salud y seed idempotente.
- [ ] Ejecutar pruebas y confirmar fallo.
- [ ] Implementar schema, migración, seed, clientes y adaptadores.
- [ ] Generar Prisma Client y validar schema.
- [ ] Ejecutar pruebas disponibles, lint y build.
- [ ] Commit: `feat(backend): add PostgreSQL and Redis infrastructure`.

### Task 5: BullMQ y worker

**Files:**
- Create: `backend/src/shared/infrastructure/queue/system.queue.ts`
- Create: `backend/src/worker.ts`
- Create: `backend/tests/integration/queue/system-job.test.ts`
- Modify: `backend/src/main.ts`

**Interfaces:**
- Produces: `enqueueHealthSnapshot(payload)`
- Produces: `createSystemWorker(connection)`.

- [ ] Escribir prueba del job `system.health-snapshot`.
- [ ] Ejecutar prueba y confirmar fallo.
- [ ] Implementar cola, processor y cierre controlado.
- [ ] Ejecutar pruebas disponibles, lint y build.
- [ ] Commit: `feat(backend): add BullMQ system worker`.

### Task 6: Docker, k6 y documentación

**Files:**
- Create: `backend/Dockerfile`
- Create: `backend/docker-compose.yml`
- Create: `backend/.dockerignore`
- Create: `backend/k6/scenarios/load-smoke.js`
- Create: `backend/README.md`
- Modify: `.gitignore`

**Interfaces:**
- Produces: servicios Compose `api`, `worker`, `postgres`, `redis`.
- Produces: flujo documentado de instalación, migración, seed y ejecución.

- [ ] Crear Dockerfile multietapa no-root y Compose con healthchecks.
- [ ] Crear smoke test k6 para `/health`, `/ready` y system info.
- [ ] Documentar arquitectura, variables, comandos, Swagger, métricas y limitación local de Docker.
- [ ] Ejecutar `npm install`, Prisma validate/generate, lint, build y tests.
- [ ] Ejecutar Docker Compose si Docker está disponible; de lo contrario registrar la limitación exacta.
- [ ] Verificar que el frontend raíz siga compilando.
- [ ] Commit: `chore(backend): add containerization and documentation`.

### Task 7: Verificación final de la fase

**Files:**
- Modify only if verification reveals defects.

**Interfaces:**
- Consumes all previous deliverables.
- Produces evidence for phase acceptance.

- [ ] Ejecutar `npm run lint`.
- [ ] Ejecutar `npm run build`.
- [ ] Ejecutar `npm run test:unit`.
- [ ] Ejecutar `npm run test:integration`.
- [ ] Ejecutar `npm run prisma:validate`.
- [ ] Ejecutar `npm run prisma:generate`.
- [ ] Ejecutar `npm run prisma:seed` con PostgreSQL disponible.
- [ ] Verificar HTTP para health, readiness, metrics, docs, OpenAPI y system info.
- [ ] Confirmar procesamiento BullMQ con Redis disponible.
- [ ] Ejecutar build del frontend raíz.
- [ ] Documentar cualquier verificación bloqueada por herramientas externas no instaladas.
