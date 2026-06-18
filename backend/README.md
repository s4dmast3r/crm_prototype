# alphaMedi IPS Backend

Base productiva del sistema interno centralizado de la IPS. Esta fase establece infraestructura, arquitectura hexagonal, observabilidad y entorno local. Los módulos de autenticación, CRM, nómina, documentos y facturación se incorporarán en entregas posteriores sobre esta base.

No maneja historia clínica, diagnósticos, órdenes médicas ni resultados clínicos.

## Stack

- Node.js 24 y TypeScript
- Fastify 5
- PostgreSQL 16
- Prisma ORM 7 con adaptador `pg`
- Redis 7
- BullMQ
- Zod
- Pino
- Prometheus mediante `prom-client`
- Vitest
- Docker Compose
- k6

## Arquitectura

```txt
src/
  app.ts
  main.ts
  worker.ts
  shared/
    domain/
    infrastructure/
    interfaces/
  modules/
    system/
      application/
      infrastructure/
      interfaces/
prisma/
tests/
k6/
```

- El dominio no importa Fastify, Prisma ni Redis.
- Los casos de uso dependen de puertos.
- Los adaptadores de Prisma y Redis viven en infraestructura.
- Las rutas Fastify son delgadas y delegan en casos de uso.
- `buildApp` puede probarse mediante `Fastify.inject` sin abrir puertos.

## Requisitos

- Node.js 22 o superior.
- npm.
- Docker Desktop para ejecutar PostgreSQL, Redis, API y worker con Compose.
- k6 opcional para pruebas de carga.

## Variables de entorno

Crea el archivo local:

```powershell
Copy-Item .env.example .env
```

En Bash:

```bash
cp .env.example .env
```

Variables principales:

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Conexión PostgreSQL |
| `REDIS_URL` | Redis, BullMQ y readiness |
| `CORS_ORIGINS` | Orígenes permitidos separados por coma |
| `RATE_LIMIT_MAX` | Máximo global de solicitudes por ventana |
| `METRICS_ENABLED` | Activa `/metrics` |
| `AI_PROVIDER` | `mock` por defecto; `openai` exige API key |
| `OPENAI_API_KEY` | Opcional y nunca se expone al frontend |
| `SENTRY_DSN` | Preparado para integración opcional futura |

## Instalación

```bash
npm install
npm run prisma:generate
```

## Entorno con Docker

Levantar todo:

```bash
docker compose up --build
```

Servicios:

- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Worker BullMQ: proceso independiente

El servicio `migrate` aplica migraciones antes de iniciar API y worker.

Para cargar el seed:

```bash
docker compose run --rm api npm run prisma:seed
```

## Desarrollo local

Con PostgreSQL y Redis disponibles:

```bash
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

En otra terminal:

```bash
npm run dev:worker
```

## Endpoints técnicos

| Endpoint | Descripción |
| --- | --- |
| `GET /health` | Liveness del proceso HTTP |
| `GET /ready` | Disponibilidad de PostgreSQL y Redis |
| `GET /metrics` | Métricas Prometheus |
| `GET /api/v1/system/info` | Información segura del runtime |
| `GET /api/docs` | Swagger UI |
| `GET /openapi.json` | Documento OpenAPI |

`/ready` responde `503` si PostgreSQL o Redis no están disponibles. `/health` no consulta dependencias.

## Scripts

```bash
npm run dev
npm run dev:worker
npm run build
npm run start
npm run start:worker
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run test:coverage
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run prisma:seed
npm run k6:smoke
```

## Prisma

La migración inicial crea:

- `SystemSetting`: configuración técnica no secreta.
- `OutboxEvent`: base persistente para eventos y procesamiento asíncrono.

El seed es idempotente y registra `system.bootstrap`.

## BullMQ

La cola `system-jobs` incluye el job técnico `system.health-snapshot`. API y worker usan conexiones separadas. El productor falla rápidamente cuando Redis no está disponible; el worker mantiene reconexión persistente.

## IA mock

La base acepta `AI_PROVIDER=mock` sin API key. Los endpoints IA y el adaptador OpenAI se implementarán en la fase funcional correspondiente. Si `AI_PROVIDER=openai`, la configuración exige `OPENAI_API_KEY`.

## Pruebas de carga

Con API, PostgreSQL y Redis activos:

```bash
npm run k6:smoke
```

También puede apuntarse a otro entorno:

```bash
k6 run -e BASE_URL=https://api.example.com k6/scenarios/load-smoke.js
```

## Estado de esta fase

Implementado:

- Toolchain y configuración validada.
- Shared kernel inicial.
- Módulo técnico `system`.
- Fastify, seguridad base, OpenAPI y manejo uniforme de errores.
- Correlation ID, logs redactados y métricas.
- Prisma/PostgreSQL y Redis.
- BullMQ y worker separado.
- Docker Compose y k6 smoke test.

Siguiente fase:

- Auth, Users, roles, permisos, refresh tokens, bloqueo de intentos y auditoría.

## Limitación de verificación local

En el equipo donde se construyó esta fase no estaba disponible el comando `docker`. Por eso el código, Prisma schema, tests, lint y build fueron verificados, pero `docker compose up` debe ejecutarse en un entorno con Docker Desktop instalado para validar los contenedores reales.
