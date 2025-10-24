"use client";

import { useEffect, useState } from "react";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { Celebration } from "@/components/achievements/celebration";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { ACHIEVEMENTS, checkAchievements } from "@/lib/achievements";
import { MainLayout } from "@/components/layout/main-layout";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAchievement, setCelebrationAchievement] =
    useState<any>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = () => {
    try {
      const storedGoals = localStorage.getItem("goals");
      const goals = storedGoals ? JSON.parse(storedGoals) : [];
      const userStats = {
        encouragementsSent: parseInt(
          localStorage.getItem("encouragementsSent") || "0",
        ),
      };

      const checkedAchievements = checkAchievements(goals, userStats);
      setAchievements(checkedAchievements || []);
    } catch {
      setAchievements(
        (ACHIEVEMENTS || []).map((a) => ({
          ...a,
          unlocked: false,
          progress: 0,
          total: a.condition ? a.condition([], {}).total : 0,
          progressPercentage: 0,
        })),
      );
    }
  };

  const unlockedCount = (achievements || []).filter((a) => a.unlocked).length;
  const totalCount = (achievements || []).length;

  const rarityCount = (achievements || []).reduce(
    (acc, achievement) => {
      if (achievement.unlocked) {
        acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-8 w-8 text-yellow-600" />
          <h1 className="text-3xl font-bold">Your Achievements</h1>
        </div>

        <Card className="mb-6 backdrop-blur-sm bg-card/80 border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {unlockedCount}/{totalCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Achievements Unlocked
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(rarityCount).map(([rarity, count]) => (
                  <Badge key={rarity} variant="secondary" className="text-xs">
                    {count as number} {rarity}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(achievements || []).map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              size="md"
            />
          ))}
        </div>

        {/* Celebration Modal */}
        <Celebration
          show={showCelebration}
          onComplete={() => setShowCelebration(false)}
          achievement={celebrationAchievement}
        />
      </div>
    </MainLayout>
  );
}
