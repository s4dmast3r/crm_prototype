import type { CampaignStatus, Priority, ProspectStatus, Temperature } from '../types'

const statusLabels: Record<ProspectStatus, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  interesado: 'Interesado',
  propuesta_enviada: 'Propuesta enviada',
  ganado: 'Ganado',
  perdido: 'Perdido',
}

const campaignLabels: Record<CampaignStatus, string> = {
  planeada: 'Planeada',
  activa: 'Activa',
  finalizada: 'Finalizada',
}

const priorityLabels: Record<Priority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
}

const temperatureLabels: Record<Temperature, string> = {
  frio: 'Frio',
  tibio: 'Tibio',
  caliente: 'Caliente',
}

export function formatProspectStatus(status: ProspectStatus) {
  return statusLabels[status]
}

export function formatCampaignStatus(status: CampaignStatus) {
  return campaignLabels[status]
}

export function formatPriority(priority: Priority) {
  return priorityLabels[priority]
}

export function formatTemperature(temperature: Temperature) {
  return temperatureLabels[temperature]
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}
