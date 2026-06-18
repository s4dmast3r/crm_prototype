export interface SystemInfo {
  serviceName: string
  version: string
  environment: string
  aiProvider: 'mock' | 'openai'
  enabledModules: string[]
}

export class GetSystemInfo {
  constructor(private readonly info: SystemInfo) {}

  execute(): SystemInfo {
    return {
      ...this.info,
      enabledModules: [...this.info.enabledModules],
    }
  }
}
