# alphaMediSAS MVP Comercial IPS

MVP funcional para presentar una propuesta de sistema centralizado para una IPS pequena en crecimiento. La primera version se enfoca en el modulo comercial/CRM porque permite demostrar valor rapido: registro de prospectos, seguimiento, campanas, dashboard y un agente IA mock para clasificar leads, sugerir respuestas y recomendar proximas acciones.

El sistema no maneja historia clinica, pacientes, facturacion electronica real ni nomina real. Todo el alcance esta orientado a procesos administrativos y comerciales.

## Tecnologias

- React + Vite + TypeScript
- Tailwind CSS v4
- lucide-react para iconografia
- localStorage para persistencia demo
- Vitest + Testing Library para pruebas base
- Agente IA mock con reglas locales

## Funcionalidades incluidas

- Login simulado con usuarios demo y rol en localStorage.
- Dashboard comercial con prospectos totales, prospectos calientes, pendientes, campanas activas, tasa simulada de conversion, alertas y recomendaciones IA.
- CRM de prospectos con crear, listar, filtrar, buscar, ver detalle, editar estado/prioridad/temperatura, eliminar y registrar seguimientos.
- Detalle de prospecto con historial de interacciones, clasificacion IA, respuesta sugerida y proxima accion.
- Servicio `aiAgentService` con:
  - `analyzeLead`
  - `generateCommercialReply`
  - `recommendNextAction`
  - `generateCampaignIdeas`
  - `summarizeInteraction`
  - `generateContent`
- Modulo de campanas con creacion, listado, resultados simulados e ideas IA.
- Generador de contenido comercial para LinkedIn, Instagram, Facebook, WhatsApp y correo.
- Pantalla de roadmap del sistema centralizado con fases futuras: nomina, documentos laborales, facturacion, dashboard gerencial, seguridad y roles.
- Botones para restaurar datos demo y limpiar datos locales.

## Usuarios demo

| Rol | Correo | Contrasena |
| --- | --- | --- |
| Admin | `admin@ipsdemo.com` | `123456` |
| Comercial | `comercial@ipsdemo.com` | `123456` |
| Gerente | `gerente@ipsdemo.com` | `123456` |

## Instalacion y ejecucion local

```bash
npm install
npm run dev
```

Vite mostrara una URL local, normalmente `http://localhost:5173`.

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run lint
```

## Despliegue rapido

### Vercel

1. Subir el repositorio a GitHub.
2. Importar el proyecto en Vercel.
3. Framework: `Vite`.
4. Build command: `npm run build`.
5. Output directory: `dist`.

### Netlify

1. Crear un sitio desde el repositorio.
2. Build command: `npm run build`.
3. Publish directory: `dist`.

### GitHub Pages

La app genera archivos estaticos con:

```bash
npm run build
```

Para GitHub Pages se puede publicar la carpeta `dist` usando GitHub Actions o una rama `gh-pages`. Si el repositorio se publica bajo una ruta tipo `/nombre-repo/`, ajustar `base` en `vite.config.ts`.

## IA real

El MVP funciona completamente sin API key. La IA actual es un fallback local basado en reglas:

- Palabras como `urgente`, `este mes`, `varias sedes`, `contratar`, `cotizacion` elevan prioridad.
- Servicios empresariales como salud ocupacional o contratacion empresarial aumentan temperatura.
- Las respuestas comerciales se generan con plantillas profesionales.

Para una version productiva, no se recomienda exponer API keys en el frontend. Lo correcto seria crear un backend minimo con endpoints como:

- `POST /api/ai/analyze-lead`
- `POST /api/ai/generate-reply`
- `POST /api/ai/generate-content`

Ese backend leeria la API key desde variables de entorno seguras y devolveria JSON limpio al frontend.

## Datos demo

La app carga datos demo en localStorage al iniciar:

- Prospectos: Clinica Norte S.A.S., Empresa Salud Ocupacional Andina, Colegio San Rafael, Constructora Horizonte y Fundacion Vida Plena.
- Campanas: salud ocupacional empresarial, examenes medicos ocupacionales y atencion domiciliaria.
- Interacciones: llamada inicial, correo enviado, propuesta pendiente y seguimiento programado.

## Modulos simulados y futuros

Incluido en el MVP:

- CRM Comercial.
- Agente IA Comercial mock.
- Dashboard comercial.
- Campanas y contenido comercial.
- Roadmap del sistema centralizado.

Planeado para version productiva:

- Autenticacion real y permisos granulares.
- Backend REST y base de datos.
- Nomina y novedades administrativas.
- Envio de desprendibles.
- Gestion documental laboral.
- Facturacion.
- Dashboard gerencial integrado.
- Auditoria, trazabilidad y seguridad.

## Pruebas

```bash
npm run test
```

Las pruebas cubren el comportamiento principal del agente IA mock y la restauracion/limpieza de datos demo en localStorage.
