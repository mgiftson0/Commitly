"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Target,
  Plus,
  X,
  ArrowLeft,
  Lightbulb,
  Clock,
  Users,
  Lock,
  Globe,
  CheckCircle2,
  Flame,
  Calendar,
  Zap,
  BookOpen,
  Dumbbell,
  Briefcase,
  Heart,
  Star,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { authHelpers, supabase } from "@/lib/supabase-client";
import { groupGoalSamples, type GoalSample } from "../goal-sample-data";
import { ActivityAssignment } from "@/components/goals/activity-assignment";

export default function CreateGoalPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalNature, setGoalNature] = useState<"personal" | "group">("personal");
  const [goalType, setGoalType] = useState<"single-activity" | "multi-activity">("single-activity");
  const [visibility, setVisibility] = useState<"public" | "private" | "followers" | "accountability_partners">("private");
  const [activities, setActivities] = useState<string[]>([""]);
  const [recurrencePattern, setRecurrencePattern] = useState("daily");
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [activityAssignments, setActivityAssignments] = useState<{[key: number]: string}>({});
  const [singleActivity, setSingleActivity] = useState("");
  const [scheduleType, setScheduleType] = useState<"date" | "recurring">("date");
  const [singleDate, setSingleDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endCondition, setEndCondition] = useState<"ongoing" | "by-date" | "after-completions">("by-date");
  const [targetCompletions, setTargetCompletions] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [availablePartners, setAvailablePartners] = useState<any[]>([])
  const [category, setCategory] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateGoalType, setTemplateGoalType] = useState<"single-activity" | "multi-activity">("single-activity");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedSingleActivity, setSelectedSingleActivity] = useState<string>("");
  const durationType = 'standard';
  const [seasonalType, setSeasonalType] = useState<"annual" | "quarterly" | "biannual">("annual");
  const [seasonalYear, setSeasonalYear] = useState<number>(new Date().getFullYear());
  const [seasonalQuarter, setSeasonalQuarter] = useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));
  const router = useRouter();

  // Load real user and partners data
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await authHelpers.getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        setCurrentUser({
          id: user.id,
          name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'You' : 'You',
          username: profile?.username || 'you',
          profile_picture_url: profile?.profile_picture_url
        })

        // Get follows relationships - simple queries first
        const { data: myFollowing } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)

        const { data: myFollowers } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', user.id)

        console.log('My following:', myFollowing)
        console.log('My followers:', myFollowers)

        // Find mutual connections
        const followingIds = new Set(myFollowing?.map(f => f.following_id) || [])
        const followerIds = new Set(myFollowers?.map(f => f.follower_id) || [])
        
        // Get mutual follower IDs
        const mutualIds = Array.from(followingIds).filter(id => followerIds.has(id))
        console.log('Mutual IDs:', mutualIds)

        // If we have mutual followers, get their profiles
        let partnersList: any[] = []
        if (mutualIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, username, profile_picture_url')
            .in('id', mutualIds)

          partnersList = (profiles || []).map(profile => ({
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Partner',
            username: profile.username || 'partner',
            profile_picture_url: profile.profile_picture_url
          }))
        }
        
        // If no mutual follows, use all followers
        if (partnersList.length === 0 && followerIds.size > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, username, profile_picture_url')
            .in('id', Array.from(followerIds))

          partnersList = (profiles || []).map(profile => ({
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Follower',
            username: profile.username || 'follower',
            profile_picture_url: profile.profile_picture_url
          }))
        }

        console.log('Final partners list:', partnersList)
        setAvailablePartners(partnersList)
      } catch (error) {
        console.error('Error loading data:', error)
        router.push('/auth/login')
      }
    }

    loadData()
  }, [router])

  const weekDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Ensure owner is included when group is selected and counts toward max 5
  useEffect(() => {
    if (goalNature === "group" && currentUser) {
      setGroupMembers((prev) => {
        if (prev.includes(currentUser.id)) return prev;
        return [currentUser.id, ...prev].slice(0, 2);
      });
    } else {
      setGroupMembers([]);
    }
  }, [goalNature, currentUser]);

  // All candidates for group membership (owner + partners)
  const allGroupCandidates = useMemo(
    () => currentUser ? [currentUser, ...availablePartners] : [],
    [currentUser, availablePartners],
  );

  const goalSamples = useMemo<GoalSample[]>(() => groupGoalSamples.slice(0, 3), []);

  const renderGoalSample = (sample: GoalSample) => (
    <Card
      key={sample.id}
      className="rounded-xl border border-slate-100 bg-white"
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-slate-600">
            Group Goal
          </Badge>
          <span className="text-[11px] font-medium text-slate-500">
            {sample.timeframe}
          </span>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-900 leading-tight">
            {sample.title}
          </h4>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            {sample.summary}
          </p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-slate-400" />
            <span className="capitalize">{sample.goalType.replace('-', ' ')}</span>
          </span>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-[12px] font-medium text-slate-600">
          {sample.callToAction}
        </div>
      </CardContent>
    </Card>
  );

  if (!currentUser) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Target className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const addActivity = () => {
    setActivities([...activities, ""]);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const updateActivity = (index: number, value: string) => {
    const newActivities = [...activities];
    newActivities[index] = value;
    setActivities(newActivities);
  };

  const toggleRecurrenceDay = (day: string) => {
    if (recurrenceDays.includes(day)) {
      setRecurrenceDays(recurrenceDays.filter((d) => d !== day));
    } else {
      setRecurrenceDays([...recurrenceDays, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentUser) {
        toast.error('Please log in to create goals')
        return
      }

      // Get authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        toast.error('Authentication required')
        router.push('/auth/login')
        return
      }

      // Ensure user profile exists - this is critical for foreign key constraint
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', authUser.id)
        .maybeSingle()

      if (profileError) {
        console.error('Profile check error:', profileError)
        toast.error('Database error. Please try again.')
        return
      }

      if (!profile) {
        toast.error('Profile not found. Please complete your profile first.')
        router.push('/auth/kyc')
        return
      }

      // Double-check the user ID matches
      if (profile.id !== authUser.id) {
        toast.error('Authentication mismatch. Please log in again.')
        router.push('/auth/login')
        return
      }

      // Validate accountability partners for personal goals
      if (goalNature === "personal" && selectedPartners.length > 0) {
        // Verify all selected partners are still valid mutual followers
        const validPartners = selectedPartners.filter(partnerId => 
          availablePartners.some(p => p.id === partnerId)
        )
        
        if (validPartners.length !== selectedPartners.length) {
          toast.error('Some selected partners are no longer available')
          return
        }
      }



      // Determine goal status based on start date
      const goalStartDate = scheduleType === "date" ? startDate : startDate
      const goalEndDate = scheduleType === "date" ? singleDate : (endCondition === "by-date" ? endDate : null)
      const today = new Date().toISOString().split('T')[0]
      const goalStatus = goalStartDate && goalStartDate > today ? 'pending' : 'active'
      
      // Validate start date is not more than 2 months in future
      if (goalStartDate) {
        const startDateObj = new Date(goalStartDate)
        const twoMonthsFromNow = new Date()
        twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)
        
        if (startDateObj > twoMonthsFromNow) {
          toast.error('Start date cannot be more than 2 months in the future')
          return
        }
      }
      
      // Validate end date is after start date
      if (goalStartDate && goalEndDate && goalEndDate <= goalStartDate) {
        toast.error('End date must be after start date')
        return
      }

      // Prepare goal data for database
      const goalData = {
        user_id: authUser.id,
        title: title || "Untitled Goal",
        description,
        goal_type: goalType,
        visibility,
        status: goalStatus,
        progress: 0,
        category: category.replace('-', '_'),
        priority: "medium",
        start_date: goalStartDate || null,
        target_date: goalEndDate,
        is_suspended: false,
        completed_at: null,
        duration_type: 'standard',
        schedule_type: scheduleType,
        recurrence_pattern: scheduleType === "recurring" ? recurrencePattern : null,
        recurrence_days: scheduleType === "recurring" && recurrencePattern === "custom" ? recurrenceDays : null,
        end_condition: scheduleType === "recurring" ? endCondition : null,
        target_completions: endCondition === "after-completions" ? parseInt(targetCompletions) : null
      }

      console.log('Creating goal with user_id:', authUser.id)
      console.log('Profile exists:', profile.id)

      let newGoal;
      
      // Handle group goals differently
      if (goalNature === "group" && groupMembers.length > 1) {
        // Use group goals API
        const memberIds = groupMembers.filter(id => id !== authUser.id); // Exclude owner
        
        if (memberIds.length === 0) {
          toast.error('Please add at least one member to create a group goal')
          return
        }
        
        const response = await fetch('/api/group-goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goalData: {
              ...goalData,
              is_group_goal: true,
              group_goal_status: 'pending'
            },
            memberIds
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error('Group goal creation error:', result.error)
          toast.error(result.error || 'Failed to create group goal')
          return
        }
        
        newGoal = result.goal;
        toast.success(`Group goal created! Invitations sent to ${memberIds.length} members.`);
      } else {
        // Create regular goal in database
        const { data: goal, error: goalError } = await supabase
          .from('goals')
          .insert([goalData])
          .select()
          .single()

        if (goalError) {
          console.error('Goal creation error:', goalError)
          if (goalError.message?.includes('foreign key constraint')) {
            toast.error('Profile setup incomplete. Please refresh and try again.')
            router.push('/auth/kyc')
          } else {
            toast.error(goalError.message || 'Failed to create goal')
          }
          return
        }
        
        newGoal = goal;
      }

      // Send notifications to selected accountability partners
      if (goalNature === "personal" && selectedPartners.length > 0) {
        const partnerNotifications = selectedPartners.map(partnerId => ({
          user_id: partnerId,
          title: 'Goal Partner Request',
          message: `${currentUser.name} wants you as an accountability partner for "${title}"`,
          type: 'partner_request',
          read: false,
          data: { 
            requester_id: authUser.id, 
            requester_name: currentUser.name,
            goal_id: newGoal.id,
            goal_title: title
          }
        }))

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(partnerNotifications)

        if (notificationError) {
          console.error('Error sending partner notifications:', notificationError)
        }
      }

      // Check for achievements
      const { checkAndUnlockAchievements } = await import('@/lib/achievements')
      await checkAndUnlockAchievements(authUser.id, 'goal_created')

      // Create goal activities for multi-activity goals (only for non-group goals or if group goal creation didn't handle activities)
      if (goalType === "multi-activity" && activities.length > 0 && (goalNature !== "group" || groupMembers.length <= 1)) {
        const goalActivities = activities
          .filter(activity => activity.trim())
          .map((activity, index) => ({
            goal_id: newGoal.id,
            title: activity.trim(),
            completed: false,
            order_index: index,
            assigned_to: goalNature === "group" && activityAssignments[index] ? activityAssignments[index] : null,
            assigned_to_all: goalNature === "group" && !activityAssignments[index] ? true : false
          }))

        if (goalActivities.length > 0) {
          const { error: activitiesError } = await supabase
            .from('goal_activities')
            .insert(goalActivities)
          
          if (activitiesError) {
            console.error('Error creating activities:', activitiesError)
            toast.error('Goal created but failed to add activities')
          }
        }
      } else if (goalType === "multi-activity" && goalNature === "group" && groupMembers.length > 1) {
        // For group goals, activities are handled separately after goal creation
        if (activities.length > 0) {
          const goalActivities = activities
            .filter(activity => activity.trim())
            .map((activity, index) => ({
              goal_id: newGoal.id,
              title: activity.trim(),
              completed: false,
              order_index: index,
              assigned_to: activityAssignments[index] || null,
              assigned_to_all: !activityAssignments[index]
            }))

          if (goalActivities.length > 0) {
            const { error: activitiesError } = await supabase
              .from('goal_activities')
              .insert(goalActivities)
            
            if (activitiesError) {
              console.error('Error creating group activities:', activitiesError)
              toast.error('Group goal created but failed to add activities')
            }
          }
        }
      }

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: authUser.id,
          title: 'Goal Created!',
          message: `You created a new goal: ${title}`,
          type: 'goal_created',
          read: false,
          data: { goal_id: newGoal.id }
        })

      toast.success("Goal created successfully!");
      
      // Dispatch event to notify goals page to refresh
      window.dispatchEvent(new CustomEvent('goalCreated', { detail: { goalId: newGoal.id } }))
      
      // Check for achievements
      if (typeof window !== 'undefined') {
        import('@/lib/achievement-tracker-db').then(({ triggerAchievementCheck }) => {
          triggerAchievementCheck()
        })
      }
      
      router.push("/goals");
    } catch (error: any) {
      toast.error(error.message || "Failed to create goal");
    } finally {
      setLoading(false);
    }
  };



  // Activity suggestions by category
  const activitySuggestions = {
    "health-fitness": [
      "30 minutes cardio",
      "Strength training",
      "Stretch routine",
      "Drink 8 glasses water",
      "Walk 10k steps",
    ],
    learning: [
      "Read 20 pages",
      "Take notes",
      "Practice coding",
      "Watch tutorial",
      "Complete course module",
    ],
    career: [
      "Update resume",
      "Network with colleagues",
      "Learn new skill",
      "Apply for jobs",
      "Complete project",
    ],
    personal: [
      "Write in journal",
      "Meditate 10 minutes",
      "Call family/friends",
      "Organize space",
      "Practice gratitude",
    ],
    wellness: [
      "Meditate 10 minutes",
      "Practice breathing",
      "Take vitamins",
      "Get 8 hours sleep",
      "Limit screen time",
    ],
    finance: [
      "Track expenses",
      "Review budget",
      "Save money",
      "Pay bills",
      "Research investments",
    ],
    relationships: [
      "Call family",
      "Text friends",
      "Plan date night",
      "Write thank you note",
      "Listen actively",
    ],
    creative: [
      "Draw for 30 minutes",
      "Write 500 words",
      "Take photos",
      "Practice instrument",
      "Learn new technique",
    ],
  };

  // Goal templates for inspiration
  const goalTemplates = [
    {
      title: "Morning Workout",
      description: "Build strength and energy for the day",
      category: "health-fitness",
      icon: Dumbbell,
      color: "text-green-600",
    },
    {
      title: "Daily Reading",
      description: "Expand knowledge and reduce stress",
      category: "learning",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Career Development",
      description: "Advance your professional growth",
      category: "career",
      icon: Briefcase,
      color: "text-purple-600",
    },
    {
      title: "Mindfulness Practice",
      description: "Find inner peace and mindfulness",
      category: "wellness",
      icon: Heart,
      color: "text-pink-600",
    },
  ];

  const applyTemplate = () => {
    if (!selectedTemplate) return;

    setTitle(selectedTemplate.title);
    setDescription(selectedTemplate.description);
    setCategory(selectedTemplate.category);
    setGoalType(templateGoalType);

    if (templateGoalType === "single-activity") {
      setSingleActivity(selectedSingleActivity || selectedTemplate.title);
    } else {
      setActivities(selectedActivities.length > 0 ? selectedActivities : [""]);
    }

    setShowTemplateModal(false);
    setSelectedTemplate(null);
    setSelectedActivities([]);
    setSelectedSingleActivity("");
  };

  const toggleActivitySelection = (activity: string) => {
    if (templateGoalType === "single-activity") {
      setSelectedSingleActivity(
        activity === selectedSingleActivity ? "" : activity,
      );
    } else {
      setSelectedActivities((prev) =>
        prev.includes(activity)
          ? prev.filter((a) => a !== activity)
          : [...prev, activity],
      );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              Create Standard Goal
            </h1>
            <p className="text-xs text-muted-foreground">
              Set a regular goal with custom timeline
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/goals">
              <Button variant="outline" size="sm" className="hover-lift h-7 text-xs px-2">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:gap-5">
          {/* Main Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit}>
              <Card className="rounded-2xl border border-border bg-card overflow-hidden min-h-[600px] md:min-h-[700px]">
                <CardHeader className="pb-3 px-5 pt-5 relative z-10">
                  <CardTitle className="flex items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
                    <Target className="h-3 w-3 text-primary" />
                    Goal Details
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Capture the essentials before layering in accountability.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-5 pb-6 relative z-10 overflow-y-auto max-h-[calc(100vh-300px)] md:max-h-none">
                  {/* Title */}
                  <div className="space-y-1">
                    <Label htmlFor="title" className="text-xs font-medium">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Workout daily, Learn Spanish"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-7 text-xs focus-ring"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <Label htmlFor="description" className="text-xs font-medium">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Why is this goal important?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="text-xs focus-ring resize-none"
                    />
                  </div>

                  {/* Goal Nature - Personal or Group */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Type <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={goalNature}
                      onValueChange={(value: string) =>
                        setGoalNature(value as "personal" | "group")
                      }
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label
                          htmlFor="personal"
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-xs transition ${
                            goalNature === "personal"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-[#66E1F9]/20 hover:border-[#66E1F9]"
                          }`}
                        >
                          <RadioGroupItem value="personal" id="personal" className="sr-only" />
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Target className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">Personal</p>
                            <p className="text-[11px] text-slate-500">Just you</p>
                          </div>
                        </label>

                        <label
                          htmlFor="group"
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-xs transition ${
                            goalNature === "group"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-[#66E1F9]/20 hover:border-[#66E1F9]"
                          }`}
                        >
                          <RadioGroupItem value="group" id="group" className="sr-only" />
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">Group</p>
                            <p className="text-[11px] text-slate-500">Up to 2 people</p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Group Members Selection (only for group goals) */}
                  {goalNature === "group" && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-[0_8px_18px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Members
                        </Label>
                        <Badge variant="outline" className="text-xs bg-white text-slate-600 border-slate-200 dark:bg-slate-900/60 dark:text-slate-200">
                          {groupMembers.length}/2
                        </Badge>
                      </div>

                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (
                            !groupMembers.includes(value) &&
                            groupMembers.length < 2
                          ) {
                            setGroupMembers([...groupMembers, value]);
                          }
                        }}
                      >
                        <SelectTrigger className="h-9 text-xs focus-ring rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                          <SelectValue placeholder="Add member..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allGroupCandidates
                            .filter((p) => p.id !== currentUser.id)
                            .filter((p) => !groupMembers.includes(p.id))
                            .map((partner) => (
                              <SelectItem key={partner.id} value={partner.id} className="text-xs">
                                <div className="flex items-center gap-2">
                                  {partner.profile_picture_url ? (
                                    <img
                                      src={partner.profile_picture_url}
                                      alt={partner.name}
                                      className="h-6 w-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                      <span className="text-[10px] font-semibold">
                                        {partner.name.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="text-xs font-medium text-slate-600 dark:text-slate-200">
                                    {partner.name}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      {groupMembers.length > 0 && (
                        <div className="space-y-2">
                          {groupMembers.map((memberId) => {
                            const member = allGroupCandidates.find(
                              (p) => p.id === memberId,
                            );
                            if (!member) return null;
                            return (
                              <div
                                key={memberId}
                                className="flex items-center justify-between rounded-lg border border-white bg-white p-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                              >
                                <div className="flex items-center gap-2">
                                  {member.profile_picture_url ? (
                                    <img
                                      src={member.profile_picture_url}
                                      alt={member.name}
                                      className="h-6 w-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                      <span className="text-[11px] font-semibold">
                                        {member.name.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                    {member.name}
                                  </div>
                                </div>
                                {memberId !== currentUser.id && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-slate-400 hover:text-destructive"
                                    onClick={() =>
                                      setGroupMembers(
                                        groupMembers.filter(
                                          (id) => id !== memberId,
                                        ),
                                      )
                                    }
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category Selection */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-9 text-xs focus-ring rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health-fitness" className="text-xs">Health & Fitness</SelectItem>
                        <SelectItem value="career" className="text-xs">Career</SelectItem>
                        <SelectItem value="learning" className="text-xs">Learning</SelectItem>
                        <SelectItem value="personal" className="text-xs">Personal</SelectItem>
                        <SelectItem value="wellness" className="text-xs">Wellness</SelectItem>
                        <SelectItem value="creative" className="text-xs">Creative</SelectItem>
                        <SelectItem value="other" className="text-xs">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>



                  {/* Goal Type Selection */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      Goal Type <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={goalType}
                      onValueChange={(value: string) =>
                        setGoalType(
                          value as "single-activity" | "multi-activity",
                        )
                      }
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div
                          className={`flex items-center space-x-2 p-2 rounded border transition-all cursor-pointer hover:bg-[#66E1F9]/20 hover:border-[#66E1F9] ${
                            goalType === "single-activity"
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                        >
                          <RadioGroupItem
                            value="single-activity"
                            id="single-activity"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor="single-activity"
                              className="font-medium cursor-pointer text-xs"
                            >
                              Single Activity
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              One task
                            </p>
                          </div>
                          <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                        </div>

                        <div
                          className={`flex items-center space-x-2 p-2 rounded border transition-all cursor-pointer hover:bg-[#66E1F9]/20 hover:border-[#66E1F9] ${
                            goalType === "multi-activity"
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                        >
                          <RadioGroupItem
                            value="multi-activity"
                            id="multi-activity"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor="multi-activity"
                              className="font-medium cursor-pointer text-xs"
                            >
                              Multi-Activity
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Multiple tasks
                            </p>
                          </div>
                          <Target className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Activity (for any single-activity goal) */}
                  {goalType === "single-activity" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="singleActivity"
                        className="text-sm font-medium"
                      >
                        Activity <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="singleActivity"
                        placeholder="e.g., Run 5K, Submit portfolio"
                        value={singleActivity}
                        onChange={(e) => setSingleActivity(e.target.value)}
                        className="focus-ring"
                        required
                      />
                    </div>
                  )}

                  {/* Schedule for all goal types */}
                  <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                    <Label className="text-xs font-medium">
                      Schedule <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={scheduleType}
                      onValueChange={(v: "date" | "recurring") =>
                        setScheduleType(v)
                      }
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div
                          className={`flex items-center space-x-2 p-2 rounded border transition-all cursor-pointer hover:bg-[#66E1F9]/20 hover:border-[#66E1F9] ${scheduleType === "date" ? "border-primary bg-primary/5" : "border-border"}`}
                        >
                          <RadioGroupItem value="date" id="schedule-date" />
                          <div className="flex-1">
                            <Label
                              htmlFor="schedule-date"
                              className="font-medium cursor-pointer text-xs"
                            >
                              Specific Date
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Pick completion day
                            </p>
                          </div>
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div
                          className={`flex items-center space-x-2 p-2 rounded border transition-all cursor-pointer hover:bg-[#66E1F9]/20 hover:border-[#66E1F9] ${scheduleType === "recurring" ? "border-primary bg-primary/5" : "border-border"}`}
                        >
                          <RadioGroupItem
                            value="recurring"
                            id="schedule-recurring"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor="schedule-recurring"
                              className="font-medium cursor-pointer text-xs"
                            >
                              Recurring
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Repeat schedule
                            </p>
                          </div>
                          <Flame className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    </RadioGroup>

                    {scheduleType === "date" ? (
                      <div className="space-y-2">
                        <div className="grid gap-2 grid-cols-2">
                          <div className="space-y-1">
                            <Label htmlFor="specificStartDate" className="text-xs font-medium">
                              Start Date <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="specificStartDate"
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="h-7 text-xs focus-ring"
                              min={new Date().toISOString().split("T")[0]}
                              max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="specificEndDate" className="text-xs font-medium">
                              End Date <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="specificEndDate"
                              type="date"
                              value={singleDate}
                              onChange={(e) => setSingleDate(e.target.value)}
                              className="h-7 text-xs focus-ring"
                              min={startDate || new Date().toISOString().split("T")[0]}
                              required
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Max 2 months from today
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor="startDate" className="text-xs font-medium">
                            Start Date <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-7 text-xs focus-ring"
                            min={new Date().toISOString().split("T")[0]}
                            max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Max 2 months from today
                          </p>
                        </div>
                        <div className="grid gap-2 grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">
                              Pattern <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={recurrencePattern}
                              onValueChange={setRecurrencePattern}
                            >
                              <SelectTrigger className="h-7 text-xs focus-ring">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">
                              End <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={endCondition}
                              onValueChange={(
                                value:
                                  | "ongoing"
                                  | "by-date"
                                  | "after-completions",
                              ) => setEndCondition(value)}
                            >
                              <SelectTrigger className="h-7 text-xs focus-ring">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                <SelectItem value="by-date">By Date</SelectItem>
                                <SelectItem value="after-completions">After Count</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {endCondition === "by-date" && (
                            <div className="space-y-1">
                              <Label
                                htmlFor="recurringDue"
                                className="text-xs font-medium"
                              >
                                End Date <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="recurringDue"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-7 text-xs focus-ring"
                                min={startDate || new Date().toISOString().split("T")[0]}
                                required
                              />
                            </div>
                          )}
                          {endCondition === "after-completions" && (
                            <div className="space-y-1">
                              <Label
                                htmlFor="targetCompletions"
                                className="text-xs font-medium"
                              >
                                Count <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="targetCompletions"
                                type="number"
                                min="1"
                                max="365"
                                value={targetCompletions}
                                onChange={(e) =>
                                  setTargetCompletions(e.target.value)
                                }
                                className="h-7 text-xs focus-ring"
                                placeholder="30"
                                required
                              />
                            </div>
                          )}
                        </div>

                        {recurrencePattern === "custom" && (
                          <div className="space-y-3">
                            <Label className="text-sm">
                              Select Days{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              {weekDays.map((day) => (
                                <div
                                  key={day}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`sa-${day}`}
                                    checked={recurrenceDays.includes(day)}
                                    onCheckedChange={() =>
                                      toggleRecurrenceDay(day)
                                    }
                                  />
                                  <Label
                                    htmlFor={`sa-${day}`}
                                    className="font-normal cursor-pointer capitalize text-sm"
                                  >
                                    {day}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Activities (for multi-activity goals) */}
                  {goalType === "multi-activity" && (
                    <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">
                          Activities <span className="text-destructive">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={addActivity}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add at least 2 activities
                      </p>

                      {/* Activity Suggestions Dropdown */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Quick Add Suggestions:
                        </Label>
                        <Select
                          value=""
                          onValueChange={(value) => {
                            const emptyIndex = activities.findIndex(
                              (a) => !a.trim(),
                            );
                            if (emptyIndex !== -1) {
                              updateActivity(emptyIndex, value);
                            } else {
                              setActivities([...activities, value]);
                            }
                          }}
                        >
                          <SelectTrigger className="focus-ring">
                            <SelectValue placeholder="Choose from suggestions..." />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "30 minutes cardio",
                              "Read 20 pages",
                              "Meditate 10 minutes",
                              "Drink 8 glasses water",
                              "Write in journal",
                              "Practice coding",
                              "Learn new skill",
                              "Call family/friends",
                              "Organize workspace",
                              "Plan tomorrow",
                              "Stretch routine",
                              "Healthy breakfast",
                              "No social media",
                              "Take vitamins",
                              "Walk 10k steps",
                            ].map((suggestion) => (
                              <SelectItem key={suggestion} value={suggestion}>
                                {suggestion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        {activities.map((activity, index) => (
                          <div key={index} className="space-y-2 p-3 rounded-lg border bg-card">
                            <div className="flex gap-2">
                              <Input
                                placeholder={`Activity ${index + 1}`}
                                value={activity}
                                onChange={(e) =>
                                  updateActivity(index, e.target.value)
                                }
                                className="focus-ring"
                                required
                              />
                              {activities.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeActivity(index)}
                                  className="shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            {/* Activity Assignment (for group goals) */}
                            {goalNature === "group" && groupMembers.length > 1 && (
                              <ActivityAssignment
                                activityIndex={index}
                                groupMembers={allGroupCandidates.filter(m => groupMembers.includes(m.id)).map(m => ({ ...m, status: 'accepted' as const }))}
                                assignment={activityAssignments[index] || null}
                                assignedToAll={!activityAssignments[index]}
                                onAssignmentChange={(idx, assignment, assignedToAll) => {
                                  const newAssignments = { ...activityAssignments };
                                  if (assignedToAll) {
                                    delete newAssignments[idx];
                                  } else {
                                    newAssignments[idx] = assignment;
                                  }
                                  setActivityAssignments(newAssignments);
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accountability Partners (only for personal goals) */}
                  {goalNature === "personal" && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-[0_8px_18px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Accountability Partners
                        </Label>
                        <Badge variant="outline" className="text-xs bg-white text-slate-600 border-slate-200 dark:bg-slate-900/60 dark:text-slate-200">
                          {selectedPartners.length}/2
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Choose mutual followers to help keep you accountable
                      </p>

                      {availablePartners.length === 0 ? (
                        <div className="text-center py-4">
                          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground mb-2">
                            No mutual followers available
                          </p>
                          <Link href="/partners/find">
                            <Button variant="outline" size="sm" className="text-xs h-7">
                              Find Partners
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <>
                          <Select
                            value=""
                            onValueChange={(value) => {
                              if (
                                !selectedPartners.includes(value) &&
                                selectedPartners.length < 2
                              ) {
                                setSelectedPartners([...selectedPartners, value]);
                              }
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs focus-ring rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                              <SelectValue placeholder="Add accountability partner..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePartners
                                .filter((p) => !selectedPartners.includes(p.id))
                                .map((partner) => (
                                  <SelectItem key={partner.id} value={partner.id} className="text-xs">
                                    <div className="flex items-center gap-2">
                                      {partner.profile_picture_url ? (
                                        <img
                                          src={partner.profile_picture_url}
                                          alt={partner.name}
                                          className="h-6 w-6 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                          <span className="text-[10px] font-semibold">
                                            {partner.name.charAt(0)}
                                          </span>
                                        </div>
                                      )}
                                      <div className="text-xs font-medium text-slate-600 dark:text-slate-200">
                                        {partner.name}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          {selectedPartners.length > 0 && (
                            <div className="space-y-2">
                              {selectedPartners.map((partnerId) => {
                                const partner = availablePartners.find(
                                  (p) => p.id === partnerId,
                                );
                                if (!partner) return null;
                                return (
                                  <div
                                    key={partnerId}
                                    className="flex items-center justify-between rounded-lg border border-white bg-white p-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                                  >
                                    <div className="flex items-center gap-2">
                                      {partner.profile_picture_url ? (
                                        <img
                                          src={partner.profile_picture_url}
                                          alt={partner.name}
                                          className="h-6 w-6 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                          <span className="text-[11px] font-semibold">
                                            {partner.name.charAt(0)}
                                          </span>
                                        </div>
                                      )}
                                      <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                        {partner.name}
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-slate-400 hover:text-destructive"
                                      onClick={() =>
                                        setSelectedPartners(
                                          selectedPartners.filter(
                                            (id) => id !== partnerId,
                                          ),
                                        )
                                      }
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Visibility */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Visibility <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={visibility}
                      onValueChange={(value: string) =>
                        setVisibility(
                          value as "private" | "followers" | "accountability_partners" | "public",
                        )
                      }
                    >
                      <SelectTrigger className="focus-ring">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-3 w-3" />
                            <span className="text-xs">Private</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="followers">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">Followers</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="accountability_partners">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">Partners</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3" />
                            <span className="text-xs">Public</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Actions */}
                  <div className="flex gap-3 pt-4">
                    <Link href="/goals" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full hover-lift"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="flex-1 hover-lift"
                      disabled={
                        loading ||
                        !title.trim() ||
                        !description.trim() ||
                        !category ||
                        !goalNature ||
                        (goalType === "single-activity" &&
                          !singleActivity.trim()) ||
                        (goalType === "multi-activity" &&
                          activities.filter((a) => a.trim()).length < 2) ||
                        (scheduleType === "date" && (!startDate || !singleDate)) ||
                        (scheduleType === "recurring" && !startDate) ||
                        (scheduleType === "recurring" &&
                          recurrencePattern === "custom" &&
                          recurrenceDays.length === 0) ||
                        (scheduleType === "recurring" &&
                          endCondition === "by-date" &&
                          !endDate) ||
                        (scheduleType === "recurring" &&
                          endCondition === "after-completions" &&
                          !targetCompletions)
                      }
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Create Goal
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          <div className="space-y-5">


            <Card className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs">
                  <Lightbulb className="h-3 w-3 text-amber-500" />
                  Quick Templates
                </CardTitle>
                <CardDescription className="text-xs">
                  Pre-built structures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid gap-2">
                  {goalTemplates.slice(0, 3).map((template, index) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.title}
                        type="button"
                        className={"flex w-full items-start gap-2 rounded-lg border border-slate-200 bg-white p-2 text-left hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"}
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowTemplateModal(true);
                        }}
                      >
                        <div className={"flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-blue-600 " + template.color}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-100">{template.title}</p>
                          <Badge variant="secondary" className="text-xs">
                            {template.category.replace('-', ' ')}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-6 text-xs"
                  onClick={() => setShowTemplateModal(true)}
                >
                  Browse All
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Title", complete: Boolean(title) },
                    { label: "Type", complete: Boolean(goalType) },
                    { label: "Category", complete: Boolean(category) },
                    { label: "Visibility", complete: Boolean(visibility) },
                  ].map((step) => (
                    <div key={step.label} className={`flex items-center gap-1.5 ${step.complete ? "text-primary" : "text-muted-foreground"}`}>
                      {step.complete ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-current" />}
                      <span className="text-xs">{step.label}</span>
                    </div>
                  ))}
                </div>
                <Progress
                  value={
                    title && goalType && category && visibility
                      ? 100
                      : title && goalType && category
                        ? 75
                        : title && goalType
                          ? 50
                          : title
                            ? 25
                            : 0
                  }
                  className="h-1.5"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog
        open={showTemplateModal}
        onOpenChange={setShowTemplateModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Template</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                <selectedTemplate.icon className={"h-5 w-5 " + selectedTemplate.color} />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedTemplate.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{selectedTemplate.description}</div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wide">Goal Type</Label>
                <RadioGroup
                  value={templateGoalType}
                  onValueChange={(v: "single-activity" | "multi-activity") => setTemplateGoalType(v)}
                  className="grid gap-2"
                >
                  {[
                    { value: "single-activity", label: "Single Activity" },
                    { value: "multi-activity", label: "Multi-Activity Checklist" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      htmlFor={`template-${option.value}`}
                      className={"flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition " + (
                        templateGoalType === option.value ? "border-primary/60 bg-primary/10" : "border-border/50 hover:border-primary/40"
                      )}
                    >
                      <RadioGroupItem value={option.value} id={`template-${option.value}`} />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide">
                  {templateGoalType === "single-activity" ? "Choose one activity" : "Select activities"}
                </Label>
                <div className="space-y-1">
                  {(activitySuggestions[selectedTemplate.category as keyof typeof activitySuggestions] || []).map((activity, idx) => {
                    const isSelected =
                      templateGoalType === "single-activity"
                        ? selectedSingleActivity === activity
                        : selectedActivities.includes(activity);

                    return (
                      <Button
                        key={`${activity}-${idx}`}
                        variant={isSelected ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start rounded-xl px-3 py-2 text-sm"
                        onClick={() => toggleActivitySelection(activity)}
                      >
                        <div className="flex items-center gap-2">
                          {templateGoalType === "single-activity" ? (
                            <div className={"h-3 w-3 rounded-full border " + (isSelected ? "border-primary bg-primary" : "border-muted-foreground")} />
                          ) : (
                            <Checkbox checked={isSelected} disabled />
                          )}
                          {activity}
                        </div>
                      </Button>
                    );
                  })}
                </div>
                {templateGoalType === "multi-activity" && (
                  <p className="text-[11px] text-muted-foreground">Selected: {selectedActivities.length}/5</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={applyTemplate}
                  className="flex-1"
                  disabled={
                    templateGoalType === "single-activity"
                      ? !selectedSingleActivity
                      : selectedActivities.length === 0
                  }
                >
                  Apply Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
