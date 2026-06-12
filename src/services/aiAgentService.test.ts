import { describe, expect, it } from 'vitest'
import { analyzeLead, generateCommercialReply, generateCampaignIdeas } from './aiAgentService'
import { demoProspects } from '../data/demoData'
import type { Prospect } from '../types'

describe('aiAgentService mock fallback', () => {
  it('clasifica como alta y caliente un lead empresarial urgente', async () => {
    const prospect: Prospect = {
      ...demoProspects[0],
      servicioInteres: 'salud ocupacional',
      mensajeInicial: 'Necesitamos cotizacion urgente este mes para contratar examenes en varias sedes.',
    }

    const result = await analyzeLead(prospect)

    expect(result.prioridad).toBe('alta')
    expect(result.temperatura).toBe('caliente')
    expect(result.proximaAccion).toContain('24 horas')
  })

  it('genera una respuesta comercial profesional sin API key', async () => {
    const result = await generateCommercialReply(demoProspects[1])

    expect(result).toContain(demoProspects[1].nombreContacto)
    expect(result).toContain('IPS')
    expect(result.length).toBeGreaterThan(120)
  })

  it('genera tres ideas de campana para el servicio seleccionado', async () => {
    const ideas = await generateCampaignIdeas('atencion domiciliaria')

    expect(ideas).toHaveLength(3)
    expect(ideas[0]).toContain('atencion domiciliaria')
  })
})
