"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  Flame,
  Calendar,
  Users,
  Star,
  Award,
  CheckCircle2,
  Lock,
  Zap,
  BookOpen,
  Dumbbell,
  Heart,
  Palette,
  Camera,
  Music,
  Briefcase,
  GraduationCap,
  Crown,
  Sparkles
} from "lucide-react";
import { ACHIEVEMENTS, checkAchievements } from "@/lib/achievements";
import { MainLayout } from "@/components/layout/main-layout";
import { BalloonAchievementModal } from "@/components/achievements/balloon-achievement-modal";
import { authHelpers, supabase } from "@/lib/supabase-client";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showBalloonModal, setShowBalloonModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const user = await authHelpers.getCurrentUser();
      if (!user) return;

      // Get goals data for progress calculation
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      // Get user achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', user.id);

      // Get partners count
      const { data: partners } = await supabase
        .from('accountability_partners')
        .select('*')
        .or(`user_id.eq.${user.id},partner_id.eq.${user.id}`)
        .eq('status', 'accepted');

      // Calculate stats
      const goalsData = goals || [];
      const partnersData = partners || [];
      const userStats = {
        encouragementsSent: 0, // Would need to track this
        totalGoals: goalsData.length,
        completedGoals: goalsData.filter(g => g.completed_at).length,
        activeGoals: goalsData.filter(g => !g.completed_at && !g.is_suspended).length,
        partnersCount: partnersData.length
      };

      // Check achievements with real data
      const checkedAchievements = checkAchievements(goalsData, userStats);

      // Merge with database achievements
      const userAchievementIds = new Set(userAchievements?.map(ua => ua.achievements?.id) || []);
      const finalAchievements = checkedAchievements.map(achievement => ({
        ...achievement,
        unlocked: userAchievementIds.has(achievement.id),
        unlocked_at: userAchievements?.find(ua => ua.achievements?.id === achievement.id)?.unlocked_at
      }));

      setAchievements(finalAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
      // Fallback to static achievements
      setAchievements((ACHIEVEMENTS || []).map((a) => ({
        ...a,
        unlocked: false,
        progress: 0,
        total: a.condition ? a.condition([], {}).total : 0,
        progressPercentage: 0,
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementClick = (achievement: any) => {
    setSelectedAchievement(achievement);
    setShowBalloonModal(true);
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const rarityCount = achievements.reduce(
    (acc, achievement) => {
      if (achievement.unlocked) {
        acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const categories = [
    { id: 'all', label: 'All Achievements', count: totalCount },
    { id: 'unlocked', label: 'Unlocked', count: unlockedCount },
    { id: 'locked', label: 'Locked', count: totalCount - unlockedCount },
    { id: 'common', label: 'Common', count: rarityCount.common || 0 },
    { id: 'rare', label: 'Rare', count: rarityCount.rare || 0 },
    { id: 'epic', label: 'Epic', count: rarityCount.epic || 0 },
    { id: 'legendary', label: 'Legendary', count: rarityCount.legendary || 0 },
  ];

  const getFilteredAchievements = (category: string) => {
    switch (category) {
      case 'unlocked':
        return achievements.filter(a => a.unlocked);
      case 'locked':
        return achievements.filter(a => !a.unlocked);
      case 'common':
        return achievements.filter(a => a.rarity === 'common');
      case 'rare':
        return achievements.filter(a => a.rarity === 'rare');
      case 'epic':
        return achievements.filter(a => a.rarity === 'epic');
      case 'legendary':
        return achievements.filter(a => a.rarity === 'legendary');
      default:
        return achievements;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading achievements...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Achievements
              </h1>
              <p className="text-muted-foreground">Track your progress and unlock badges</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{unlockedCount}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Unlocked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalCount}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{completionRate}%</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {Object.keys(rarityCount).length}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Rarities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Categories */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-1">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-xs sm:text-sm px-2 py-2"
              >
                {category.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getFilteredAchievements(category.id).map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`hover-lift transition-all duration-200 cursor-pointer ${
                      achievement.unlocked
                        ? 'border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => handleAchievementClick(achievement)}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      {/* Achievement Icon */}
                      <div className="relative">
                        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center ${
                          achievement.unlocked
                            ? 'bg-green-100 dark:bg-green-900/50'
                            : 'bg-muted'
                        }`}>
                          {achievement.unlocked ? (
                            <achievement.icon className="h-8 w-8 text-green-600" />
                          ) : (
                            <Lock className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        {achievement.unlocked && (
                          <div className="absolute -top-1 -right-1">
                            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                          </div>
                        )}
                      </div>

                      {/* Achievement Info */}
                      <div className="space-y-2">
                        <h3 className={`font-bold text-sm leading-tight ${
                          achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {achievement.description}
                        </p>
                      </div>

                      {/* Rarity Badge */}
                      <Badge
                        variant={achievement.unlocked ? "default" : "secondary"}
                        className={`text-xs ${
                          achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                          achievement.rarity === 'epic' ? 'bg-purple-500 text-white' :
                          achievement.rarity === 'rare' ? 'bg-blue-500 text-white' :
                          achievement.unlocked ? 'bg-green-500 text-white' : ''
                        }`}
                      >
                        {achievement.rarity.toUpperCase()}
                      </Badge>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{achievement.progress || 0}/{achievement.total || 0}</span>
                        </div>
                        <Progress
                          value={achievement.progressPercentage || 0}
                          className={`h-2 ${achievement.unlocked ? 'bg-green-100 dark:bg-green-900' : ''}`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {getFilteredAchievements(category.id).length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    No achievements found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.id === 'unlocked'
                      ? 'Complete goals to unlock achievements!'
                      : category.id === 'locked'
                      ? 'All achievements unlocked! 🎉'
                      : `No ${category.label.toLowerCase()} achievements available.`
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Balloon Achievement Modal */}
        <BalloonAchievementModal
          achievement={selectedAchievement}
          open={showBalloonModal}
          onOpenChange={setShowBalloonModal}
        />
      </div>
    </MainLayout>
  );
}
