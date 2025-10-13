/**
 * Mock Authentication Utilities
 * 
 * These utilities help bypass Supabase authentication during development
 * when NEXT_PUBLIC_USE_MOCK_AUTH=true is set in .env.local
 */

export function isMockAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'
}

export function getMockUser() {
  return {
    id: 'mock-user-id-123',
    email: 'mockuser@commitly.dev',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export async function mockDelay(ms: number = 500) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
