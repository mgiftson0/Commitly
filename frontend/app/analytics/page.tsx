"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Flame,
  Trophy,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { authHelpers, supabase } from "@/lib/supabase-client";
import { getUserStreakStats, getUserStreaks } from "@/lib/streak-manager";

interface AnalyticsData {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  completionRate: number;
  averageStreak: number;
  longestStreak: number;
  totalCompletions: number;
  categoryStats: {
    category: string;
    completed: number;
    total: number;
    percentage: number;
    color: string;
  }[];
  monthlyStats: {
    month: string;
    completed: number;
    created: number;
    streak: number;
  }[];
  weeklyStats: {
    day: string;
    completions: number;
    goals: number;
  }[];
  streakDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const user = await authHelpers.getCurrentUser();
      if (!user) return;

      // Get goals data
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (!goals) return;

      // Calculate basic stats
      const totalGoals = goals.length;
      const completedGoals = goals.filter(g => g.completed_at).length;
      const activeGoals = goals.filter(g => !g.completed_at && !g.is_suspended).length;
      const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

      // Get streak stats
      const streakStats = await getUserStreakStats();
      const userStreaks = await getUserStreaks();

      // Calculate category stats
      const categories = ['Health & Fitness', 'Learning', 'Career', 'Personal'];
      const categoryStats = categories.map(category => {
        const categoryGoals = goals.filter(goal => {
          const goalCategory = goal.category || goal.goal_type || 'personal';
          const mappedCategory = {
            'health-fitness': 'Health & Fitness',
            'learning': 'Learning',
            'career': 'Career',
            'personal': 'Personal'
          }[goalCategory] || goalCategory;

          return mappedCategory === category;
        });

        const completed = categoryGoals.filter(g => g.completed_at).length;
        const total = categoryGoals.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          category,
          completed,
          total,
          percentage,
          color: category === 'Health & Fitness' ? 'bg-green-500' :
                 category === 'Learning' ? 'bg-blue-500' :
                 category === 'Career' ? 'bg-purple-500' : 'bg-orange-500'
        };
      }).filter(c => c.total > 0);

      // Generate monthly stats (mock data for now)
      const monthlyStats = [
        { month: 'Jan', completed: 5, created: 3, streak: 12 },
        { month: 'Feb', completed: 8, created: 4, streak: 15 },
        { month: 'Mar', completed: 6, created: 2, streak: 18 },
        { month: 'Apr', completed: 9, created: 5, streak: 22 },
        { month: 'May', completed: 7, created: 3, streak: 25 },
        { month: 'Jun', completed: 11, created: 6, streak: 28 }
      ];

      // Generate weekly stats
      const weeklyStats = [
        { day: 'Mon', completions: 3, goals: 2 },
        { day: 'Tue', completions: 5, goals: 3 },
        { day: 'Wed', completions: 4, goals: 2 },
        { day: 'Thu', completions: 6, goals: 4 },
        { day: 'Fri', completions: 2, goals: 1 },
        { day: 'Sat', completions: 8, goals: 5 },
        { day: 'Sun', completions: 7, goals: 4 }
      ];

      // Generate streak distribution
      const streakDistribution = [
        { range: '0-5 days', count: 2, percentage: 20 },
        { range: '6-15 days', count: 4, percentage: 40 },
        { range: '16-30 days', count: 3, percentage: 30 },
        { range: '30+ days', count: 1, percentage: 10 }
      ];

      setData({
        totalGoals,
        completedGoals,
        activeGoals,
        completionRate,
        averageStreak: streakStats?.personal_best_streak || 0,
        longestStreak: streakStats?.personal_best_streak || 0,
        totalCompletions: streakStats?.lifetime_completions || 0,
        categoryStats,
        monthlyStats,
        weeklyStats,
        streakDistribution
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your progress and performance insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <TabsList>
                <TabsTrigger value="7d">7D</TabsTrigger>
                <TabsTrigger value="30d">30D</TabsTrigger>
                <TabsTrigger value="90d">90D</TabsTrigger>
                <TabsTrigger value="1y">1Y</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalGoals}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                +12% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.completionRate}%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                +5% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.longestStreak}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Minus className="h-3 w-3 text-gray-500 mr-1" />
                Personal record
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalCompletions}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                +8% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Performance
              </CardTitle>
              <CardDescription>
                Goal completion rates by category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.categoryStats.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="text-sm font-medium">{category.category}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.completed}/{category.total} ({category.percentage}%)
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Trends
              </CardTitle>
              <CardDescription>
                Goal completion and creation patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.monthlyStats.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">{month.month}</div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>✅ {month.completed}</span>
                        <span>🎯 {month.created}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      🔥 {month.streak}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
              <CardDescription>
                Daily completion patterns this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.weeklyStats.map((day) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="text-sm font-medium w-12">{day.day}</span>
                    <div className="flex-1 mx-4">
                      <Progress
                        value={(day.completions / Math.max(...data.weeklyStats.map(d => d.completions))) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground w-16 text-right">
                      {day.completions} goals
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Streak Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Streak Distribution
              </CardTitle>
              <CardDescription>
                How your streaks are distributed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.streakDistribution.map((range) => (
                <div key={range.range} className="flex items-center justify-between">
                  <span className="text-sm">{range.range}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${range.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                      {range.count}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Insights and Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Insights & Recommendations
            </CardTitle>
            <CardDescription>
              AI-powered insights to help you improve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-400">Great Progress!</span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Your completion rate is above average. Keep up the excellent work!
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-400">Consistency Tip</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Try scheduling goals for the same time each day to build stronger habits.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-400">Streak Opportunity</span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  You&apos;re close to your longest streak! One more day could set a new record.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
