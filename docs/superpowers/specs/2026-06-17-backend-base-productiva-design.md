# Backend Base Productiva IPS - Diseño

## 1. Objetivo

Crear dentro de `backend/` la base ejecutable y productiva del sistema interno centralizado de la IPS. Esta entrega establece arquitectura, infraestructura, contratos técnicos, observabilidad y entorno local para que los módulos funcionales posteriores puedan incorporarse sin acoplar el dominio a Fastify, Prisma, Redis o BullMQ.

El frontend MVP existente se conserva como referencia funcional. No se copiará su persistencia en `localStorage`; solamente se reutilizarán conceptos de dominio, escenarios demo y comportamiento esperado del agente IA mock en fases posteriores.

## 2. Alcance de esta entrega

La base productiva incluye:

- Proyecto Node.js + TypeScript independiente en `backend/`.
- Fastify con API versionada.
- Arquitectura hexagonal modular.
- Configuración validada mediante variables de entorno.
- PostgreSQL 16 y Prisma ORM.
- Redis 7.
- BullMQ con proceso worker independiente.
- OpenAPI y Swagger UI.
- Logs estructurados con Pino y correlation ID.
- Headers de seguridad y CORS configurable.
- Rate limiting preparado sobre Redis.
- Endpoints `/health`, `/ready`, `/metrics` y `/api/v1/system/info`.
- Métricas Prometheus.
- Manejo uniforme de errores.
- Paginación y tipos compartidos.
- Dockerfile y Docker Compose para API, worker, PostgreSQL y Redis.
- Prueba unitaria del shared kernel.
- Pruebas de integración de endpoints técnicos con `Fastify.inject`.
- Estructura de k6 y smoke test técnico inicial.
- README y `.env.example`.
- Prisma schema inicial con modelos técnicos mínimos necesarios para comprobar conectividad y migraciones.

Esta entrega no implementa todavía Auth, Users, RBAC, CRM ni módulos administrativos. Sí deja puntos de extensión explícitos y registra los módulos futuros sin crear endpoints vacíos.

## 3. Organización del repositorio

El repositorio conserva el frontend actual en la raíz. El backend queda aislado:

```txt
backend/
  src/
    main.ts
    app.ts
    worker.ts
    shared/
      domain/
        errors/
        pagination/
      application/
        ports/
      infrastructure/
        config/
        prisma/
        redis/
        queue/
        logger/
        metrics/
      interfaces/
        http/
          plugins/
          schemas/
    modules/
      system/
        domain/
        application/
        infrastructure/
        interfaces/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  tests/
    unit/
    integration/
  k6/
    scenarios/
  Dockerfile
  docker-compose.yml
  package.json
  tsconfig.json
  eslint.config.js
  vitest.config.ts
  .env.example
  README.md
```

No se crearán directorios vacíos para todos los módulos futuros. Cada módulo se agregará cuando tenga dominio, casos de uso, adaptadores, rutas y pruebas reales.

## 4. Arquitectura

### Dominio

Contendrá errores de dominio, contratos de paginación y tipos puros. No importará Fastify, Prisma, Redis ni librerías de infraestructura.

### Aplicación

Definirá puertos y casos de uso. En esta entrega, el módulo `system` tendrá un caso de uso para obtener información segura del sistema y puertos para comprobar dependencias.

### Infraestructura

Implementará:

- Cliente Prisma singleton con ciclo de vida controlado.
- Cliente Redis con reconexión y cierre controlado.
- Conexiones BullMQ separadas para API y worker.
- Registro Prometheus.
- Configuración tipada.
- Adaptadores de readiness para PostgreSQL y Redis.

### Interfaces HTTP

Fastify registrará plugins encapsulados para seguridad, documentación, métricas, manejo de errores y correlation ID. Las rutas delegarán en casos de uso y no contendrán reglas de negocio.

## 5. Flujo de arranque

1. Validar variables de entorno antes de crear servicios.
2. Construir dependencias de infraestructura.
3. Crear la aplicación Fastify.
4. Registrar plugins globales.
5. Registrar rutas técnicas y versionadas.
6. Iniciar escucha HTTP desde `main.ts`.
7. Iniciar BullMQ desde `worker.ts` como proceso independiente.
8. Cerrar HTTP, Prisma, Redis y colas ante `SIGINT` o `SIGTERM`.

La función `buildApp` será importable por pruebas sin abrir puertos.

## 6. Endpoints técnicos

### `GET /health`

Comprueba que el proceso HTTP está vivo. No consulta dependencias externas y responde rápidamente.

### `GET /ready`

Comprueba PostgreSQL y Redis. Devuelve `200` cuando ambos están disponibles y `503` con estado individual cuando alguna dependencia falla.

### `GET /metrics`

Expone métricas Prometheus, incluyendo métricas de proceso y duración/conteo de requests HTTP. No expone secretos ni payloads.

### `GET /api/v1/system/info`

Devuelve nombre del servicio, versión, entorno, modo IA configurado y módulos habilitados. No devuelve URLs con credenciales, tokens ni secretos.

### `/api/docs` y `/openapi.json`

Exponen Swagger UI y el documento OpenAPI generado desde los esquemas de rutas.

## 7. Base de datos inicial

Prisma se configura para PostgreSQL. La migración inicial incluirá:

- `SystemSetting`: configuración técnica no secreta y extensible.
- `OutboxEvent`: base para eventos persistentes y procesamiento asíncrono futuro.

Ambos modelos usarán UUID, timestamps e índices útiles. No se introducirán prematuramente modelos incompletos de los módulos funcionales; esos modelos llegarán con cada módulo y su migración.

El seed inicial agregará configuración de sistema de desarrollo y será idempotente.

## 8. Redis y BullMQ

Redis se usará desde esta entrega para:

- Readiness.
- Backend del rate limiter.
- Conexión BullMQ.

Se creará una cola técnica `system-jobs` y un job útil `system.health-snapshot`, procesado por el worker. El worker registrará el resultado sin bloquear requests. Esto demuestra que la infraestructura asíncrona funciona y evita dejar una cola nominal sin comportamiento.

## 9. Seguridad base

Esta fase incorpora:

- `@fastify/helmet`.
- CORS por lista permitida desde env.
- Rate limit global configurable.
- Límite de tamaño de payload.
- Ocultamiento de stack traces en producción.
- Redacción de headers y campos sensibles en logs.
- Correlation ID por request.
- Política uniforme de errores.

JWT, Argon2id, refresh tokens, bloqueo de intentos y RBAC pertenecen a la siguiente entrega de Auth/Users.

## 10. Configuración

La configuración se validará con Zod. Variables mínimas:

- `NODE_ENV`
- `HOST`
- `PORT`
- `LOG_LEVEL`
- `DATABASE_URL`
- `REDIS_URL`
- `CORS_ORIGINS`
- `RATE_LIMIT_MAX`
- `RATE_LIMIT_WINDOW`
- `METRICS_ENABLED`
- `SENTRY_DSN`
- `AI_PROVIDER`
- `OPENAI_API_KEY`

`OPENAI_API_KEY` será opcional. `AI_PROVIDER` tendrá modo `mock` por defecto. Ningún secreto tendrá valor real en `.env.example`.

## 11. Errores y respuestas

Los errores esperados usarán una jerarquía compartida con código, estado HTTP, mensaje seguro y detalles opcionales. La respuesta será consistente:

```json
{
  "error": {
    "code": "DEPENDENCY_UNAVAILABLE",
    "message": "A required service is unavailable",
    "correlationId": "uuid"
  }
}
```

Errores desconocidos se registran internamente y se responden sin filtrar detalles sensibles.

## 12. Pruebas

Se aplicará TDD a los comportamientos nuevos.

### Unitarias

- Validación y mapeo de paginación.
- Error base y serialización segura.
- Caso de uso `GetSystemInfo`.
- Resultado de readiness según estado de adaptadores.

### Integración

- `/health` responde `200`.
- `/api/v1/system/info` devuelve contrato documentado y no expone secretos.
- `/ready` responde `200` con adaptadores saludables.
- `/ready` responde `503` cuando falla una dependencia.
- `/openapi.json` incluye endpoints técnicos.
- `/metrics` devuelve formato Prometheus.
- Prisma conecta contra PostgreSQL de prueba.
- Redis conecta y BullMQ procesa `system.health-snapshot`.

Las pruebas HTTP usarán `Fastify.inject`. Las pruebas que necesiten servicios reales se separarán bajo `test:integration` y utilizarán variables de entorno de prueba.

## 13. Docker y ejecución local

`docker-compose.yml` incluirá:

- `postgres` con healthcheck y volumen.
- `redis` con healthcheck y volumen.
- `api` dependiente de servicios saludables.
- `worker` con la misma imagen y comando distinto.

La imagen utilizará build multietapa y usuario no root. El código generado de Prisma se incluirá en la etapa de producción.

Flujo esperado:

```bash
cd backend
npm install
Copy-Item .env.example .env
docker compose up -d postgres redis
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

También podrá levantarse todo con `docker compose up --build`.

## 14. Scripts

El backend expondrá:

- `dev`
- `dev:worker`
- `build`
- `start`
- `start:worker`
- `lint`
- `test`
- `test:unit`
- `test:integration`
- `test:coverage`
- `prisma:generate`
- `prisma:migrate`
- `prisma:seed`
- `k6:smoke`

Los scripts `k6:100` se incorporarán cuando existan endpoints autenticados y flujos de negocio representativos.

## 15. Criterios de aceptación de esta fase

La base productiva se considera terminada cuando:

1. `backend/` instala dependencias sin alterar el frontend.
2. TypeScript compila sin errores.
3. ESLint pasa.
4. Pruebas unitarias pasan.
5. Pruebas de integración técnicas pasan con PostgreSQL y Redis.
6. Prisma genera cliente, aplica migración y ejecuta seed.
7. Docker Compose levanta PostgreSQL, Redis, API y worker.
8. `/health`, `/ready`, `/metrics`, `/api/v1/system/info`, `/api/docs` y `/openapi.json` responden.
9. BullMQ procesa el job técnico.
10. El README explica instalación, arquitectura, configuración, pruebas y siguientes módulos.
11. No existen endpoints funcionales vacíos.
12. No existen secretos hardcodeados.
13. El MVP frontend continúa intacto y compilable.

## 16. Decisiones explícitas

- El backend vivirá en `backend/`; no se reemplaza el frontend actual.
- Docker Compose del backend será autocontenido.
- No se crean tablas completas de todos los módulos en esta fase.
- No se crean carpetas vacías para aparentar cobertura.
- El primer módulo real será `system`; Auth/Users será la siguiente fase.
- La IA queda configurada en modo mock, pero sus endpoints se implementarán en su fase.
- Sentry queda preparado mediante configuración opcional, sin requerir DSN.
- MinIO no entra en esta fase porque aún no existe módulo de archivos.
- Se prioriza una base verificable y extensible sobre scaffolding masivo sin comportamiento.
