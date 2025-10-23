import { supabase } from './supabase-client'

export interface Encouragement {
  id: string
  sender_id: string
  receiver_id: string
  goal_id?: string
  message: string
  type: 'cheer' | 'milestone' | 'streak' | 'comeback' | 'general'
  created_at: string
  sender_profile?: {
    first_name: string
    last_name: string
    username: string
    profile_picture_url?: string
  }
}

export const encouragementSystem = {
  // Send encouragement
  async sendEncouragement(receiverId: string, message: string, type: Encouragement['type'], goalId?: string) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('encouragements')
      .insert({
        sender_id: user.user.id,
        receiver_id: receiverId,
        goal_id: goalId,
        message,
        type
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for receiver
    await supabase
      .from('notifications')
      .insert({
        user_id: receiverId,
        title: 'New Encouragement!',
        message: `Someone sent you encouragement: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
        type: 'encouragement',
        read: false,
        data: { encouragement_id: data.id, sender_id: user.user.id }
      })

    return data
  },

  // Get encouragements received by user
  async getReceivedEncouragements(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('encouragements')
      .select(`
        *,
        sender_profile:profiles!encouragements_sender_id_fkey(
          first_name,
          last_name,
          username,
          profile_picture_url
        )
      `)
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as Encouragement[]
  },

  // Get encouragements sent by user
  async getSentEncouragements(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('encouragements')
      .select(`
        *,
        receiver_profile:profiles!encouragements_receiver_id_fkey(
          first_name,
          last_name,
          username,
          profile_picture_url
        )
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Auto-generate encouragement suggestions based on context
  generateSuggestions(context: {
    type: 'streak' | 'milestone' | 'comeback' | 'general'
    streakDays?: number
    goalTitle?: string
    partnerName?: string
  }) {
    const { type, streakDays, goalTitle, partnerName } = context

    const suggestions = {
      streak: [
        `Amazing ${streakDays}-day streak! Keep it up! 🔥`,
        `${streakDays} days strong! You're unstoppable! 💪`,
        `Consistency is key and you're nailing it! ${streakDays} days! ⭐`,
        `${streakDays} days of dedication - incredible! 🚀`
      ],
      milestone: [
        `Congratulations on reaching this milestone! 🎉`,
        `You did it! So proud of your progress! 🏆`,
        `Another goal conquered! You're amazing! ✨`,
        `Milestone achieved! Time to celebrate! 🎊`
      ],
      comeback: [
        `Welcome back! Every restart is a new opportunity! 💫`,
        `You're back and stronger than ever! 💪`,
        `Comeback mode activated! Let's do this! 🚀`,
        `Fresh start, same determination! You've got this! ⭐`
      ],
      general: [
        `You're doing great! Keep pushing forward! 💪`,
        `Believe in yourself - I believe in you! ✨`,
        `Every step counts! You're making progress! 🚀`,
        `Stay strong and keep going! 🌟`,
        `You've got this! I'm cheering for you! 📣`
      ]
    }

    return suggestions[type] || suggestions.general
  }
}