import type { Campaign, Prospect } from '../types'

export function calculateConversionRate(prospects: Prospect[]) {
  if (prospects.length === 0) return 0
  const won = prospects.filter((prospect) => prospect.estado === 'ganado').length
  return Math.round((won / prospects.length) * 100)
}

export function countPendingFollowUps(prospects: Prospect[], today = new Date('2026-06-11T12:00:00')) {
  return prospects.filter((prospect) => {
    if (prospect.estado === 'ganado' || prospect.estado === 'perdido') return false
    const last = new Date(`${prospect.fechaUltimoSeguimiento}T12:00:00`)
    const days = Math.floor((today.getTime() - last.getTime()) / 86_400_000)
    return days >= 3
  }).length
}

export function getCommercialAlerts(prospects: Prospect[], campaigns: Campaign[]) {
  const pending = countPendingFollowUps(prospects)
  const topCampaign = [...campaigns].sort((a, b) => b.leadsGenerados - a.leadsGenerados)[0]
  const highPriority = prospects.find((prospect) => prospect.prioridad === 'alta')
  const alerts = []

  if (pending > 0) {
    alerts.push(`${pending} prospectos llevan mas de 3 dias sin seguimiento.`)
  }

  if (topCampaign) {
    alerts.push(`La ${topCampaign.nombre.toLowerCase()} genero mas leads esta semana.`)
  }

  if (highPriority) {
    alerts.push(`El prospecto ${highPriority.empresa} tiene alta prioridad.`)
  }

  return alerts
}
