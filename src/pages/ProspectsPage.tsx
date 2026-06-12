import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Bot, Copy, MessageSquarePlus, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import { Badge } from '../components/Badge'
import { analyzeLead, generateCommercialReply, summarizeInteraction } from '../services/aiAgentService'
import {
  formatDate,
  formatPriority,
  formatProspectStatus,
  formatTemperature,
} from '../utils/formatters'
import type { Campaign, Channel, Interaction, Priority, Prospect, ProspectStatus, ServiceType, Temperature } from '../types'

const statuses: ProspectStatus[] = ['nuevo', 'contactado', 'interesado', 'propuesta_enviada', 'ganado', 'perdido']
const priorities: Priority[] = ['baja', 'media', 'alta']
const temperatures: Temperature[] = ['frio', 'tibio', 'caliente']
const channels: Channel[] = ['formulario web', 'WhatsApp', 'referido', 'llamada', 'LinkedIn', 'Facebook', 'Instagram']
const services: ServiceType[] = [
  'salud ocupacional',
  'examenes medicos',
  'atencion domiciliaria',
  'contratacion empresarial',
  'servicios IPS',
  'otro',
]

function createEmptyProspect(): Prospect {
  const today = new Date().toISOString().slice(0, 10)
  return {
    id: crypto.randomUUID(),
    nombreContacto: '',
    empresa: '',
    cargo: '',
    correo: '',
    telefono: '',
    canalOrigen: 'WhatsApp',
    servicioInteres: 'salud ocupacional',
    mensajeInicial: '',
    estado: 'nuevo',
    prioridad: 'media',
    temperatura: 'tibio',
    fechaCreacion: today,
    fechaUltimoSeguimiento: today,
    proximaAccion: 'Calificar necesidad y agendar primer contacto.',
    notas: '',
    resumenIA: '',
    respuestaSugeridaIA: '',
  }
}

export function ProspectsPage({
  prospects,
  campaigns,
  interactions,
  onChangeProspects,
  onChangeInteractions,
}: {
  prospects: Prospect[]
  campaigns: Campaign[]
  interactions: Interaction[]
  onChangeProspects: (prospects: Prospect[]) => void
  onChangeInteractions: (interactions: Interaction[]) => void
}) {
  const [selectedId, setSelectedId] = useState(prospects[0]?.id ?? '')
  const [draft, setDraft] = useState<Prospect>(createEmptyProspect())
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [priorityFilter, setPriorityFilter] = useState('todos')
  const [channelFilter, setChannelFilter] = useState('todos')
  const [followUp, setFollowUp] = useState('')

  const selected = prospects.find((prospect) => prospect.id === selectedId) ?? prospects[0]
  const selectedInteractions = interactions.filter((interaction) => interaction.prospectId === selected?.id)

  const filtered = useMemo(() => {
    const search = query.toLowerCase().trim()
    return prospects.filter((prospect) => {
      const matchesSearch =
        !search ||
        [prospect.nombreContacto, prospect.empresa, prospect.servicioInteres, prospect.mensajeInicial]
          .join(' ')
          .toLowerCase()
          .includes(search)
      const matchesStatus = statusFilter === 'todos' || prospect.estado === statusFilter
      const matchesPriority = priorityFilter === 'todos' || prospect.prioridad === priorityFilter
      const matchesChannel = channelFilter === 'todos' || prospect.canalOrigen === channelFilter
      return matchesSearch && matchesStatus && matchesPriority && matchesChannel
    })
  }, [channelFilter, priorityFilter, prospects, query, statusFilter])

  function upsertProspect(next: Prospect) {
    const exists = prospects.some((prospect) => prospect.id === next.id)
    const updated = exists ? prospects.map((prospect) => (prospect.id === next.id ? next : prospect)) : [next, ...prospects]
    onChangeProspects(updated)
    setSelectedId(next.id)
    setShowForm(false)
    setDraft(createEmptyProspect())
  }

  function updateSelected(next: Prospect) {
    onChangeProspects(prospects.map((prospect) => (prospect.id === next.id ? next : prospect)))
  }

  async function handleAnalyze() {
    if (!selected) return
    const analysis = await analyzeLead(selected)
    updateSelected({
      ...selected,
      prioridad: analysis.prioridad,
      temperatura: analysis.temperatura,
      resumenIA: analysis.resumen,
      proximaAccion: analysis.proximaAccion,
      respuestaSugeridaIA: analysis.respuestaSugerida,
    })
  }

  async function handleReply() {
    if (!selected) return
    const reply = await generateCommercialReply(selected)
    updateSelected({ ...selected, respuestaSugeridaIA: reply })
  }

  async function handleFollowUp() {
    if (!selected || !followUp.trim()) return
    const summary = await summarizeInteraction(followUp)
    const today = new Date().toISOString().slice(0, 10)
    const interaction: Interaction = {
      id: crypto.randomUUID(),
      prospectId: selected.id,
      tipo: 'nota',
      fecha: today,
      descripcion: followUp,
      resultado: summary,
    }
    onChangeInteractions([interaction, ...interactions])
    updateSelected({ ...selected, fechaUltimoSeguimiento: today, estado: selected.estado === 'nuevo' ? 'contactado' : selected.estado })
    setFollowUp('')
  }

  function handleDelete(id: string) {
    const next = prospects.filter((prospect) => prospect.id !== id)
    onChangeProspects(next)
    if (selectedId === id) setSelectedId(next[0]?.id ?? '')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="section-kicker">CRM comercial</p>
            <h3 className="section-title">Prospectos</h3>
          </div>
          <button type="button" onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={16} />
            Crear prospecto
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="field md:col-span-2">
            <span>Buscar</span>
            <div className="input-shell">
              <Search size={16} className="text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre, empresa o servicio" />
            </div>
          </label>
          <label className="field">
            <span>Estado</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="todos">Todos</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {formatProspectStatus(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Prioridad</span>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
              <option value="todos">Todas</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {formatPriority(priority)}
                </option>
              ))}
            </select>
          </label>
          <label className="field md:col-span-2">
            <span>Canal</span>
            <select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)}>
              <option value="todos">Todos</option>
              {channels.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </label>
        </div>

        {showForm && <ProspectForm draft={draft} campaigns={campaigns} onCancel={() => setShowForm(false)} onSubmit={upsertProspect} />}

        <div className="mt-5 space-y-3">
          {filtered.length === 0 && <p className="empty-state">No hay prospectos con esos filtros.</p>}
          {filtered.map((prospect) => (
            <button
              key={prospect.id}
              type="button"
              onClick={() => setSelectedId(prospect.id)}
              className={`w-full rounded-lg border p-4 text-left transition ${
                selected?.id === prospect.id ? 'border-teal-300 bg-teal-50/60' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold">{prospect.empresa}</h4>
                  <p className="text-sm text-slate-600">{prospect.nombreContacto}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={prospect.prioridad === 'alta' ? 'red' : prospect.prioridad === 'media' ? 'amber' : 'slate'}>
                    {formatPriority(prospect.prioridad)}
                  </Badge>
                  <Badge tone={prospect.temperatura === 'caliente' ? 'green' : 'blue'}>
                    {formatTemperature(prospect.temperatura)}
                  </Badge>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{prospect.mensajeInicial}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {!selected && <p className="empty-state">Selecciona o crea un prospecto para ver el detalle.</p>}
        {selected && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="section-kicker">Detalle de prospecto</p>
                <h3 className="text-2xl font-bold">{selected.empresa}</h3>
                <p className="mt-1 text-slate-600">
                  {selected.nombreContacto} - {selected.cargo}
                </p>
              </div>
              <button type="button" onClick={() => handleDelete(selected.id)} className="btn btn-danger">
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Info label="Correo" value={selected.correo} />
              <Info label="Telefono" value={selected.telefono} />
              <Info label="Canal" value={selected.canalOrigen} />
              <Info label="Servicio" value={selected.servicioInteres} />
              <Info label="Creacion" value={formatDate(selected.fechaCreacion)} />
              <Info label="Ultimo seguimiento" value={formatDate(selected.fechaUltimoSeguimiento)} />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="field">
                <span>Estado</span>
                <select
                  value={selected.estado}
                  onChange={(event) => updateSelected({ ...selected, estado: event.target.value as ProspectStatus })}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {formatProspectStatus(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Prioridad</span>
                <select
                  value={selected.prioridad}
                  onChange={(event) => updateSelected({ ...selected, prioridad: event.target.value as Priority })}
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {formatPriority(priority)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Temperatura</span>
                <select
                  value={selected.temperatura}
                  onChange={(event) => updateSelected({ ...selected, temperatura: event.target.value as Temperature })}
                >
                  {temperatures.map((temperature) => (
                    <option key={temperature} value={temperature}>
                      {formatTemperature(temperature)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-700">Mensaje inicial</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selected.mensajeInicial}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={handleAnalyze} className="btn btn-primary">
                <Sparkles size={16} />
                Analizar con IA
              </button>
              <button type="button" onClick={handleReply} className="btn btn-secondary">
                <Bot size={16} />
                Generar respuesta
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(selected.respuestaSugeridaIA)}
                className="btn btn-secondary"
              >
                <Copy size={16} />
                Copiar respuesta
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AiPanel title="Clasificacion IA" body={selected.resumenIA || 'Ejecuta el analisis para generar una clasificacion.'} />
              <AiPanel title="Proxima accion" body={selected.proximaAccion} />
              <AiPanel title="Respuesta sugerida" body={selected.respuestaSugeridaIA || 'Genera una respuesta comercial para este prospecto.'} wide />
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <MessageSquarePlus size={18} className="text-teal-700" />
                <h4 className="font-bold">Registrar seguimiento</h4>
              </div>
              <textarea
                value={followUp}
                onChange={(event) => setFollowUp(event.target.value)}
                className="mt-3 min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-teal-500"
                placeholder="Ej. Se llamo al contacto, solicita propuesta antes del viernes..."
              />
              <button type="button" onClick={handleFollowUp} className="btn btn-primary mt-3">
                Registrar seguimiento
              </button>
            </div>

            <div>
              <h4 className="font-bold">Historial de interacciones</h4>
              <div className="mt-3 space-y-3">
                {selectedInteractions.length === 0 && <p className="empty-state">Sin interacciones registradas.</p>}
                {selectedInteractions.map((interaction) => (
                  <article key={interaction.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge tone="blue">{interaction.tipo}</Badge>
                      <span className="text-sm font-semibold text-slate-500">{formatDate(interaction.fecha)}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{interaction.descripcion}</p>
                    <p className="mt-2 text-sm font-medium text-slate-600">{interaction.resultado}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function ProspectForm({
  draft,
  campaigns,
  onCancel,
  onSubmit,
}: {
  draft: Prospect
  campaigns: Campaign[]
  onCancel: () => void
  onSubmit: (prospect: Prospect) => void
}) {
  const [form, setForm] = useState(draft)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 rounded-lg border border-teal-200 bg-teal-50/50 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Contacto" value={form.nombreContacto} onChange={(value) => setForm({ ...form, nombreContacto: value })} required />
        <Input label="Empresa" value={form.empresa} onChange={(value) => setForm({ ...form, empresa: value })} required />
        <Input label="Cargo" value={form.cargo} onChange={(value) => setForm({ ...form, cargo: value })} />
        <Input label="Correo" value={form.correo} onChange={(value) => setForm({ ...form, correo: value })} type="email" />
        <Input label="Telefono" value={form.telefono} onChange={(value) => setForm({ ...form, telefono: value })} />
        <label className="field">
          <span>Canal</span>
          <select value={form.canalOrigen} onChange={(event) => setForm({ ...form, canalOrigen: event.target.value as Channel })}>
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
            value={form.servicioInteres}
            onChange={(event) => setForm({ ...form, servicioInteres: event.target.value as ServiceType })}
          >
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Campana</span>
          <select value={form.campaignId ?? ''} onChange={(event) => setForm({ ...form, campaignId: event.target.value || undefined })}>
            <option value="">Sin campana</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="field md:col-span-2">
          <span>Mensaje inicial</span>
          <textarea
            value={form.mensajeInicial}
            onChange={(event) => setForm({ ...form, mensajeInicial: event.target.value })}
            required
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary">
          Guardar prospecto
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 whitespace-normal break-all text-sm font-semibold leading-relaxed text-slate-800">{value}</p>
    </div>
  )
}

function AiPanel({ title, body, wide }: { title: string; body: string; wide?: boolean }) {
  return (
    <article className={`rounded-lg border border-teal-100 bg-teal-50/50 p-4 ${wide ? 'md:col-span-2' : ''}`}>
      <p className="text-sm font-bold text-teal-800">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
    </article>
  )
}
