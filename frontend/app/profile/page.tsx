"use client"

import { useEffect, useState, useMemo } from "react"
import * as React from "react"
import { Profile, Goal, Notification, Achievement, CategoryStat } from "@/types/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Target,
  ArrowLeft,
  Trophy,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Edit,
  Settings,
  Award,
  TrendingUp,
  Flame,
  CheckCircle2,
  Clock,
  Users,
  Star,
  BookOpen,
  Dumbbell,
  Briefcase,
  Heart,
  Palette,
  Camera,
  Mail,
  Phone,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Bell
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { AchievementSquare } from "@/components/achievements/achievement-square"
import { AchievementModal } from "@/components/achievements/achievement-modal"
import { Celebration } from "@/components/achievements/celebration"
import { CategoryProgressModal } from "@/components/category-progress-modal"
import { ACHIEVEMENTS, checkAchievements } from "@/lib/achievements"
import { getProgressColor, getProgressBarColor } from "@/lib/utils/progress-colors"
import { authHelpers, supabase } from "@/lib/supabase-client"
import { SocialLinks } from "@/components/profile/social-links"
import { ShareProfile } from "@/components/profile/share-profile"
import { getUserStreakStats, getUserStreaks } from "@/lib/streak-manager"
import { StreakStats } from "@/components/streaks/streak-badge"
import { FollowersModal } from "@/components/profile/followers-modal"

export default function ProfilePage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [streakStats, setStreakStats] = useState<any>(null)
  const [topStreaks, setTopStreaks] = useState<any[]>([])
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers')
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await authHelpers.getCurrentUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (profileData) {
          setProfile(profileData);
        }

        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id);

        if (goalsError) throw goalsError;
        if (goalsData) {
          setGoals(goalsData);
        }

        // Load achievements from database
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('user_achievements')
          .select('*, achievements(*)')
          .eq('user_id', user.id);

        if (!achievementsError && achievementsData) {
          setAchievements(achievementsData.map(ua => ({
            ...ua.achievements,
            unlocked: true,
            unlocked_at: ua.unlocked_at
          })));
        } else {
          setAchievements([]);
        }

        // Load streak stats
        const stats = await getUserStreakStats()
        setStreakStats(stats)

        // Load top streaks
        const streaks = await getUserStreaks()
        setTopStreaks(streaks.slice(0, 5)) // Top 5 streaks

      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // Calculate category stats from real goals with combined progress
  const categoryStats = useMemo<CategoryStat[]>(() => {
    const categories = ['Health & Fitness', 'Learning', 'Career', 'Personal'];
    const categoryMap = {
      'health-fitness': 'Health & Fitness',
      'learning': 'Learning', 
      'career': 'Career',
      'personal': 'Personal'
    };
    
    const iconMap = {
      'Health & Fitness': Heart,
      'Learning': BookOpen,
      'Career': Briefcase,
      'Personal': Star
    };
    
    const colorMap = {
      'Health & Fitness': 'bg-green-500',
      'Learning': 'bg-blue-500', 
      'Career': 'bg-purple-500',
      'Personal': 'bg-orange-500'
    };

    return categories.map(category => {
      const categoryGoals = goals.filter(goal => {
        const goalCategory = goal.category || goal.goal_type || 'personal';
        const mappedCategory = categoryMap[goalCategory as keyof typeof categoryMap] || goalCategory;
        return mappedCategory === category;
      });

      // Calculate combined progress for all goals in category
      const totalProgress = categoryGoals.reduce((sum, goal) => {
        if (goal.completed_at || goal.status === 'completed') {
          return sum + 100
        }
        return sum + (goal.progress || 0)
      }, 0)
      
      const averageProgress = categoryGoals.length > 0 ? Math.round(totalProgress / categoryGoals.length) : 0
      const completed = categoryGoals.filter(goal => goal.completed_at || goal.status === 'completed').length;
      const total = categoryGoals.length;
      
      // Separate standard and seasonal goals
      const standardGoals = categoryGoals.filter(g => !g.is_seasonal && g.duration_type !== 'seasonal').length;
      const seasonalGoals = categoryGoals.filter(g => g.is_seasonal || g.duration_type === 'seasonal').length;
      
      return {
        name: category,
        completed,
        total,
        progress: averageProgress,
        standardGoals,
        seasonalGoals,
        color: colorMap[category as keyof typeof colorMap],
        icon: iconMap[category as keyof typeof iconMap]
      };
    }).filter(c => c.total > 0);
  }, [goals]);

          
  // Handle celebration effect
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  // Handle achievement click
  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Target className="h-12 w-12 text-blue-600 animate-pulse" />
      </div>
    )
  }

  const completedGoals = goals.filter(g => g.completed_at)
  const activeGoals = goals.filter(g => !g.completed_at && !g.is_suspended)

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Enhanced Profile Header Card */}
        <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          {/* Enhanced Cover Image */}
          <div className="h-24 sm:h-32 md:h-40 bg-gradient-to-br from-primary/10 via-primary/20 to-primary/10 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
          </div>

          <CardContent className="p-4 sm:p-6 md:p-8">
            {/* Avatar & Action Buttons */}
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="relative -mt-12 sm:-mt-16">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-xl" />
                <Avatar className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 border-4 border-background shadow-lg">
                  <AvatarImage src={profile?.profile_picture_url} />
                  <AvatarFallback className="text-xl sm:text-2xl md:text-3xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-primary-foreground font-bold">
                    {profile ? `${((profile.first_name || '')[0] ?? 'J')}${((profile.last_name || '')[0] ?? 'D')}` : 'JD'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex gap-2 mt-2">
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="text-xs shadow-sm">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                </Link>
                <Link href="/profile/edit">
                  <Button size="sm" className="text-xs shadow-sm">
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </Button>
                </Link>
                <ShareProfile 
                  username={profile?.username || 'user'} 
                  displayName={profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'User' : 'User'}
                  profilePicture={profile?.profile_picture_url}
                />
              </div>
            </div>

            {/* Enhanced Profile Info */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'John Doe' : 'John Doe'}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  @{profile?.username || 'johndoe'}
                </p>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                {profile?.bio || 'Goal-oriented individual passionate about personal growth and helping others achieve their dreams.'}
              </p>

              {/* Enhanced Location & Links */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                {profile?.location && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</span>
                </div>
              </div>
              
              <SocialLinks profile={{
                instagram: profile?.instagram,
                twitter: profile?.twitter,
                snapchat: profile?.snapchat,
                email: profile?.email
              }} />

              {/* Enhanced Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-3 border-t border-border/50">
                <div 
                  className="text-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setFollowersModalTab('followers')
                    setShowFollowersModal(true)
                  }}
                >
                  <div className="font-bold text-lg sm:text-xl text-primary">{profile?.followers_count || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Followers</div>
                </div>
                <div 
                  className="text-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setFollowersModalTab('following')
                    setShowFollowersModal(true)
                  }}
                >
                  <div className="font-bold text-lg sm:text-xl text-primary">{profile?.following_count || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Following</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="font-bold text-lg sm:text-xl text-primary">{goals.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Goals</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="font-bold text-lg sm:text-xl text-primary">{achievements.filter(a => a.unlocked).length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Badges</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compact Stats Row - No Cards */}
        <div className="border rounded-lg p-3 sm:p-4 bg-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{activeGoals.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Trophy className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{completedGoals.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-orange-500/10">
                <Flame className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">
                  {streakStats?.best_current_streak || 0}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Best Streak</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-purple-500/10">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{(() => {
                  const total = goals.length;
                  const completed = goals.filter(g => g.completed_at).length;
                  return total > 0 ? Math.round((completed / total) * 100) : 0
                })()}%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Success</p>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Stats Card */}
        {streakStats && streakStats.active_goals_with_streaks > 0 && (
          <Card className="border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50/50 to-background dark:from-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="h-5 w-5 text-orange-500" />
                Your Streaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StreakStats
                currentStreak={streakStats.best_current_streak || 0}
                longestStreak={streakStats.personal_best_streak || 0}
                totalCompletions={streakStats.lifetime_completions || 0}
              />
              {topStreaks.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Top Active Streaks</p>
                  {topStreaks.map((streak: any) => (
                    <div key={streak.goal_id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{streak.goals?.title || 'Goal'}</p>
                        <p className="text-xs text-muted-foreground">{streak.total_completions} completions</p>
                      </div>
                      <Badge className="bg-orange-500 text-white">
                        🔥 {streak.current_streak}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Goals Overview - Modern Compact Design */}
            <Card className="hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Goals Overview</CardTitle>
                      <CardDescription className="text-sm">
                        Your goal progress and achievements
                      </CardDescription>
                    </div>
                  </div>
                  <Link href="/goals">
                    <Button variant="outline" size="sm" className="hover-lift">
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="recent" className="space-y-3 sm:space-y-4">
                  <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger value="recent" className="text-[9px] sm:text-xs md:text-sm px-1 sm:px-3 py-1 sm:py-2">Recent ({goals.length})</TabsTrigger>
                    <TabsTrigger value="active" className="text-[9px] sm:text-xs md:text-sm px-1 sm:px-3 py-1 sm:py-2">Active ({activeGoals.length})</TabsTrigger>
                    <TabsTrigger value="completed" className="text-[9px] sm:text-xs md:text-sm px-1 sm:px-3 py-1 sm:py-2">Completed ({completedGoals.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="recent" className="space-y-3">
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {goals.slice(0, 6).map((goal) => {
                        const isSeasonalGoal = goal.is_seasonal || goal.duration_type === 'seasonal'
                        const isGroupGoal = goal.goal_nature === 'group'
                        const isCompleted = goal.completed_at || goal.status === 'completed'
                        const progress = isCompleted ? 100 : (goal.progress || 0)
                        
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case "active": return "bg-green-500"
                            case "completed": return "bg-blue-500"
                            case "paused": return "bg-yellow-500"
                            case "pending": return "bg-orange-500"
                            default: return "bg-gray-500"
                          }
                        }
                        
                        const getTypeIcon = (type: string) => {
                          switch (type) {
                            case "recurring": return <Flame className="h-4 w-4" />
                            case "single": return <CheckCircle2 className="h-4 w-4" />
                            case "multi": return <Target className="h-4 w-4" />
                            default: return <Target className="h-4 w-4" />
                          }
                        }
                        
                        const getGoalCardStyle = () => {
                          if (isCompleted) {
                            return "ring-1 ring-green-200/50 hover:ring-green-300/70 shadow-green-100/50 hover:shadow-green-200/60 bg-gradient-to-br from-green-50/60 via-white to-green-50/30 dark:from-green-950/30 dark:via-background dark:to-green-950/20"
                          }
                          if (isSeasonalGoal) {
                            return "ring-1 ring-amber-200/50 hover:ring-amber-300/70 shadow-amber-100/50 hover:shadow-amber-200/60 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 dark:from-amber-950/30 dark:via-background dark:to-amber-950/20"
                          }
                          if (isGroupGoal) {
                            return "ring-1 ring-purple-200/50 hover:ring-purple-300/70 shadow-purple-100/50 hover:shadow-purple-200/60 bg-gradient-to-br from-purple-50/60 via-white to-purple-50/30 dark:from-purple-950/30 dark:via-background dark:to-purple-950/20"
                          }
                          return "ring-1 ring-border/50 hover:ring-primary/30 shadow-slate-100/50 hover:shadow-slate-200/60"
                        }

                        return (
                          <Link key={goal.id} href={`/goals/${goal.id}`}>
                            <Card className={`hover-lift group transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 border-0 shadow-slate-900/15 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm h-80 ${getGoalCardStyle()}`}>
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(goal.goal_type || goal.type)}
                                    <Badge variant="outline" className="text-xs shadow-sm bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors duration-200">
                                      {goal.goal_type || goal.type}
                                    </Badge>
                                    {isSeasonalGoal && (
                                      <Badge variant="outline" className="text-xs bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 shadow-sm hover:shadow-amber-200/50 transition-all duration-200">
                                        <Star className="h-3 w-3 mr-1" />
                                        Seasonal
                                      </Badge>
                                    )}
                                    {isGroupGoal && (
                                      <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 shadow-sm hover:shadow-purple-200/50 transition-all duration-200">
                                        <Users className="h-3 w-3 mr-1" />
                                        Group
                                      </Badge>
                                    )}
                                  </div>
                                  {goal.streak && goal.streak > 0 && (
                                    <Badge className="bg-orange-500 text-white text-xs px-2">
                                      <Flame className="h-3 w-3 mr-1" />
                                      {goal.streak}
                                    </Badge>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <CardTitle className="line-clamp-2 flex items-center gap-2">
                                    {goal.title}
                                  </CardTitle>
                                  {goal.description && (
                                    <CardDescription className="line-clamp-2">
                                      {goal.description}
                                    </CardDescription>
                                  )}
                                </div>
                              </CardHeader>

                              <CardContent className="space-y-4">
                                {/* Progress */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{progress}%</span>
                                  </div>
                                  <Progress value={progress} className={`h-3 rounded-full bg-gradient-to-r from-muted/50 to-muted/30 border border-border/30 shadow-inner ${progress <= 30 ? '[&>div]:bg-red-500' : progress <= 70 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`} />
                                </div>

                                {/* Category and Due Date */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    {goal.category?.replace('_', ' ') || 'Personal'}
                                  </span>
                                  {goal.target_date && (() => {
                                    const dueDate = new Date(goal.target_date)
                                    const today = new Date()
                                    const diffTime = dueDate.getTime() - today.getTime()
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                    
                                    const getUrgencyColor = () => {
                                      if (diffDays < 0) return 'text-red-600'
                                      if (diffDays <= 3) return 'text-red-600'
                                      if (diffDays <= 7) return 'text-yellow-600'
                                      return 'text-blue-600'
                                    }
                                    
                                    const getText = () => {
                                      if (diffDays < 0) return 'Overdue'
                                      if (diffDays === 0) return 'Today'
                                      if (diffDays === 1) return '1d'
                                      return `${diffDays}d`
                                    }
                                    
                                    return (
                                      <div className={`flex items-center gap-1 ${getUrgencyColor()}`}>
                                        <Calendar className="h-3 w-3" />
                                        <span className="font-medium">{getText()}</span>
                                      </div>
                                    )
                                  })()}
                                </div>

                                {/* Status and Created Date */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(goal.status)}`} />
                                    <span className="capitalize">{goal.status}</span>
                                  </div>
                                  <span>
                                    Created {new Date(goal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        )
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="active" className="space-y-3">
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {activeGoals.slice(0, 6).map((goal) => {
                        const isSeasonalGoal = goal.is_seasonal || goal.duration_type === 'seasonal'
                        const isGroupGoal = goal.goal_nature === 'group'
                        const isCompleted = goal.completed_at || goal.status === 'completed'
                        const progress = isCompleted ? 100 : (goal.progress || 0)
                        
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case "active": return "bg-green-500"
                            case "completed": return "bg-blue-500"
                            case "paused": return "bg-yellow-500"
                            case "pending": return "bg-orange-500"
                            default: return "bg-gray-500"
                          }
                        }
                        
                        const getTypeIcon = (type: string) => {
                          switch (type) {
                            case "recurring": return <Flame className="h-4 w-4" />
                            case "single": return <CheckCircle2 className="h-4 w-4" />
                            case "multi": return <Target className="h-4 w-4" />
                            default: return <Target className="h-4 w-4" />
                          }
                        }
                        
                        const getGoalCardStyle = () => {
                          if (isCompleted) {
                            return "ring-1 ring-green-200/50 hover:ring-green-300/70 shadow-green-100/50 hover:shadow-green-200/60 bg-gradient-to-br from-green-50/60 via-white to-green-50/30 dark:from-green-950/30 dark:via-background dark:to-green-950/20"
                          }
                          if (isSeasonalGoal) {
                            return "ring-1 ring-amber-200/50 hover:ring-amber-300/70 shadow-amber-100/50 hover:shadow-amber-200/60 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 dark:from-amber-950/30 dark:via-background dark:to-amber-950/20"
                          }
                          if (isGroupGoal) {
                            return "ring-1 ring-purple-200/50 hover:ring-purple-300/70 shadow-purple-100/50 hover:shadow-purple-200/60 bg-gradient-to-br from-purple-50/60 via-white to-purple-50/30 dark:from-purple-950/30 dark:via-background dark:to-purple-950/20"
                          }
                          return "ring-1 ring-border/50 hover:ring-primary/30 shadow-slate-100/50 hover:shadow-slate-200/60"
                        }

                        return (
                          <Link key={goal.id} href={`/goals/${goal.id}`}>
                            <Card className={`hover-lift group transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 border-0 shadow-slate-900/15 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm h-80 ${getGoalCardStyle()}`}>
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(goal.goal_type || goal.type)}
                                    <Badge variant="outline" className="text-xs shadow-sm bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors duration-200">
                                      {goal.goal_type || goal.type}
                                    </Badge>
                                    {isSeasonalGoal && (
                                      <Badge variant="outline" className="text-xs bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 shadow-sm hover:shadow-amber-200/50 transition-all duration-200">
                                        <Star className="h-3 w-3 mr-1" />
                                        Seasonal
                                      </Badge>
                                    )}
                                    {isGroupGoal && (
                                      <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 shadow-sm hover:shadow-purple-200/50 transition-all duration-200">
                                        <Users className="h-3 w-3 mr-1" />
                                        Group
                                      </Badge>
                                    )}
                                  </div>
                                  {goal.streak && goal.streak > 0 && (
                                    <Badge className="bg-orange-500 text-white text-xs px-2">
                                      <Flame className="h-3 w-3 mr-1" />
                                      {goal.streak}
                                    </Badge>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <CardTitle className="line-clamp-2 flex items-center gap-2">
                                    {goal.title}
                                  </CardTitle>
                                  {goal.description && (
                                    <CardDescription className="line-clamp-2">
                                      {goal.description}
                                    </CardDescription>
                                  )}
                                </div>
                              </CardHeader>

                              <CardContent className="space-y-4">
                                {/* Progress */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{progress}%</span>
                                  </div>
                                  <Progress value={progress} className={`h-3 rounded-full bg-gradient-to-r from-muted/50 to-muted/30 border border-border/30 shadow-inner ${progress <= 30 ? '[&>div]:bg-red-500' : progress <= 70 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`} />
                                </div>

                                {/* Category and Due Date */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    {goal.category?.replace('_', ' ') || 'Personal'}
                                  </span>
                                  {goal.target_date && (() => {
                                    const dueDate = new Date(goal.target_date)
                                    const today = new Date()
                                    const diffTime = dueDate.getTime() - today.getTime()
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                    
                                    const getUrgencyColor = () => {
                                      if (diffDays < 0) return 'text-red-600'
                                      if (diffDays <= 3) return 'text-red-600'
                                      if (diffDays <= 7) return 'text-yellow-600'
                                      return 'text-blue-600'
                                    }
                                    
                                    const getText = () => {
                                      if (diffDays < 0) return 'Overdue'
                                      if (diffDays === 0) return 'Today'
                                      if (diffDays === 1) return '1d'
                                      return `${diffDays}d`
                                    }
                                    
                                    return (
                                      <div className={`flex items-center gap-1 ${getUrgencyColor()}`}>
                                        <Calendar className="h-3 w-3" />
                                        <span className="font-medium">{getText()}</span>
                                      </div>
                                    )
                                  })()}
                                </div>

                                {/* Status and Created Date */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(goal.status)}`} />
                                    <span className="capitalize">{goal.status}</span>
                                  </div>
                                  <span>
                                    Created {new Date(goal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        )
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-3">
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {completedGoals.slice(0, 6).map((goal) => {
                        const isSeasonalGoal = goal.is_seasonal || goal.duration_type === 'seasonal'
                        const isGroupGoal = goal.goal_nature === 'group'
                        const isCompleted = goal.completed_at || goal.status === 'completed'
                        const progress = 100
                        
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case "active": return "bg-green-500"
                            case "completed": return "bg-blue-500"
                            case "paused": return "bg-yellow-500"
                            case "pending": return "bg-orange-500"
                            default: return "bg-gray-500"
                          }
                        }
                        
                        const getTypeIcon = (type: string) => {
                          switch (type) {
                            case "recurring": return <Flame className="h-4 w-4" />
                            case "single": return <CheckCircle2 className="h-4 w-4" />
                            case "multi": return <Target className="h-4 w-4" />
                            default: return <Target className="h-4 w-4" />
                          }
                        }
                        
                        const getGoalCardStyle = () => {
                          if (isCompleted) {
                            return "ring-1 ring-green-200/50 hover:ring-green-300/70 shadow-green-100/50 hover:shadow-green-200/60 bg-gradient-to-br from-green-50/60 via-white to-green-50/30 dark:from-green-950/30 dark:via-background dark:to-green-950/20"
                          }
                          if (isSeasonalGoal) {
                            return "ring-1 ring-amber-200/50 hover:ring-amber-300/70 shadow-amber-100/50 hover:shadow-amber-200/60 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 dark:from-amber-950/30 dark:via-background dark:to-amber-950/20"
                          }
                          if (isGroupGoal) {
                            return "ring-1 ring-purple-200/50 hover:ring-purple-300/70 shadow-purple-100/50 hover:shadow-purple-200/60 bg-gradient-to-br from-purple-50/60 via-white to-purple-50/30 dark:from-purple-950/30 dark:via-background dark:to-purple-950/20"
                          }
                          return "ring-1 ring-border/50 hover:ring-primary/30 shadow-slate-100/50 hover:shadow-slate-200/60"
                        }

                        return (
                          <Link key={goal.id} href={`/goals/${goal.id}`}>
                            <Card className={`hover-lift group transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 border-0 shadow-slate-900/15 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm h-80 ${getGoalCardStyle()}`}>
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(goal.goal_type || goal.type)}
                                    <Badge variant="outline" className="text-xs shadow-sm bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors duration-200">
                                      {goal.goal_type || goal.type}
                                    </Badge>
                                    {isSeasonalGoal && (
                                      <Badge variant="outline" className="text-xs bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 shadow-sm hover:shadow-amber-200/50 transition-all duration-200">
                                        <Star className="h-3 w-3 mr-1" />
                                        Seasonal
                                      </Badge>
                                    )}
                                    {isGroupGoal && (
                                      <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 shadow-sm hover:shadow-purple-200/50 transition-all duration-200">
                                        <Users className="h-3 w-3 mr-1" />
                                        Group
                                      </Badge>
                                    )}
                                  </div>
                                  <Badge className="bg-green-600 text-white text-xs px-2">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Done
                                  </Badge>
                                </div>

                                <div className="space-y-2">
                                  <CardTitle className="line-clamp-2 flex items-center gap-2">
                                    {goal.title}
                                  </CardTitle>
                                  {goal.description && (
                                    <CardDescription className="line-clamp-2">
                                      {goal.description}
                                    </CardDescription>
                                  )}
                                </div>
                              </CardHeader>

                              <CardContent className="space-y-4">
                                {/* Progress */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">100%</span>
                                  </div>
                                  <Progress value={100} className="h-3 rounded-full bg-gradient-to-r from-muted/50 to-muted/30 border border-border/30 shadow-inner [&>div]:bg-green-500" />
                                </div>

                                {/* Category and Completion Date */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    {goal.category?.replace('_', ' ') || 'Personal'}
                                  </span>
                                  {goal.completed_at && (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span className="font-medium">
                                        {new Date(goal.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Status and Created Date */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor('completed')}`} />
                                    <span className="capitalize">Completed</span>
                                  </div>
                                  <span>
                                    Created {new Date(goal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        )
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Achievements - Modern Grid Design */}
            <Card className="hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-yellow-500/10">
                      <Award className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Recent Achievements</CardTitle>
                      <CardDescription className="text-sm">
                        Your latest unlocked badges and milestones
                      </CardDescription>
                    </div>
                  </div>
                  <Link href="/achievements">
                    <Button variant="outline" size="sm" className="hover-lift">
                      <Trophy className="h-3 w-3 mr-1" />
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {achievements.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No achievements yet</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Complete goals to unlock achievements!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {achievements.slice(0, 9).map((achievement) => (
                      <AchievementSquare
                        key={achievement.id}
                        achievement={achievement}
                        onClick={() => handleAchievementClick(achievement)}
                      />
                    ))}
                  </div>
                )}
                
                <Link href="/achievements">
                  <Button variant="outline" className="w-full text-xs sm:text-sm mt-4">
                    View All Achievements
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Category Progress */}
            <Card className="hover-lift h-72">
              <CardHeader className="px-4 sm:px-6 py-1">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium bg-muted/30 px-2 py-1 rounded-md w-fit">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    Category Progress
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-6 px-2 border bg-background"
                    onClick={() => setShowCategoryModal(true)}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6 pt-0 h-full overflow-y-auto">
                {categoryStats.map((category) => {
                  const Icon = category.icon
                  const percentage = (category.completed / category.total) * 100
                  return (
                    <div key={category.name} className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Icon className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${category.color.replace('bg-', 'text-')}`} />
                          <span className="text-xs sm:text-sm font-medium truncate">{category.name}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                          {category.completed}/{category.total}
                        </span>
                      </div>

                      <Progress value={category.progress || percentage} className={`h-1.5 sm:h-2 ${(category.progress || percentage) <= 30 ? '[&>div]:bg-red-500' : (category.progress || percentage) <= 70 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`} />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
      
      {/* Achievement Modal */}
      <AchievementModal 
        achievement={selectedAchievement}
        open={!!selectedAchievement}
        onOpenChange={(open) => !open && setSelectedAchievement(null)}
      />
      
      {/* Category Progress Modal */}
      <CategoryProgressModal 
        open={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        categoryStats={categoryStats}
      />
      
      {/* Followers Modal */}
      <FollowersModal
        open={showFollowersModal}
        onOpenChange={setShowFollowersModal}
        userId={profile?.id || ''}
        initialTab={followersModalTab}
      />
      
      {/* Celebration Animation */}
      <Celebration
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </MainLayout>
  )
}