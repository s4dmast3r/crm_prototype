import { AlertTriangle, Flame, Megaphone, Target, Users, WandSparkles } from 'lucide-react'
import { Badge } from '../components/Badge'
import { StatCard } from '../components/StatCard'
import { calculateConversionRate, countPendingFollowUps, getCommercialAlerts } from '../utils/metrics'
import { formatDate, formatPriority, formatProspectStatus } from '../utils/formatters'
import type { Campaign, Interaction, Prospect } from '../types'

export function DashboardPage({
  prospects,
  campaigns,
  interactions,
}: {
  prospects: Prospect[]
  campaigns: Campaign[]
  interactions: Interaction[]
}) {
  const hot = prospects.filter((prospect) => prospect.temperatura === 'caliente').length
  const pending = countPendingFollowUps(prospects)
  const activeCampaigns = campaigns.filter((campaign) => campaign.estado === 'activa').length
  const conversion = calculateConversionRate(prospects)
  const alerts = getCommercialAlerts(prospects, campaigns)
  const recommended = prospects
    .filter((prospect) => prospect.estado !== 'ganado' && prospect.estado !== 'perdido')
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Prospectos totales" value={prospects.length} detail="Base comercial activa" icon={Users} />
        <StatCard label="Prospectos calientes" value={hot} detail="Alta intencion comercial" icon={Flame} tone="amber" />
        <StatCard label="Pendientes" value={pending} detail="Requieren seguimiento" icon={AlertTriangle} tone="blue" />
        <StatCard label="Campanas activas" value={activeCampaigns} detail="En ejecucion" icon={Megaphone} tone="green" />
        <StatCard label="Conversion" value={`${conversion}%`} detail="Tasa simulada" icon={Target} tone="teal" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Agente IA comercial</p>
              <h3 className="section-title">Proximas acciones recomendadas</h3>
            </div>
            <WandSparkles className="text-teal-700" />
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {recommended.length === 0 && <p className="empty-state">No hay acciones pendientes.</p>}
            {recommended.map((prospect) => (
              <article key={prospect.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold">{prospect.empresa}</h4>
                    <Badge tone={prospect.prioridad === 'alta' ? 'red' : prospect.prioridad === 'media' ? 'amber' : 'slate'}>
                      {formatPriority(prospect.prioridad)}
                    </Badge>
                    <Badge tone="teal">{formatProspectStatus(prospect.estado)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{prospect.proximaAccion}</p>
                </div>
                <p className="text-sm font-semibold text-slate-500">{formatDate(prospect.fechaUltimoSeguimiento)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="section-kicker">Riesgos y oportunidades</p>
          <h3 className="section-title">Alertas comerciales</h3>
          <div className="mt-5 space-y-3">
            {alerts.map((alert) => (
              <div key={alert} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                {alert}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="section-kicker">Actividad reciente</p>
            <h3 className="section-title">Seguimientos registrados</h3>
          </div>
          <Badge tone="blue">{interactions.length} interacciones</Badge>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {interactions.slice(0, 6).map((interaction) => (
                <tr key={interaction.id}>
                  <td>{formatDate(interaction.fecha)}</td>
                  <td>{interaction.tipo}</td>
                  <td>{interaction.descripcion}</td>
                  <td>{interaction.resultado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
