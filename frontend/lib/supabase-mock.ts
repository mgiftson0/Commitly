// Mock Supabase client that doesn't require any backend
// All data is stored in localStorage for persistence

export type User = {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export type AuthSession = {
  user: User
  access_token: string
}

export type AuthResponse = {
  data: {
    user: User | null
    session: AuthSession | null
  }
  error: Error | null
}

export type UserResponse = {
  data: {
    user: User | null
  }
  error: Error | null
}

// Mock data storage
const STORAGE_KEYS = {
  USER: 'commitly_mock_user',
  SESSION: 'commitly_mock_session',
  GOALS: 'commitly_mock_goals_db',
  NOTIFICATIONS: 'commitly_mock_notifications_db',
  USERS: 'commitly_mock_users_db'
}

// Helper to simulate API delays
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Helper to get data from localStorage
function getStoredData(key: string, defaultValue: any = null) {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

// Helper to set data in localStorage
function setStoredData(key: string, value: any) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors
  }
}

// Mock auth implementation
class MockAuth {
  async signUp({ email, password }: { email: string, password: string }): Promise<AuthResponse> {
    await delay()
    
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      user_metadata: {}
    }
    
    const session: AuthSession = {
      user,
      access_token: `token_${Date.now()}`
    }
    
    setStoredData(STORAGE_KEYS.USER, user)
    setStoredData(STORAGE_KEYS.SESSION, session)
    
    return {
      data: { user, session },
      error: null
    }
  }
  
  async signInWithPassword({ email, password }: { email: string, password: string }): Promise<AuthResponse> {
    await delay()
    
    // For demo purposes, accept any email/password
    const user: User = {
      id: `user_${email.replace('@', '_').replace('.', '_')}`,
      email,
      user_metadata: {
        full_name: email.split('@')[0]
      }
    }
    
    const session: AuthSession = {
      user,
      access_token: `token_${Date.now()}`
    }
    
    setStoredData(STORAGE_KEYS.USER, user)
    setStoredData(STORAGE_KEYS.SESSION, session)
    
    return {
      data: { user, session },
      error: null
    }
  }
  
  async signOut(): Promise<{ error: Error | null }> {
    await delay(100)
    
    setStoredData(STORAGE_KEYS.USER, null)
    setStoredData(STORAGE_KEYS.SESSION, null)
    
    return { error: null }
  }
  
  async getUser(): Promise<UserResponse> {
    await delay(100)
    
    const user = getStoredData(STORAGE_KEYS.USER)
    return {
      data: { user },
      error: null
    }
  }
  
  async resetPasswordForEmail(email: string): Promise<{ error: Error | null }> {
    await delay()
    // Just simulate success
    return { error: null }
  }
}

// Mock database query builder
class MockQueryBuilder {
  private tableName: string
  private queryData: any[] = []
  private filters: any[] = []
  private selectedColumns: string | string[] = '*'
  private orderBy?: { column: string, ascending: boolean }
  private limitCount?: number
  
  constructor(tableName: string) {
    this.tableName = tableName
  }
  
  select(columns: string = '*') {
    this.selectedColumns = columns
    return this
  }
  
  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value })
    return this
  }
  
  neq(column: string, value: any) {
    this.filters.push({ type: 'neq', column, value })
    return this
  }
  
  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending ?? true }
    return this
  }
  
  limit(count: number) {
    this.limitCount = count
    return this
  }
  
  single() {
    // Return single result instead of array
    this.limitCount = 1
    return this
  }
  
  private applyFilters(data: any[]) {
    return data.filter(item => {
      return this.filters.every(filter => {
        switch (filter.type) {
          case 'eq':
            return item[filter.column] === filter.value
          case 'neq':
            return item[filter.column] !== filter.value
          default:
            return true
        }
      })
    })
  }
  
  private applyOrder(data: any[]) {
    if (!this.orderBy) return data
    
    return [...data].sort((a, b) => {
      const aVal = a[this.orderBy!.column]
      const bVal = b[this.orderBy!.column]
      
      if (aVal < bVal) return this.orderBy!.ascending ? -1 : 1
      if (aVal > bVal) return this.orderBy!.ascending ? 1 : -1
      return 0
    })
  }
  
  async then(resolve?: any, reject?: any) {
    await delay(200)
    
    try {
      let data = this.getTableData()
      data = this.applyFilters(data)
      data = this.applyOrder(data)
      
      if (this.limitCount) {
        data = data.slice(0, this.limitCount)
        if (this.limitCount === 1 && this.selectedColumns !== '*') {
          // Return single object for .single() calls
          const result = { data: data[0] || null, error: null }
          return resolve ? resolve(result) : result
        }
      }
      
      const result = { data, error: null }
      return resolve ? resolve(result) : result
    } catch (error) {
      const result = { data: null, error }
      return reject ? reject(result) : result
    }
  }
  
  private getTableData(): any[] {
    const key = `${STORAGE_KEYS.GOALS}_${this.tableName}`
    return getStoredData(key, [])
  }
  
  private setTableData(data: any[]) {
    const key = `${STORAGE_KEYS.GOALS}_${this.tableName}`
    setStoredData(key, data)
  }
  
  async insert(values: any | any[]) {
    await delay(200)
    
    try {
      const data = this.getTableData()
      const itemsToInsert = Array.isArray(values) ? values : [values]
      
      const newItems = itemsToInsert.map(item => ({
        ...item,
        id: item.id || `${this.tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      data.push(...newItems)
      this.setTableData(data)
      
      return { data: Array.isArray(values) ? newItems : newItems[0], error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
  
  async update(values: any) {
    await delay(200)
    
    try {
      const data = this.getTableData()
      let updated = false
      
      const updatedData = data.map(item => {
        const matches = this.filters.every(filter => {
          switch (filter.type) {
            case 'eq':
              return item[filter.column] === filter.value
            case 'neq':
              return item[filter.column] !== filter.value
            default:
              return true
          }
        })
        
        if (matches) {
          updated = true
          return {
            ...item,
            ...values,
            updated_at: new Date().toISOString()
          }
        }
        return item
      })
      
      if (updated) {
        this.setTableData(updatedData)
      }
      
      return { data: updated ? values : null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
  
  async delete() {
    await delay(200)
    
    try {
      const data = this.getTableData()
      
      const filteredData = data.filter(item => {
        return !this.filters.every(filter => {
          switch (filter.type) {
            case 'eq':
              return item[filter.column] === filter.value
            case 'neq':
              return item[filter.column] !== filter.value
            default:
              return true
          }
        })
      })
      
      this.setTableData(filteredData)
      
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Main mock Supabase client
export const mockSupabase = {
  auth: new MockAuth(),
  
  from(tableName: string) {
    return new MockQueryBuilder(tableName)
  }
}

// Export function that returns the mock client
export function getSupabaseClient() {
  return mockSupabase
}

// Export types for compatibility
export type { AuthResponse as AuthResponseType, User as UserType }
export type SupabaseClient = typeof mockSupabase
export type Database = any // For compatibility with existing type imports