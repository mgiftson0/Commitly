import { supabase } from '@/lib/supabase-client'

export interface SeasonalCohort {
  id: string
  name: string
  description: string
  duration_type: 'annual' | 'quarterly' | 'biannual'
  year: number
  quarter?: number
  period?: 'H1' | 'H2'
  max_members: number
  current_members: number
  is_public: boolean
  created_by: string
  created_at: string
}

export interface CohortMember {
  id: string
  cohort_id: string
  user_id: string
  goal_id: string
  joined_at: string
}



export const cohortsApi = {
  // Get available cohorts
  async getCohorts(durationType?: string): Promise<SeasonalCohort[]> {
    let query = supabase
      .from('seasonal_cohorts')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (durationType) {
      query = query.eq('duration_type', durationType)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // Join cohort
  async joinCohort(cohortId: string, goalId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Check if cohort is full
    const { data: cohort } = await supabase
      .from('seasonal_cohorts')
      .select('current_members, max_members')
      .eq('id', cohortId)
      .single()

    if (cohort && cohort.current_members >= cohort.max_members) {
      throw new Error('Cohort is full')
    }

    // Add member
    const { error: memberError } = await supabase
      .from('seasonal_cohort_members')
      .insert({
        cohort_id: cohortId,
        user_id: user.id,
        goal_id: goalId
      })

    if (memberError) throw memberError

    // Update member count
    const { error: updateError } = await supabase
      .from('seasonal_cohorts')
      .update({ 
        current_members: (cohort?.current_members || 0) + 1 
      })
      .eq('id', cohortId)

    if (updateError) throw updateError
  },

  // Get cohort members
  async getCohortMembers(cohortId: string): Promise<CohortMember[]> {
    const { data, error } = await supabase
      .from('seasonal_cohort_members')
      .select(`
        *,
        profiles(username, avatar_url),
        goals(title, progress)
      `)
      .eq('cohort_id', cohortId)

    if (error) throw error
    return data || []
  }
}