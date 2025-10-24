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

export default function CreateGoalPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalNature, setGoalNature] = useState<"personal" | "group">("personal");
  const [goalType, setGoalType] = useState<"single-activity" | "multi-activity">("single-activity");
  const [visibility, setVisibility] = useState<"public" | "private" | "restricted">("private");
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
  const [durationType, setDurationType] = useState<"standard" | "seasonal">("standard");
  const [seasonalType, setSeasonalType] = useState<"annual" | "quarterly" | "biannual">("annual");
  const [seasonalYear, setSeasonalYear] = useState<number>(new Date().getFullYear());
  const [seasonalQuarter, setSeasonalQuarter] = useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));
  const [activityDueDates, setActivityDueDates] = useState<{[key: number]: string}>({});
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
          username: profile?.username || 'you'
        })

        // Get accountability partners (mutual connections)
        const { data: partners } = await supabase
          .from('accountability_partners')
          .select(`
            *,
            partner_profile:profiles!accountability_partners_partner_id_fkey(*),
            user_profile:profiles!accountability_partners_user_id_fkey(*)
          `)
          .or(`user_id.eq.${user.id},partner_id.eq.${user.id}`)
          .eq('status', 'accepted')

        const partnersList = (partners || []).map(p => {
          const isUserInitiator = p.user_id === user.id
          const partnerProfile = isUserInitiator ? p.partner_profile : p.user_profile
          return {
            id: isUserInitiator ? p.partner_id : p.user_id,
            name: partnerProfile ? `${partnerProfile.first_name || ''} ${partnerProfile.last_name || ''}`.trim() || 'Partner' : 'Partner',
            username: partnerProfile?.username || 'partner'
          }
        })

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
        return [currentUser.id, ...prev].slice(0, 5);
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

      // Show modal if no accountability partners available
      if (goalNature === "personal" && selectedPartners.length === 0 && availablePartners.length === 0) {
        // This will be handled by the UI showing the dropdown with empty state
      }



      // Prepare goal data for database - ensure user_id matches auth.users table
      const goalData = {
        user_id: authUser.id, // This should match auth.users(id)
        title: title || "Untitled Goal",
        description,
        goal_type: goalType,
        visibility,
        status: "active",
        progress: 0,
        category: category.replace('-', '_'),
        priority: "medium",
        target_date: endCondition === "by-date" ? singleDate : null,
        is_suspended: false,
        completed_at: null,
        duration_type: durationType,
        schedule_type: scheduleType,
        recurrence_pattern: scheduleType === "recurring" ? recurrencePattern : null,
        recurrence_days: scheduleType === "recurring" && recurrencePattern === "custom" ? recurrenceDays : null,
        end_condition: scheduleType === "recurring" ? endCondition : null,
        target_completions: scheduleType === "recurring" && endCondition === "after-completions" ? parseInt(targetCompletions) : null
      }

      console.log('Creating goal with user_id:', authUser.id)
      console.log('Profile exists:', profile.id)

      // Create goal in database
      const { data: newGoal, error: goalError } = await supabase
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

      // Check for achievements
      const { checkAndUnlockAchievements } = await import('@/lib/achievements')
      await checkAndUnlockAchievements(authUser.id, 'goal_created')

      // Create goal activities for multi-activity goals
      if (goalType === "multi-activity" && activities.length > 0) {
        const goalActivities = activities
          .filter(activity => activity.trim())
          .map((activity, index) => ({
            goal_id: newGoal.id,
            title: activity.trim(),
            completed: false,
            order_index: index
          }))

        if (goalActivities.length > 0) {
          await supabase
            .from('goal_activities')
            .insert(goalActivities)
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Standard Goal
            </h1>
            <p className="text-muted-foreground">
              Set a regular goal with custom timeline and activities
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/goals">
              <Button variant="outline" className="hover-lift">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Goals
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Standard Goal Details
                  </CardTitle>
                  <CardDescription>
                    Define your regular goal with custom timeline and activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Goal Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Workout every morning, Read 30 minutes daily"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="focus-ring"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what you want to achieve and why it matters to you..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="focus-ring"
                    />
                  </div>

                  {/* Goal Nature - Personal or Group */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">
                      Goal Nature <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={goalNature}
                      onValueChange={(value: string) =>
                        setGoalNature(value as "personal" | "group")
                      }
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${
                            goalNature === "personal"
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                        >
                          <RadioGroupItem value="personal" id="personal" />
                          <div className="flex-1">
                            <Label
                              htmlFor="personal"
                              className="font-medium cursor-pointer"
                            >
                              Personal Goal
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Just for you
                            </p>
                          </div>
                          <Target className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${
                            goalNature === "group"
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                        >
                          <RadioGroupItem value="group" id="group" />
                          <div className="flex-1">
                            <Label
                              htmlFor="group"
                              className="font-medium cursor-pointer"
                            >
                              Group Goal
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Owner included + up to 4 others (max 5)
                            </p>
                          </div>
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Group Members Selection (only for group goals) */}
                  {goalNature === "group" && (
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border-2 border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            Group Members
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            The owner is automatically included. Add up to 4
                            more members (max 5 total).
                          </p>
                        </div>
                        <Badge variant="outline">{groupMembers.length}/5</Badge>
                      </div>

                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (
                            !groupMembers.includes(value) &&
                            groupMembers.length < 5
                          ) {
                            setGroupMembers([...groupMembers, value]);
                          }
                        }}
                      >
                        <SelectTrigger className="focus-ring">
                          <SelectValue placeholder="Add a member..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allGroupCandidates
                            .filter((p) => p.id !== currentUser.id)
                            .filter((p) => !groupMembers.includes(p.id))
                            .map((partner) => (
                              <SelectItem key={partner.id} value={partner.id}>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-medium">
                                      {partner.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">
                                      {partner.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      @{partner.username}
                                    </div>
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
                                className="flex items-center justify-between p-2 rounded-md bg-background border"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-sm font-medium">
                                      {member.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">
                                      {member.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      @{member.username}
                                    </div>
                                  </div>
                                </div>
                                {memberId !== currentUser.id && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      setGroupMembers(
                                        groupMembers.filter(
                                          (id) => id !== memberId,
                                        ),
                                      )
                                    }
                                  >
                                    <X className="h-4 w-4" />
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
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="focus-ring">
                        <SelectValue placeholder="Select a category for your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health-fitness">
                          Health & Fitness
                        </SelectItem>
                        <SelectItem value="career">
                          Career & Business
                        </SelectItem>
                        <SelectItem value="learning">
                          Learning & Education
                        </SelectItem>
                        <SelectItem value="personal">
                          Personal Growth
                        </SelectItem>
                        <SelectItem value="relationships">
                          Relationships
                        </SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="creative">Creative Arts</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="wellness">Wellness</SelectItem>
                        <SelectItem value="productivity">
                          Productivity
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>



                  {/* Goal Type Selection */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">
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
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${
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
                              className="font-medium cursor-pointer"
                            >
                              Single Activity
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              One specific task to complete
                            </p>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${
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
                              className="font-medium cursor-pointer"
                            >
                              Multi-Activity Checklist
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Multiple tasks to complete
                            </p>
                          </div>
                          <Target className="h-5 w-5 text-muted-foreground" />
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
                  <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                    <Label className="text-sm font-medium">
                      Schedule <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={scheduleType}
                      onValueChange={(v: "date" | "recurring") =>
                        setScheduleType(v)
                      }
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${scheduleType === "date" ? "border-primary bg-primary/5" : "border-border"}`}
                        >
                          <RadioGroupItem value="date" id="schedule-date" />
                          <div className="flex-1">
                            <Label
                              htmlFor="schedule-date"
                              className="font-medium cursor-pointer"
                            >
                              Specific Date
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Pick the day to complete this
                            </p>
                          </div>
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${scheduleType === "recurring" ? "border-primary bg-primary/5" : "border-border"}`}
                        >
                          <RadioGroupItem
                            value="recurring"
                            id="schedule-recurring"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor="schedule-recurring"
                              className="font-medium cursor-pointer"
                            >
                              Recurring
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Repeat on a schedule
                            </p>
                          </div>
                          <Flame className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </RadioGroup>

                    {scheduleType === "date" ? (
                      <div className="space-y-2">
                        <Label
                          htmlFor="singleDate"
                          className="text-sm font-medium"
                        >
                          Select Date{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="singleDate"
                          type="date"
                          value={singleDate}
                          onChange={(e) => setSingleDate(e.target.value)}
                          className="focus-ring"
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Recurrence Pattern{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={recurrencePattern}
                              onValueChange={setRecurrencePattern}
                            >
                              <SelectTrigger className="focus-ring">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="custom">
                                  Custom Days
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              End Condition{" "}
                              <span className="text-destructive">*</span>
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
                              <SelectTrigger className="focus-ring">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ongoing">
                                  Ongoing (No end date)
                                </SelectItem>
                                <SelectItem value="by-date">
                                  {recurrencePattern === "daily"
                                    ? "End Date"
                                    : recurrencePattern === "weekly"
                                      ? "Target Week"
                                      : recurrencePattern === "monthly"
                                        ? "Target Month"
                                        : "End Date"}
                                </SelectItem>
                                <SelectItem value="after-completions">
                                  After Completions
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {endCondition === "by-date" && (
                            <div className="space-y-2">
                              <Label
                                htmlFor="recurringDue"
                                className="text-sm font-medium"
                              >
                                {recurrencePattern === "daily"
                                  ? "End Date"
                                  : recurrencePattern === "weekly"
                                    ? "Target Week End"
                                    : recurrencePattern === "monthly"
                                      ? "Target Month End"
                                      : "End Date"}{" "}
                                <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="recurringDue"
                                type="date"
                                value={singleDate}
                                onChange={(e) => setSingleDate(e.target.value)}
                                className="focus-ring"
                                min={new Date().toISOString().split("T")[0]}
                                max={
                                  new Date(
                                    Date.now() + 60 * 24 * 60 * 60 * 1000,
                                  )
                                    .toISOString()
                                    .split("T")[0]
                                }
                                required
                              />
                            </div>
                          )}
                          {endCondition === "after-completions" && (
                            <div className="space-y-2">
                              <Label
                                htmlFor="targetCompletions"
                                className="text-sm font-medium"
                              >
                                Target Completions{" "}
                                <span className="text-destructive">*</span>
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
                                className="focus-ring"
                                placeholder={
                                  recurrencePattern === "daily"
                                    ? "e.g., 30 days"
                                    : recurrencePattern === "weekly"
                                      ? "e.g., 12 weeks"
                                      : recurrencePattern === "monthly"
                                        ? "e.g., 6 months"
                                        : "e.g., 20 cycles"
                                }
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
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Activities <span className="text-destructive">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addActivity}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Activity
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add at least 2 activities or choose from suggestions
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

                            {/* Activity Due Date */}
                            <div className="flex items-center gap-2">
                              <Label className="text-xs font-medium text-muted-foreground">
                                Due Date (Optional)
                              </Label>
                              <Input
                                type="date"
                                value={activityDueDates[index] || ''}
                                onChange={(e) => {
                                  const newDueDates = { ...activityDueDates };
                                  newDueDates[index] = e.target.value;
                                  setActivityDueDates(newDueDates);
                                }}
                                className="focus-ring h-8 text-xs"
                                min={new Date().toISOString().split("T")[0]}
                              />
                            </div>

                            {/* Activity Assignment (for group goals) */}
                            {goalNature === "group" && groupMembers.length > 1 && (
                              <div className="flex items-center gap-2">
                                <Label className="text-xs font-medium text-muted-foreground">
                                  Assign to
                                </Label>
                                <Select
                                  value={activityAssignments[index] || ''}
                                  onValueChange={(value) => {
                                    const newAssignments = { ...activityAssignments };
                                    newAssignments[index] = value;
                                    setActivityAssignments(newAssignments);
                                  }}
                                >
                                  <SelectTrigger className="focus-ring h-8 text-xs">
                                    <SelectValue placeholder="Select member..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {groupMembers.map((memberId) => {
                                      const member = allGroupCandidates.find(p => p.id === memberId);
                                      if (!member) return null;
                                      return (
                                        <SelectItem key={memberId} value={memberId}>
                                          <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                              <span className="text-xs font-medium">
                                                {member.name.charAt(0)}
                                              </span>
                                            </div>
                                            <span className="text-sm">{member.name}</span>
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accountability Partners (only for personal goals) */}
                  {goalNature === "personal" && (
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                      <div>
                        <Label className="text-sm font-medium">
                          Accountability Partners
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Optional: Select partners to help keep you accountable
                        </p>
                      </div>

                      {/* Partners Dropdown */}
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (selectedPartners.length >= 2) {
                            try {
                              toast.error("You can select up to 2 partners");
                            } catch {}
                            return;
                          }
                          if (!selectedPartners.includes(value)) {
                            setSelectedPartners([...selectedPartners, value]);
                          }
                        }}
                      >
                        <SelectTrigger className="focus-ring">
                          <SelectValue placeholder="Add an accountability partner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePartners.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm mb-2">No accountability partners available</p>
                              <p className="text-xs">You can still create the goal and add partners later from your Partners page.</p>
                            </div>
                          ) : (
                            availablePartners
                              .filter((p) => !selectedPartners.includes(p.id))
                              .map((partner) => (
                                <SelectItem key={partner.id} value={partner.id}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                      <span className="text-xs font-medium">
                                        {partner.name.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">
                                        {partner.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        @{partner.username}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>

                      <div className="text-xs text-muted-foreground">
                        Selected {selectedPartners.length}/2
                      </div>

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
                                className="flex items-center justify-between p-2 rounded-md bg-background border"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-medium">
                                      {partner.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="text-sm font-medium">
                                    {partner.name}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
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
                          value as "private" | "restricted" | "public",
                        )
                      }
                    >
                      <SelectTrigger className="focus-ring">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Private</div>
                              <div className="text-xs text-muted-foreground">
                                Only you can see
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="restricted">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Partners Only</div>
                              <div className="text-xs text-muted-foreground">
                                Only your partners can see
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Public</div>
                              <div className="text-xs text-muted-foreground">
                                Everyone can see
                              </div>
                            </div>
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
                        (scheduleType === "date" && !singleDate) ||
                        (scheduleType === "recurring" &&
                          recurrencePattern === "custom" &&
                          recurrenceDays.length === 0) ||
                        (scheduleType === "recurring" &&
                          endCondition === "by-date" &&
                          !singleDate) ||
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

          {/* Sidebar - Templates & Tips */}
          <div className="space-y-6">
            {/* Goal Templates */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Goal Templates
                </CardTitle>
                <CardDescription>
                  Get inspired with these popular goal ideas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {goalTemplates.map((template, index) => {
                  const Icon = template.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto p-3 hover-lift"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowTemplateModal(true);
                      }}
                    >
                      <div className="flex items-start gap-3 text-left">
                        <div
                          className={`p-2 rounded-lg bg-muted ${template.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {template.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {template.category.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Template Selection Modal */}
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
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <selectedTemplate.icon
                        className={`h-5 w-5 ${selectedTemplate.color}`}
                      />
                      <div>
                        <div className="font-medium">
                          {selectedTemplate.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedTemplate.description}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Goal Type</Label>
                      <RadioGroup
                        value={templateGoalType}
                        onValueChange={(
                          v: "single-activity" | "multi-activity",
                        ) => setTemplateGoalType(v)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="single-activity"
                            id="template-single"
                          />
                          <Label htmlFor="template-single" className="text-sm">
                            Single Activity
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="multi-activity"
                            id="template-multi"
                          />
                          <Label htmlFor="template-multi" className="text-sm">
                            Multi-Activity Checklist
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {templateGoalType === "single-activity"
                          ? "Choose One Activity"
                          : "Select Activities"}
                      </Label>
                      <div className="space-y-1">
                        {(
                          activitySuggestions[
                            selectedTemplate.category as keyof typeof activitySuggestions
                          ] || []
                        ).map((activity, i) => {
                          const isSelected =
                            templateGoalType === "single-activity"
                              ? selectedSingleActivity === activity
                              : selectedActivities.includes(activity);

                          return (
                            <Button
                              key={i}
                              variant={isSelected ? "default" : "ghost"}
                              size="sm"
                              className="w-full justify-start h-auto p-2 text-sm"
                              onClick={() => toggleActivitySelection(activity)}
                            >
                              <div className="flex items-center gap-2">
                                {templateGoalType === "single-activity" ? (
                                  <div
                                    className={`w-3 h-3 rounded-full border-2 ${isSelected ? "bg-primary border-primary" : "border-muted-foreground"}`}
                                  />
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
                        <p className="text-xs text-muted-foreground">
                          Selected: {selectedActivities.length}/5
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowTemplateModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
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

            {/* Tips Card */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-lg">?? Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Start with specific, measurable goals
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Break large goals into smaller milestones
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Share with partners for accountability
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Track progress and celebrate wins
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Indicator */}
            <Card className="hover-lift">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="text-sm font-medium">
                    Goal Creation Progress
                  </div>
                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-2 text-sm ${title ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      {title ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-current" />
                      )}
                      Goal Title
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${goalType ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      {goalType ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-current" />
                      )}
                      Goal Type
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${category ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      {category ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-current" />
                      )}
                      Category
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${visibility ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      {visibility ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-current" />
                      )}
                      Visibility
                    </div>
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
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
