import { useState } from 'react'
import { Copy, WandSparkles } from 'lucide-react'
import { generateContent } from '../services/aiAgentService'
import type { Campaign, ServiceType } from '../types'

const services: ServiceType[] = ['salud ocupacional', 'examenes medicos', 'atencion domiciliaria', 'servicios empresariales IPS']
const channels: Campaign['canal'][] = ['LinkedIn', 'Instagram', 'Facebook', 'WhatsApp', 'correo']

export function ContentGeneratorPage() {
  const [serviceType, setServiceType] = useState<ServiceType>('salud ocupacional')
  const [channel, setChannel] = useState<Campaign['canal']>('LinkedIn')
  const [copies, setCopies] = useState<string[]>([])

  async function handleGenerate() {
    setCopies(await generateContent({ serviceType, channel }))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.7fr_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="section-kicker">Automatizacion de marketing</p>
        <h3 className="section-title">Generador de contenido IA</h3>
        <div className="mt-6 space-y-4">
          <label className="field">
            <span>Servicio</span>
            <select value={serviceType} onChange={(event) => setServiceType(event.target.value as ServiceType)}>
              {services.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Canal</span>
            <select value={channel} onChange={(event) => setChannel(event.target.value as Campaign['canal'])}>
              {channels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={handleGenerate} className="btn btn-primary w-full justify-center">
            <WandSparkles size={16} />
            Generar contenido con IA
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="section-kicker">Propuestas de copy</p>
        <h3 className="section-title">Contenido listo para adaptar</h3>
        <div className="mt-5 space-y-4">
          {copies.length === 0 && <p className="empty-state">Selecciona un servicio y genera propuestas para la campana.</p>}
          {copies.map((copy, index) => (
            <article key={copy} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">Propuesta {index + 1}</p>
                <button type="button" onClick={() => navigator.clipboard?.writeText(copy)} className="btn btn-secondary">
                  <Copy size={16} />
                  Copiar
                </button>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-700">{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
