import type { ContentRequest, LeadAnalysis, Prospect, ServiceType } from '../types'

const urgentKeywords = ['urgente', 'este mes', 'varias sedes', 'contratar', 'cotizacion', 'cotización', 'propuesta']
const enterpriseServices: ServiceType[] = ['salud ocupacional', 'contratacion empresarial', 'servicios empresariales IPS']

function hasAnyKeyword(text: string, keywords: string[]) {
  const normalized = text.toLowerCase()
  return keywords.some((keyword) => normalized.includes(keyword))
}

function makeReply(prospect: Prospect) {
  return `Hola ${prospect.nombreContacto}, gracias por contactarnos. Desde nuestra IPS podemos apoyarte con ${prospect.servicioInteres} mediante una propuesta clara, trazable y ajustada a las necesidades de ${prospect.empresa}. Para avanzar, te propongo una llamada breve donde validemos alcance, volumen, ubicacion, tiempos y responsable de decision. Con esa informacion podemos enviar una cotizacion priorizada y una ruta de implementacion sencilla.`
}

export async function analyzeLead(prospect: Prospect): Promise<LeadAnalysis> {
  const text = `${prospect.mensajeInicial} ${prospect.notas} ${prospect.servicioInteres}`
  const urgent = hasAnyKeyword(text, urgentKeywords)
  const enterprise = enterpriseServices.includes(prospect.servicioInteres)
  const volume = /\b(4[0-9]|[5-9][0-9]|\d{3,})\b/.test(text)

  const prioridad = urgent || volume ? 'alta' : enterprise ? 'media' : 'baja'
  const temperatura = urgent || enterprise ? 'caliente' : prospect.mensajeInicial.length > 80 ? 'tibio' : 'frio'
  const proximaAccion =
    prioridad === 'alta'
      ? 'Agendar llamada comercial en menos de 24 horas.'
      : 'Enviar portafolio y programar seguimiento en 48 horas.'
  const resumen =
    prioridad === 'alta'
      ? 'El prospecto solicita servicios empresariales con posible necesidad inmediata.'
      : 'El prospecto muestra interes inicial y requiere calificacion comercial.'

  return {
    prioridad,
    temperatura,
    resumen,
    proximaAccion,
    respuestaSugerida: makeReply(prospect),
  }
}

export async function generateCommercialReply(prospect: Prospect) {
  return makeReply(prospect)
}

export async function recommendNextAction(prospect: Prospect) {
  const analysis = await analyzeLead(prospect)
  return analysis.proximaAccion
}

export async function generateCampaignIdeas(serviceType: ServiceType | string) {
  const service = serviceType.toString()
  return [
    `Campana de diagnostico para ${service}: pieza educativa con llamado a agendar valoracion comercial.`,
    `Secuencia de WhatsApp para ${service}: primer mensaje consultivo, segundo con beneficios y tercero con agenda.`,
    `Publicacion LinkedIn para ${service}: enfoque en reduccion de carga administrativa y tiempos de respuesta IPS.`,
  ]
}

export async function summarizeInteraction(notes: string) {
  if (!notes.trim()) return 'Sin notas suficientes para resumir.'
  const firstSentence = notes.split(/[.!?]/).find(Boolean)?.trim() ?? notes.trim()
  return `Resumen IA: ${firstSentence}. Se recomienda registrar responsable, fecha de seguimiento y siguiente accion.`
}

export async function generateContent(request: ContentRequest) {
  const { serviceType, channel } = request
  return [
    `Tu equipo no deberia perder tiempo coordinando ${serviceType}. En nuestra IPS centralizamos agenda, seguimiento y respuesta comercial para que tu empresa avance sin friccion. Escribenos y armamos una propuesta segun tu necesidad.`,
    `Para ${channel}, una buena gestion de ${serviceType} empieza con informacion clara y tiempos definidos. Nuestro equipo te acompana desde el diagnostico hasta la ejecucion, con trazabilidad y seguimiento.`,
    `Si buscas un aliado IPS para ${serviceType}, podemos ayudarte con una ruta simple: entendemos tu caso, dimensionamos el alcance y te entregamos una propuesta accionable para decidir rapido.`,
  ]
}
