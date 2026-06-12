import { beforeEach, describe, expect, it } from 'vitest'
import { clearAllData, getCampaigns, getProspects, restoreDemoData } from './storageService'

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('restaura datos demo de prospectos y campanas', () => {
    restoreDemoData()

    expect(getProspects()).toHaveLength(5)
    expect(getCampaigns()).toHaveLength(3)
  })

  it('limpia los datos persistidos del MVP', () => {
    restoreDemoData()
    clearAllData()

    expect(getProspects()).toHaveLength(0)
    expect(getCampaigns()).toHaveLength(0)
  })
})
