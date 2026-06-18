import { describe, expect, it } from 'vitest'
import { GetSystemInfo } from '../../../src/modules/system/application/use-cases/get-system-info.js'

describe('GetSystemInfo', () => {
  it('returns safe runtime information without dependency URLs or API keys', () => {
    const useCase = new GetSystemInfo({
      serviceName: 'alphamedi-ips-backend',
      version: '0.1.0',
      environment: 'test',
      aiProvider: 'mock',
      enabledModules: ['system'],
    })

    expect(useCase.execute()).toEqual({
      serviceName: 'alphamedi-ips-backend',
      version: '0.1.0',
      environment: 'test',
      aiProvider: 'mock',
      enabledModules: ['system'],
    })
  })
})
