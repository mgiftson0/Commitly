import { addActivity } from "./activity-tracker";

export interface StreakData {
  personalStreak: number;
  groupStreak: number;
  overallStreak: number;
  lastUpdated: string;
}

export interface GoalStreak {
  goalId: string;
  personalStreak: number;
  groupStreak?: number;
  lastCompletionDate?: string;
  groupStreakContribution?: boolean;
}

export interface StreakSettings {
  multiActivityThreshold: number; // 0.6 = 60%
  overallStreakQuota: number; // 0.5 = 50% of active goals
  groupStreakThreshold: number; // 0.6 = 60% of group members
  gracePeriodHours: number; // 24 = 1 day grace period
}

const DEFAULT_SETTINGS: StreakSettings = {
  multiActivityThreshold: 0.6,
  overallStreakQuota: 0.5,
  groupStreakThreshold: 0.6,
  gracePeriodHours: 24,
};

export class StreakSystem {
  private settings: StreakSettings;

  constructor(settings: Partial<StreakSettings> = {}) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
  }

  // Check if goal's daily requirement is met
  checkGoalDailyRequirement(goal: any): boolean {
    const today = new Date().toDateString();

    if (goal.type === "single-activity") {
      return (
        goal.completedAt && new Date(goal.completedAt).toDateString() === today
      );
    }

    if (goal.type === "multi-activity") {
      const completedToday =
        goal.activities?.filter(
          (activity: any) =>
            activity.completed &&
            activity.completedAt &&
            new Date(activity.completedAt).toDateString() === today,
        ).length || 0;

      const threshold = Math.ceil(
        goal.activities.length * this.settings.multiActivityThreshold,
      );
      return completedToday >= threshold;
    }

    return false;
  }

  // Check if user contributed to group goal today
  checkGroupContribution(goal: any, userId: string): boolean {
    if (!goal.isGroupGoal) return false;

    const today = new Date().toDateString();
    const userActivities =
      goal.activities?.filter((activity: any) =>
        activity.assigned_members?.includes(userId),
      ) || [];

    const completedToday = userActivities.filter(
      (activity: any) =>
        activity.completed &&
        activity.completedAt &&
        new Date(activity.completedAt).toDateString() === today,
    ).length;

    return completedToday > 0;
  }

  // Calculate group streak for a goal
  calculateGroupStreak(goal: any): number {
    if (!goal.isGroupGoal) return 0;

    const today = new Date().toDateString();
    const totalMembers = goal.groupMembers?.length || 0;

    if (totalMembers === 0) return 0;

    // Count members who completed their assigned activities today
    const membersCompleted = goal.groupMembers.filter((member: any) => {
      const memberActivities =
        goal.activities?.filter((activity: any) =>
          activity.assigned_members?.includes(member.id),
        ) || [];

      return memberActivities.some(
        (activity: any) =>
          activity.completed &&
          activity.completedAt &&
          new Date(activity.completedAt).toDateString() === today,
      );
    }).length;

    const participationRate = membersCompleted / totalMembers;
    const groupStreakContinues =
      participationRate >= this.settings.groupStreakThreshold;

    // Get current group streak from localStorage or goal data
    const currentGroupStreak = goal.groupStreak || 0;

    return groupStreakContinues ? currentGroupStreak + 1 : 0;
  }

  // Update individual goal streak
  updateGoalStreak(goal: any, userId: string): GoalStreak {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    const dailyRequirementMet = this.checkGoalDailyRequirement(goal);
    const groupContribution = this.checkGroupContribution(goal, userId);

    let personalStreak = goal.personalStreak || 0;
    let groupStreak = goal.groupStreak || 0;

    // Update personal streak
    if (dailyRequirementMet) {
      const lastCompletion = goal.lastCompletionDate;
      if (!lastCompletion || lastCompletion === yesterday) {
        personalStreak += 1;
      } else if (lastCompletion !== today) {
        personalStreak = 1; // Start new streak
      }
    } else {
      // Check if grace period applies
      const lastCompletion = goal.lastCompletionDate;
      if (lastCompletion !== today && lastCompletion !== yesterday) {
        personalStreak = 0;
      }
    }

    // Update group streak
    if (goal.isGroupGoal) {
      groupStreak = this.calculateGroupStreak(goal);
    }

    // Trigger notifications
    this.triggerStreakNotifications(goal, personalStreak, groupStreak, userId);

    return {
      goalId: goal.id,
      personalStreak,
      groupStreak: goal.isGroupGoal ? groupStreak : undefined,
      lastCompletionDate: dailyRequirementMet ? today : goal.lastCompletionDate,
      groupStreakContribution: goal.isGroupGoal ? groupContribution : undefined,
    };
  }

  // Calculate overall user streak
  calculateOverallStreak(goals: any[], userId: string): StreakData {
    const today = new Date().toDateString();
    const activeGoals = goals.filter(
      (g) => g.status === "active" && !g.completedAt,
    );

    if (activeGoals.length === 0) {
      return {
        personalStreak: 0,
        groupStreak: 0,
        overallStreak: 0,
        lastUpdated: today,
      };
    }

    // Count goals where daily requirement is met
    const personalGoalsMet = activeGoals.filter(
      (g) => !g.isGroupGoal && this.checkGoalDailyRequirement(g),
    ).length;

    const groupGoalsMet = activeGoals.filter(
      (g) => g.isGroupGoal && this.checkGroupContribution(g, userId),
    ).length;

    const totalGoalsMet = personalGoalsMet + groupGoalsMet;
    const dailyQuota = Math.ceil(
      activeGoals.length * this.settings.overallStreakQuota,
    );

    // Get current streaks from localStorage
    const currentStreaks = this.getCurrentStreaks();

    // Calculate new streaks
    const personalStreaks = activeGoals
      .filter((g) => !g.isGroupGoal)
      .map((g) => g.personalStreak || 0);
    const groupStreaks = activeGoals
      .filter((g) => g.isGroupGoal)
      .map((g) => g.groupStreak || 0);

    const personalStreak =
      personalStreaks.length > 0 ? Math.max(...personalStreaks) : 0;
    const groupStreak = groupStreaks.length > 0 ? Math.max(...groupStreaks) : 0;

    // Update overall streak
    let overallStreak = currentStreaks.overallStreak;
    if (totalGoalsMet >= dailyQuota) {
      const yesterday = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toDateString();
      if (
        currentStreaks.lastUpdated === yesterday ||
        currentStreaks.lastUpdated === today
      ) {
        overallStreak =
          currentStreaks.lastUpdated === today
            ? overallStreak
            : overallStreak + 1;
      } else {
        overallStreak = 1; // Start new overall streak
      }
    } else {
      overallStreak = 0; // Break overall streak
    }

    const newStreakData: StreakData = {
      personalStreak,
      groupStreak,
      overallStreak,
      lastUpdated: today,
    };

    // Save to localStorage
    this.saveStreakData(newStreakData);

    return newStreakData;
  }

  // Trigger streak notifications
  private triggerStreakNotifications(
    goal: any,
    personalStreak: number,
    groupStreak: number,
    userId: string,
  ) {
    const previousPersonalStreak = goal.personalStreak || 0;
    const previousGroupStreak = goal.groupStreak || 0;

    // Personal streak notifications
    if (personalStreak === 1 && previousPersonalStreak === 0) {
      addActivity({
        type: "streak_milestone",
        title: "Streak Started! 🔥",
        message: `You started a streak for "${goal.title}"`,
        goalId: goal.id,
      });
    } else if (
      personalStreak > previousPersonalStreak &&
      [3, 7, 14, 30, 100].includes(personalStreak)
    ) {
      addActivity({
        type: "streak_milestone",
        title: `${personalStreak}-Day Streak! 🏆`,
        message: `Amazing! You've maintained "${goal.title}" for ${personalStreak} days`,
        goalId: goal.id,
      });
    } else if (personalStreak === 0 && previousPersonalStreak > 0) {
      addActivity({
        type: "streak_milestone",
        title: "Streak Ended 💔",
        message: `Your ${previousPersonalStreak}-day streak for "${goal.title}" has ended. Start again tomorrow!`,
        goalId: goal.id,
      });
    }

    // Group streak notifications
    if (goal.isGroupGoal && groupStreak > previousGroupStreak) {
      if (groupStreak === 1) {
        addActivity({
          type: "streak_milestone",
          title: "Group Streak Started! 👥🔥",
          message: `Your group started a streak for "${goal.title}"`,
          goalId: goal.id,
        });
      } else if ([3, 7, 14, 30].includes(groupStreak)) {
        addActivity({
          type: "streak_milestone",
          title: `${groupStreak}-Day Group Streak! 🎉`,
          message: `Your group has maintained "${goal.title}" for ${groupStreak} days together!`,
          goalId: goal.id,
        });
      }
    }
  }

  // Get current streak data from localStorage
  private getCurrentStreaks(): StreakData {
    try {
      const stored = localStorage.getItem("userStreaks");
      return stored
        ? JSON.parse(stored)
        : {
            personalStreak: 0,
            groupStreak: 0,
            overallStreak: 0,
            lastUpdated: new Date().toDateString(),
          };
    } catch {
      return {
        personalStreak: 0,
        groupStreak: 0,
        overallStreak: 0,
        lastUpdated: new Date().toDateString(),
      };
    }
  }

  // Save streak data to localStorage
  private saveStreakData(streakData: StreakData) {
    try {
      localStorage.setItem("userStreaks", JSON.stringify(streakData));
    } catch (error) {
      console.error("Failed to save streak data:", error);
    }
  }

  // Check for at-risk streaks (call this periodically)
  checkAtRiskStreaks(goals: any[], userId: string) {
    const currentHour = new Date().getHours();
    if (currentHour !== 22) return; // Only check at 10 PM

    const today = new Date().toDateString();
    const activeGoals = goals.filter(
      (g) => g.status === "active" && !g.completedAt,
    );

    activeGoals.forEach((goal) => {
      const hasPersonalStreak = (goal.personalStreak || 0) > 0;
      const dailyRequirementMet = this.checkGoalDailyRequirement(goal);

      if (hasPersonalStreak && !dailyRequirementMet) {
        addActivity({
          type: "streak_milestone",
          title: "Streak at Risk! ⚠️",
          message: `Your ${goal.personalStreak}-day streak for "${goal.title}" is at risk. Complete it before midnight!`,
          goalId: goal.id,
        });
      }

      if (goal.isGroupGoal) {
        const groupContribution = this.checkGroupContribution(goal, userId);
        const hasGroupStreak = (goal.groupStreak || 0) > 0;

        if (hasGroupStreak && !groupContribution) {
          addActivity({
            type: "streak_milestone",
            title: "Group Streak at Risk! 👥⚠️",
            message: `The group's ${goal.groupStreak}-day streak for "${goal.title}" needs your contribution!`,
            goalId: goal.id,
          });
        }
      }
    });
  }
}

// Export singleton instance
export const streakSystem = new StreakSystem();

// Helper functions for easy access
export function updateGoalStreak(goal: any, userId: string = "mock-user-id") {
  return streakSystem.updateGoalStreak(goal, userId);
}

export function calculateOverallStreak(
  goals: any[],
  userId: string = "mock-user-id",
) {
  return streakSystem.calculateOverallStreak(goals, userId);
}

export function checkAtRiskStreaks(
  goals: any[],
  userId: string = "mock-user-id",
) {
  return streakSystem.checkAtRiskStreaks(goals, userId);
}
