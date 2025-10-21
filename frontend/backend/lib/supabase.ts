// Mock Supabase client that uses localStorage for persistence
// No external dependencies needed

export type MockSupabaseClient = {
  from: (table: string) => MockQueryBuilder
  auth: typeof mockAuth
}

export type MockQueryBuilder = {
  select: (columns?: string) => MockQueryBuilder
  insert: (data: any | any[]) => MockQueryBuilder
  update: (data: any) => MockQueryBuilder
  delete: () => MockQueryBuilder
  eq: (column: string, value: any) => MockQueryBuilder
  neq: (column: string, value: any) => MockQueryBuilder
  order: (column: string, options?: { ascending?: boolean }) => MockQueryBuilder
  limit: (count: number) => MockQueryBuilder
  single: () => MockQueryBuilder
  then: (resolve?: any, reject?: any) => Promise<any>
}

// Mock auth implementation
const mockAuth = {
  signUp: async ({ email, password }: { email: string; password: string }) => {
    const user = {
      id: `user_${Date.now()}`,
      email,
      user_metadata: { full_name: email.split('@')[0] }
    }
    const session = {
      user,
      access_token: `token_${Date.now()}`
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('commitly_mock_user', JSON.stringify(user))
      localStorage.setItem('commitly_mock_session', JSON.stringify(session))
    }

    return { data: { user, session }, error: null }
  },

  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    const user = {
      id: `user_${email.replace(/[@.]/g, '_')}`,
      email,
      user_metadata: { full_name: email.split('@')[0] }
    }
    const session = {
      user,
      access_token: `token_${Date.now()}`
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('commitly_mock_user', JSON.stringify(user))
      localStorage.setItem('commitly_mock_session', JSON.stringify(session))
    }

    return { data: { user, session }, error: null }
  },

  signOut: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('commitly_mock_user')
      localStorage.removeItem('commitly_mock_session')
    }
    return { error: null }
  },

  getUser: async () => {
    if (typeof window === 'undefined') return { data: { user: null }, error: null }
    const user = localStorage.getItem('commitly_mock_user')
    return { data: { user: user ? JSON.parse(user) : null }, error: null }
  }
}

// Mock query builder with chaining support
class MockQueryBuilderImpl implements MockQueryBuilder {
  private tableName: string
  private queryData: any[] = []
  private filters: Array<{ type: string; column: string; value: any }> = []
  private selectedColumns: string | string[] = '*'
  private orderBy?: { column: string; ascending: boolean }
  private limitCount?: number
  private isSingle = false
  private insertData?: any | any[]
  private updateData?: any
  private selectAfterInsert = false
  private selectAfterUpdate = false

  constructor(tableName: string) {
    this.tableName = tableName
  }

  select(columns: string = '*') {
    this.selectedColumns = columns
    this.selectAfterInsert = true
    this.selectAfterUpdate = true
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
    this.limitCount = 1
    this.isSingle = true
    return this
  }

  insert(values: any | any[]) {
    this.insertData = values
    return this
  }

  update(values: any) {
    this.updateData = values
    return this
  }

  private getStoredData(): any[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(`commitly_mock_${this.tableName}`)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  private setStoredData(data: any[]) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`commitly_mock_${this.tableName}`, JSON.stringify(data))
    } catch {}
  }

  private applyFilters(data: any[]): any[] {
    return data.filter(item =>
      this.filters.every(filter => {
        switch (filter.type) {
          case 'eq': return item[filter.column] === filter.value
          case 'neq': return item[filter.column] !== filter.value
          default: return true
        }
      })
    )
  }

  private applyOrder(data: any[]): any[] {
    if (!this.orderBy) return data
    return [...data].sort((a, b) => {
      const aVal = a[this.orderBy!.column]
      const bVal = b[this.orderBy!.column]
      if (aVal < bVal) return this.orderBy!.ascending ? -1 : 1
      if (aVal > bVal) return this.orderBy!.ascending ? 1 : -1
      return 0
    })
  }

  // Execute the query
  then(resolve?: any, reject?: any) {
    const execute = async () => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Simulate delay

      try {
        if (this.insertData !== undefined) {
          const data = this.getStoredData()
          const items = Array.isArray(this.insertData) ? this.insertData : [this.insertData]

          const newItems = items.map(item => ({
            ...item,
            id: item.id || `${this.tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))

          data.push(...newItems)
          this.setStoredData(data)

          if (this.selectAfterInsert) {
            const result = Array.isArray(this.insertData) ? newItems : newItems[0]
            return { data: result, error: null }
          }
          return { data: null, error: null }
        }

        if (this.updateData !== undefined) {
          const data = this.getStoredData()
          const updatedData = data.map(item => {
            const matches = this.filters.every(filter =>
              filter.type === 'eq' ? item[filter.column] === filter.value : true
            )
            if (matches) {
              return { ...item, ...this.updateData, updated_at: new Date().toISOString() }
            }
            return item
          })

          this.setStoredData(updatedData)

          if (this.selectAfterUpdate) {
            return { data: this.updateData, error: null }
          }
          return { data: null, error: null }
        }

        // Regular query execution
        let data = this.getStoredData()
        data = this.applyFilters(data)
        data = this.applyOrder(data)

        if (this.limitCount) {
          data = data.slice(0, this.limitCount)
          if (this.limitCount === 1 && this.isSingle) {
            // Return single object for .single() calls
            const result = { data: data[0] || null, error: null }
            return result
          }
        }

        const result = { data, error: null }
        return result
      } catch (error) {
        return { data: null, error }
      }
    }

    const promise = execute()
    if (resolve && reject) {
      promise.then(resolve, reject)
    }
    return promise
  }

  // Support for async/await
  async await() {
    return this.then()
  }
}

// Main mock Supabase client
let mockSupabaseInstance: MockSupabaseClient | null = null

export const getSupabase = (): MockSupabaseClient => {
  if (!mockSupabaseInstance) {
    mockSupabaseInstance = {
      from: (table: string) => new MockQueryBuilderImpl(table),
      auth: mockAuth
    }
  }
  return mockSupabaseInstance
}

export function getSupabaseClient() {
  return getSupabase()
}

// Helper to check if Supabase is configured (always true for mock)
export function isSupabaseConfigured() {
  return true
}

// Database Types
export type User = {
  id: string
  username: string
  display_name: string
  phone_number: string
  email: string
  bio?: string
  profile_picture_url?: string
  created_at: string
  updated_at: string
}

export type Goal = {
  id: string
  user_id: string
  title: string
  description?: string
  goal_type: 'single' | 'multi' | 'recurring'
  visibility: 'public' | 'private' | 'restricted'
  start_date: string
  end_date?: string
  recurrence_pattern?: string
  recurrence_days?: string[]
  default_time_allocation?: number
  is_suspended: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export type Activity = {
  id: string
  goal_id: string
  title: string
  description?: string
  is_completed: boolean
  completed_at?: string
  order_index: number
  created_at: string
  updated_at: string
}

export type Streak = {
  id: string
  goal_id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_completed_date?: string
  total_completions: number
  created_at: string
  updated_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  notification_type: 'goal_created' | 'goal_completed' | 'goal_missed' | 'accountability_request' | 'reminder' | 'partner_update'
  related_goal_id?: string
  related_user_id?: string
  is_read: boolean
  created_at: string
}

export type AccountabilityPartner = {
  id: string
  requester_id: string
  partner_id: string
  goal_id?: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  updated_at: string
}
