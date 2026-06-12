import { Bot, BriefcaseBusiness, FileCheck2, FileText, LayoutDashboard, LockKeyhole, ReceiptText, Users } from 'lucide-react'
import { Badge } from '../components/Badge'

const modules = [
  {
    title: 'CRM Comercial',
    status: 'Implementado en MVP',
    phase: 'MVP',
    icon: Users,
    detail: 'Prospectos, estados, prioridades, seguimientos y campanas.',
    tone: 'green',
  },
  {
    title: 'Agente IA Comercial',
    status: 'Demo funcional',
    phase: 'MVP',
    icon: Bot,
    detail: 'Clasificacion, respuestas, acciones y contenido con fallback local.',
    tone: 'teal',
  },
  {
    title: 'Novedades de nomina',
    status: 'Planeado fase 2',
    phase: 'Fase 2',
    icon: BriefcaseBusiness,
    detail: 'Registro de novedades, aprobaciones y reportes administrativos.',
    tone: 'blue',
  },
  {
    title: 'Desprendibles y documentos laborales',
    status: 'Planeado fase 2',
    phase: 'Fase 2',
    icon: FileCheck2,
    detail: 'Envio controlado de soportes, certificados y comunicados.',
    tone: 'blue',
  },
  {
    title: 'Facturacion',
    status: 'Planeado fase 3',
    phase: 'Fase 3',
    icon: ReceiptText,
    detail: 'Base conceptual para integrar facturacion sin implementarla en este MVP.',
    tone: 'amber',
  },
  {
    title: 'Dashboard gerencial',
    status: 'Planeado fase 3',
    phase: 'Fase 3',
    icon: LayoutDashboard,
    detail: 'KPIs comerciales, administrativos, financieros y operativos.',
    tone: 'amber',
  },
  {
    title: 'Gestion documental',
    status: 'Planeado fase 3',
    phase: 'Fase 3',
    icon: FileText,
    detail: 'Repositorio central para procesos internos, sin historia clinica.',
    tone: 'amber',
  },
  {
    title: 'Seguridad y roles',
    status: 'Base conceptual',
    phase: 'Futuro',
    icon: LockKeyhole,
    detail: 'Permisos por rol, auditoria y autenticacion productiva.',
    tone: 'slate',
  },
]

export function RoadmapPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="section-kicker">Vision del sistema centralizado</p>
        <h3 className="max-w-3xl text-3xl font-black tracking-tight">
          El modulo comercial demuestra valor rapido y abre camino a una plataforma administrativa integral.
        </h3>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          Esta demo evita datos clinicos y se concentra en procesos comerciales y administrativos. La misma base puede
          evolucionar hacia nomina, documentos laborales, facturacion y tableros de direccion con roles y automatizaciones.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <article key={module.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-11 place-items-center rounded-lg bg-slate-100 text-slate-700">
                  <Icon size={20} />
                </div>
                <Badge tone={module.tone as 'green' | 'teal' | 'blue' | 'amber' | 'slate'}>{module.phase}</Badge>
              </div>
              <h4 className="mt-5 text-lg font-bold">{module.title}</h4>
              <p className="mt-2 text-sm font-semibold text-teal-700">{module.status}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{module.detail}</p>
            </article>
          )
        })}
      </section>
    </div>
  )
}
