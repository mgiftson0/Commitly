// Mock authentication - always enabled since we're removing backend dependency
export function isMockAuthEnabled(): boolean {
  return true
}

export function mockDelay(ms: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}