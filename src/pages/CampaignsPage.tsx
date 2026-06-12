import { useState } from 'react'
import type { FormEvent } from 'react'
import { BarChart3, Lightbulb, Plus } from 'lucide-react'
import { Badge } from '../components/Badge'
import { generateCampaignIdeas } from '../services/aiAgentService'
import { formatCampaignStatus, formatDate } from '../utils/formatters'
import type { Campaign, CampaignStatus, ServiceType } from '../types'

const channels: Campaign['canal'][] = ['Facebook', 'Instagram', 'LinkedIn', 'WhatsApp', 'correo', 'referido']
const services: ServiceType[] = ['salud ocupacional', 'examenes medicos', 'atencion domiciliaria', 'servicios empresariales IPS']
const statuses: CampaignStatus[] = ['planeada', 'activa', 'finalizada']

function emptyCampaign(): Campaign {
  const today = new Date().toISOString().slice(0, 10)
  return {
    id: crypto.randomUUID(),
    nombre: '',
    canal: 'LinkedIn',
    objetivo: '',
    servicioPromocionado: 'salud ocupacional',
    fechaInicio: today,
    fechaFin: today,
    estado: 'planeada',
    leadsGenerados: 0,
    conversiones: 0,
    observaciones: '',
    recomendacionesIA: [],
  }
}

export function CampaignsPage({
  campaigns,
  onChangeCampaigns,
}: {
  campaigns: Campaign[]
  onChangeCampaigns: (campaigns: Campaign[]) => void
}) {
  const [draft, setDraft] = useState(emptyCampaign())
  const [showForm, setShowForm] = useState(false)

  async function addAiIdeas(campaign: Campaign) {
    const ideas = await generateCampaignIdeas(campaign.servicioPromocionado)
    onChangeCampaigns(campaigns.map((item) => (item.id === campaign.id ? { ...item, recomendacionesIA: ideas } : item)))
  }

  function saveCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onChangeCampaigns([draft, ...campaigns])
    setDraft(emptyCampaign())
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="section-kicker">Marketing comercial</p>
            <h3 className="section-title">Campanas</h3>
          </div>
          <button type="button" onClick={() => setShowForm((value) => !value)} className="btn btn-primary">
            <Plus size={16} />
            Crear campana
          </button>
        </div>

        {showForm && (
          <form onSubmit={saveCampaign} className="mt-5 rounded-lg border border-teal-200 bg-teal-50/50 p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input label="Nombre" value={draft.nombre} onChange={(value) => setDraft({ ...draft, nombre: value })} required />
              <label className="field">
                <span>Canal</span>
                <select value={draft.canal} onChange={(event) => setDraft({ ...draft, canal: event.target.value as Campaign['canal'] })}>
                  {channels.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Servicio</span>
                <select
                  value={draft.servicioPromocionado}
                  onChange={(event) => setDraft({ ...draft, servicioPromocionado: event.target.value as ServiceType })}
                >
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </label>
              <Input label="Fecha inicio" value={draft.fechaInicio} onChange={(value) => setDraft({ ...draft, fechaInicio: value })} type="date" />
              <Input label="Fecha fin" value={draft.fechaFin} onChange={(value) => setDraft({ ...draft, fechaFin: value })} type="date" />
              <label className="field">
                <span>Estado</span>
                <select value={draft.estado} onChange={(event) => setDraft({ ...draft, estado: event.target.value as CampaignStatus })}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {formatCampaignStatus(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field md:col-span-3">
                <span>Objetivo</span>
                <textarea value={draft.objetivo} onChange={(event) => setDraft({ ...draft, objetivo: event.target.value })} required />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="btn btn-primary">
                Guardar campana
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        {campaigns.map((campaign) => {
          const conversion = campaign.leadsGenerados ? Math.round((campaign.conversiones / campaign.leadsGenerados) * 100) : 0
          return (
            <article key={campaign.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-teal-700">{campaign.canal}</p>
                  <h4 className="mt-1 text-xl font-bold">{campaign.nombre}</h4>
                </div>
                <Badge tone={campaign.estado === 'activa' ? 'green' : campaign.estado === 'planeada' ? 'blue' : 'slate'}>
                  {formatCampaignStatus(campaign.estado)}
                </Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{campaign.objetivo}</p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Metric label="Leads" value={campaign.leadsGenerados} />
                <Metric label="Conv." value={campaign.conversiones} />
                <Metric label="Tasa" value={`${conversion}%`} />
              </div>
              <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                {formatDate(campaign.fechaInicio)} - {formatDate(campaign.fechaFin)}
              </div>
              <button type="button" onClick={() => addAiIdeas(campaign)} className="btn btn-secondary mt-4 w-full justify-center">
                <Lightbulb size={16} />
                Generar ideas con IA
              </button>
              <div className="mt-4 space-y-2">
                {campaign.recomendacionesIA.map((idea) => (
                  <p key={idea} className="rounded-lg bg-teal-50 p-3 text-sm leading-6 text-slate-700">
                    {idea}
                  </p>
                ))}
              </div>
            </article>
          )
        })}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-teal-700" />
          <h3 className="section-title">Resultados simulados</h3>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campana</th>
                <th>Canal</th>
                <th>Servicio</th>
                <th>Leads</th>
                <th>Conversiones</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>{campaign.nombre}</td>
                  <td>{campaign.canal}</td>
                  <td>{campaign.servicioPromocionado}</td>
                  <td>{campaign.leadsGenerados}</td>
                  <td>{campaign.conversiones}</td>
                  <td>{campaign.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} required={required} type={type} />
    </label>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  )
}
