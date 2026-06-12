export type UserRole = 'admin' | 'comercial' | 'gerente'

export type ProspectStatus =
  | 'nuevo'
  | 'contactado'
  | 'interesado'
  | 'propuesta_enviada'
  | 'ganado'
  | 'perdido'

export type Priority = 'baja' | 'media' | 'alta'
export type Temperature = 'frio' | 'tibio' | 'caliente'

export type Channel =
  | 'formulario web'
  | 'WhatsApp'
  | 'referido'
  | 'llamada'
  | 'LinkedIn'
  | 'Facebook'
  | 'Instagram'
  | 'correo'

export type ServiceType =
  | 'salud ocupacional'
  | 'examenes medicos'
  | 'atencion domiciliaria'
  | 'contratacion empresarial'
  | 'servicios IPS'
  | 'servicios empresariales IPS'
  | 'otro'

export interface DemoUser {
  email: string
  password: string
  role: UserRole
  name: string
}

export interface Interaction {
  id: string
  prospectId: string
  tipo: 'llamada' | 'correo' | 'WhatsApp' | 'reunion' | 'nota'
  fecha: string
  descripcion: string
  resultado: string
}

export interface LeadAnalysis {
  prioridad: Priority
  temperatura: Temperature
  resumen: string
  proximaAccion: string
  respuestaSugerida: string
}

export interface Prospect {
  id: string
  nombreContacto: string
  empresa: string
  cargo: string
  correo: string
  telefono: string
  canalOrigen: Channel
  servicioInteres: ServiceType
  mensajeInicial: string
  estado: ProspectStatus
  prioridad: Priority
  temperatura: Temperature
  fechaCreacion: string
  fechaUltimoSeguimiento: string
  proximaAccion: string
  notas: string
  resumenIA: string
  respuestaSugeridaIA: string
  campaignId?: string
}

export type CampaignStatus = 'planeada' | 'activa' | 'finalizada'

export interface Campaign {
  id: string
  nombre: string
  canal: Exclude<Channel, 'formulario web' | 'llamada'>
  objetivo: string
  servicioPromocionado: ServiceType
  fechaInicio: string
  fechaFin: string
  estado: CampaignStatus
  leadsGenerados: number
  conversiones: number
  observaciones: string
  recomendacionesIA: string[]
}

export interface ContentRequest {
  serviceType: ServiceType
  channel: Campaign['canal']
}

export interface AppData {
  prospects: Prospect[]
  campaigns: Campaign[]
  interactions: Interaction[]
}

export type ViewKey = 'dashboard' | 'prospects' | 'campaigns' | 'content' | 'roadmap'
