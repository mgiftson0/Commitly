/**
 * Database-backed Achievement Tracking System
 * Tracks and unlocks achievements based on user goals and activities
 */

import { supabase, authHelpers } from "./supabase-client";
// Achievement definitions will be fetched from database
// import { ACHIEVEMENTS } from "./achievements";

/**
 * Check for newly unlocked achievements and save to database
 */
export async function checkAndUnlockAchievements() {
  try {
    const user = await authHelpers.getCurrentUser();
    if (!user) return [];

    // Get user's goals from database
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id);

    if (goalsError) throw goalsError;

    // Get user's already unlocked achievements
    const { data: unlockedAchievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    if (achievementsError) throw achievementsError;

    const unlockedIds = new Set((unlockedAchievements || []).map(ua => ua.achievement_id));
    const userStats = {
      encouragementsSent: 0 // TODO: implement encouragement tracking
    };

    // Get achievements from database
    const { data: achievements, error: achievementsDefError } = await supabase
      .from('achievements')
      .select('*');

    if (achievementsDefError) throw achievementsDefError;

    // Check each achievement
    const newlyUnlocked = [];
    
    for (const achievement of achievements || []) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) continue;

      // Check if conditions are met based on achievement type
      let shouldUnlock = false;
      
      switch (achievement.name) {
        case 'First Goal':
          shouldUnlock = (goals?.length || 0) >= 1;
          break;
        case 'Goal Achiever':
          shouldUnlock = (goals?.filter(g => g.status === 'completed').length || 0) >= 1;
          break;
        case 'Goal Master':
          shouldUnlock = (goals?.filter(g => g.status === 'completed').length || 0) >= 10;
          break;
        default:
          shouldUnlock = false;
      }
      
      if (shouldUnlock) {
        // Save to database
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
            unlocked_at: new Date().toISOString()
          });

        if (!insertError) {
          // Create notification
          await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              title: 'Achievement Unlocked!',
              message: `You've unlocked "${achievement.title}" - ${achievement.description}`,
              type: 'achievement_unlocked',
              read: false,
              data: { 
                achievement_id: achievement.id, 
                rarity: achievement.rarity 
              }
            });

          newlyUnlocked.push(achievement);

          // Trigger celebration event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('achievementUnlocked', {
                detail: achievement
              })
            );
          }
        }
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

/**
 * Trigger achievement check with debounce
 */
export function triggerAchievementCheck() {
  if (typeof window !== 'undefined') {
    clearTimeout((window as any).achievementCheckTimeout);
    (window as any).achievementCheckTimeout = setTimeout(() => {
      checkAndUnlockAchievements();
    }, 1000);
  }
}

/**
 * Get user's unlocked achievements from database
 */
export async function getUserAchievements() {
  try {
    const user = await authHelpers.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return [];
  }
}

/**
 * Get achievement progress for a specific achievement
 */
export async function getAchievementProgress(achievementId: string) {
  try {
    const user = await authHelpers.getCurrentUser();
    if (!user) return null;

    // Get achievement definition from database
    const { data: achievements, error: achievementError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (achievementError || !achievements) return null;
    const achievement = achievements;

    // Get user's goals
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    const userStats = {
      encouragementsSent: 0
    };

    // Calculate progress based on achievement type
    let progress = 0;
    let total = 1;
    
    switch (achievement.name) {
      case 'First Goal':
        progress = Math.min(goals?.length || 0, 1);
        total = 1;
        break;
      case 'Goal Achiever':
        progress = Math.min(goals?.filter(g => g.status === 'completed').length || 0, 1);
        total = 1;
        break;
      case 'Goal Master':
        progress = Math.min(goals?.filter(g => g.status === 'completed').length || 0, 10);
        total = 10;
        break;
    }
    
    return {
      achievement,
      progress,
      total,
      unlocked: progress >= total,
      percentage: Math.round((progress / total) * 100)
    };
  } catch (error) {
    console.error('Error getting achievement progress:', error);
    return null;
  }
}
