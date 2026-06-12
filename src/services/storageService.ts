import { demoData } from '../data/demoData'
import type { AppData, Campaign, Interaction, Prospect } from '../types'

const STORAGE_KEYS = {
  prospects: 'ips-crm-prospects',
  campaigns: 'ips-crm-campaigns',
  interactions: 'ips-crm-interactions',
  user: 'ips-crm-current-user',
} as const

function readCollection<T>(key: string, fallback: T[]): T[] {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback

  try {
    return JSON.parse(raw) as T[]
  } catch {
    return fallback
  }
}

function writeCollection<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function initializeDemoData() {
  if (!localStorage.getItem(STORAGE_KEYS.prospects)) {
    restoreDemoData()
  }
}

export function restoreDemoData() {
  writeCollection(STORAGE_KEYS.prospects, demoData.prospects)
  writeCollection(STORAGE_KEYS.campaigns, demoData.campaigns)
  writeCollection(STORAGE_KEYS.interactions, demoData.interactions)
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.prospects)
  localStorage.removeItem(STORAGE_KEYS.campaigns)
  localStorage.removeItem(STORAGE_KEYS.interactions)
}

export function getProspects() {
  return readCollection<Prospect>(STORAGE_KEYS.prospects, [])
}

export function saveProspects(prospects: Prospect[]) {
  writeCollection(STORAGE_KEYS.prospects, prospects)
}

export function getCampaigns() {
  return readCollection<Campaign>(STORAGE_KEYS.campaigns, [])
}

export function saveCampaigns(campaigns: Campaign[]) {
  writeCollection(STORAGE_KEYS.campaigns, campaigns)
}

export function getInteractions() {
  return readCollection<Interaction>(STORAGE_KEYS.interactions, [])
}

export function saveInteractions(interactions: Interaction[]) {
  writeCollection(STORAGE_KEYS.interactions, interactions)
}

export function getAppData(): AppData {
  return {
    prospects: getProspects(),
    campaigns: getCampaigns(),
    interactions: getInteractions(),
  }
}

export function setCurrentUser(value: string) {
  localStorage.setItem(STORAGE_KEYS.user, value)
}

export function getCurrentUser() {
  return localStorage.getItem(STORAGE_KEYS.user)
}

export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.user)
}
