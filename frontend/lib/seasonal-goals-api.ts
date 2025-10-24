import { supabase } from '@/lib/supabase-client'

export interface SeasonalGoal {
  id: string
  title: string
  description: string
  category: string
  duration_type: 'annual' | 'quarterly' | 'biannual'
  seasonal_year: number
  seasonal_quarter?: number
  seasonal_period?: 'H1' | 'H2'
  seasonal_theme?: string
  target_date: string
  is_completed: boolean
  user_id: string
  created_at: string
}

export interface SeasonalTemplate {
  id: string
  title: string
  description: string
  category: string
  duration_type: 'annual' | 'quarterly' | 'biannual'
  suggested_activities: string[]
  difficulty_level: 'easy' | 'medium' | 'hard'
}

export interface SeasonalMilestone {
  id: string
  goal_id: string
  title: string
  description?: string
  target_date: string
  is_completed: boolean
  order_index: number
}



export const seasonalGoalsApi = {
  // Check if creation window is open (Dec 15 - Jan 15)
  isCreationWindowOpen(): boolean {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    return (month === 12 && day >= 15) || (month === 1 && day <= 15)
  },

  // Get seasonal goals for user
  async getSeasonalGoals(durationType?: string): Promise<SeasonalGoal[]> {
    let query = supabase
      .from('goals')
      .select('*')
      .eq('is_seasonal', true)
      .order('created_at', { ascending: false })

    if (durationType) {
      query = query.eq('duration_type', durationType)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // Create seasonal goal
  async createSeasonalGoal(goal: Omit<SeasonalGoal, 'id' | 'created_at' | 'user_id'>): Promise<SeasonalGoal> {
    if (!this.isCreationWindowOpen()) {
      throw new Error('Seasonal goals can only be created between December 15th and January 15th')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('goals')
      .insert({
        ...goal,
        is_seasonal: true,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get templates
  async getTemplates(durationType?: string): Promise<SeasonalTemplate[]> {
    let query = supabase
      .from('seasonal_goal_templates')
      .select('*')
      .order('popularity_score', { ascending: false })

    if (durationType) {
      query = query.eq('duration_type', durationType)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // Get milestones for goal
  async getMilestones(goalId: string): Promise<SeasonalMilestone[]> {
    const { data, error } = await supabase
      .from('seasonal_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('order_index')

    if (error) throw error
    return data || []
  },

  // Create milestone
  async createMilestone(milestone: Omit<SeasonalMilestone, 'id'>): Promise<SeasonalMilestone> {
    const { data, error } = await supabase
      .from('seasonal_milestones')
      .insert(milestone)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update milestone completion
  async updateMilestone(id: string, updates: Partial<SeasonalMilestone>): Promise<void> {
    const { error } = await supabase
      .from('seasonal_milestones')
      .update(updates)
      .eq('id', id)

    if (error) throw error
  }
}