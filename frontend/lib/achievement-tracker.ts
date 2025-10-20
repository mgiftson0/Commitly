import { getNewlyUnlockedAchievements } from "./achievements";
import { addActivity } from "./activity-tracker";

export function checkAndNotifyAchievements() {
  try {
    const storedGoals = localStorage.getItem("goals");
    const goals = storedGoals ? JSON.parse(storedGoals) : [];
    const userStats = {
      encouragementsSent: parseInt(
        localStorage.getItem("encouragementsSent") || "0",
      ),
    };

    const newlyUnlocked = getNewlyUnlockedAchievements(goals, userStats);

    newlyUnlocked.forEach((achievement) => {
      // Add notification
      addActivity({
        type: "achievement_unlocked",
        title: "Achievement Unlocked!",
        message: `You've unlocked "${achievement.title}" - ${achievement.description}`,
        data: { achievementId: achievement.id, rarity: achievement.rarity },
      });

      // Trigger celebration
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("achievementUnlocked", {
            detail: achievement,
          }),
        );
      }
    });

    return newlyUnlocked;
  } catch (error) {
    console.error("Error checking achievements:", error);
    return [];
  }
}

export function triggerAchievementCheck() {
  // Debounce achievement checks
  if (typeof window !== "undefined") {
    clearTimeout((window as any).achievementCheckTimeout);
    (window as any).achievementCheckTimeout = setTimeout(() => {
      checkAndNotifyAchievements();
    }, 1000);
  }
}
