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
    username: 'mockuser',
    display_name: 'Mock User',
    phone_number: '+1234567890',
    bio: 'This is a mock user account for testing purposes.',
    profile_picture_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export async function mockDelay(ms: number = 500) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if we should bypass auth and use mock mode
 * Returns the mock user if enabled, null otherwise
 */
export function checkMockAuth() {
  if (isMockAuthEnabled()) {
    return getMockUser()
  }
  return null
}

/**
 * Mock success response for database operations
 */
export async function mockSuccess<T>(data: T, delay: number = 300): Promise<T> {
  await mockDelay(delay)
  return data
}
