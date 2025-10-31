"use client"

import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useUserSettings } from "@/hooks/use-user-settings"
import { useToast } from "@/hooks/use-toast"
import { PushNotificationSettings } from "@/components/notifications/push-notification-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Trash2,
  Save,
  Upload,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  MessageSquare,
  Target,
  Award,
  Calendar,
  Clock,
  Camera,
  Sparkles,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Users,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Monitor,
  Moon,
  Sun,
  Zap,
  Heart,
  Star,
  Tag,
  Filter,
  Search,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Timer,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  RotateCcw,
  Download,
  Share,
  Link,
  Wifi,
  WifiOff,
  Battery,
  HardDrive,
  Cloud,
  CloudOff,
  Database,
  FileText,
  Settings2,
  Sliders
} from "lucide-react"

export default function SettingsPage() {
  const { settings, profile, loading, saving, saveSettings, updateProfilePicture } = useUserSettings()
  const [tempSettings, setTempSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Sync tempSettings when settings load
  useEffect(() => {
    if (!loading) {
      setTempSettings(settings)
      setHasChanges(false)
    }
  }, [settings, loading])

  // Check for changes
  useEffect(() => {
    const hasTempChanges = JSON.stringify(tempSettings) !== JSON.stringify(settings)
    setHasChanges(hasTempChanges)
  }, [tempSettings, settings])

  const handleInputChange = (field: string, value: string | boolean) => {
    setTempSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    await saveSettings(tempSettings)
    setHasChanges(false)
  }

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "File too large",
        description: "Profile picture must be less than 2MB.",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    await updateProfilePicture(file)
  }

  const getInitials = () => {
    const displayName = tempSettings.displayName.trim()
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return 'U'
  }

  const resetToDefaults = () => {
    setTempSettings({
      displayName: profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : profile?.username || '',
      username: profile?.username || '',
      email: profile?.email || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
      website: profile?.website || '',
      profilePictureUrl: profile?.profile_picture_url || '',
      profileVisibility: 'public',
      showGoals: true,
      showAchievements: true,
      showActivity: false,
      allowMessages: true,
      allowPartnerRequests: true,
      emailNotifications: true,
      goalReminders: true,
      achievementAlerts: true,
      partnerMessages: true,
      weeklyReports: false,
      marketingEmails: false,
      pushNotifications: false,
      theme: 'system',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      timezone: 'America/New_York',
      defaultGoalVisibility: 'public',
      autoReminders: true,
      weeklyReview: false,
      reminderTime: '09:00',
      reviewDay: 'monday'
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <Skeleton className="h-12 w-full" />

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-2 py-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xs font-medium">Settings</h1>
          <div className="flex items-center gap-1">
            {hasChanges && <span className="text-xs text-amber-600">*</span>}
            <Button onClick={handleSave} disabled={!hasChanges || saving} size="sm" className="h-5 text-xs">
              {saving ? <Loader2 className="h-2 w-2 animate-spin" /> : <Save className="h-2 w-2" />}
              Save
            </Button>
          </div>
        </div>

        <Tabs defaultValue="account">
          <TabsList className="w-full grid grid-cols-8 h-6 mb-3">
            <TabsTrigger value="account" className="text-xs h-5">Account</TabsTrigger>
            <TabsTrigger value="security" className="text-xs h-5">Security</TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs h-5">Privacy</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs h-5">Notifications</TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs h-5">Display</TabsTrigger>
            <TabsTrigger value="goals" className="text-xs h-5">Goals</TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs h-5">Connect</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs h-5">Advanced</TabsTrigger>
          </TabsList>

            <TabsContent value="account" className="py-2">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Profile</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="w-16 text-xs">Name</Label>
                        <Input value={tempSettings.displayName} className="h-6 text-xs" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="w-16 text-xs">Email</Label>
                        <Input value={tempSettings.email} className="h-6 text-xs" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="w-16 text-xs">Bio</Label>
                        <Textarea rows={2} value={tempSettings.bio} className="text-xs" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Security</h3>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full h-6 text-xs">Change Password</Button>
                      <Button size="sm" variant="outline" className="w-full h-6 text-xs">Enable 2FA</Button>
                      <Button size="sm" variant="outline" className="w-full h-6 text-xs">View Sessions</Button>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button size="sm" variant="destructive" className="h-6 text-xs">Delete Account</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="py-2">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Enable email notifications</Label>
                      <Switch checked={tempSettings.emailNotifications} onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Goal reminders</Label>
                      <Switch checked={tempSettings.goalReminders} onCheckedChange={(checked) => handleInputChange("goalReminders", checked)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Achievement alerts</Label>
                      <Switch checked={tempSettings.achievementAlerts} onCheckedChange={(checked) => handleInputChange("achievementAlerts", checked)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Weekly reports</Label>
                      <Switch checked={tempSettings.weeklyReports} onCheckedChange={(checked) => handleInputChange("weeklyReports", checked)} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Push Notifications</h3>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Browser notifications</Label>
                      <Switch checked={tempSettings.pushNotifications} onCheckedChange={(checked) => handleInputChange("pushNotifications", checked)} />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <PushNotificationSettings />
                </div>
              </div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-950 dark:to-indigo-950/20 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                        <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Profile & Visibility</CardTitle>
                        <CardDescription>Control who can see your profile</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <Label className="text-sm font-medium">Profile Visibility</Label>
                          <p className="text-xs text-muted-foreground">Who can see your profile</p>
                        </div>
                        <Select value={tempSettings.profileVisibility} onValueChange={(value) => handleInputChange("profileVisibility", value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="partners">Partners Only</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          What others can see:
                        </h4>

                        {[
                          { field: 'showGoals', label: 'Your goals and progress', icon: Target },
                          { field: 'showAchievements', label: 'Your achievements and badges', icon: Award },
                          { field: 'showActivity', label: 'Your recent activity', icon: Calendar }
                        ].map(({ field, label, icon: Icon }) => (
                          <div key={field} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor={field} className="text-sm">{label}</Label>
                            </div>
                            <Switch
                              id={field}
                              checked={tempSettings[field as keyof typeof tempSettings] as boolean}
                              onCheckedChange={(checked) => handleInputChange(field, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-950 dark:to-emerald-950/20 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Interactions</CardTitle>
                        <CardDescription>Manage how others can contact you</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allow-messages" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Allow Direct Messages
                          </Label>
                          <p className="text-xs text-muted-foreground">Let other users send you private messages</p>
                        </div>
                        <Switch
                          id="allow-messages"
                          checked={tempSettings.allowMessages}
                          onCheckedChange={(checked) => handleInputChange("allowMessages", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allow-partner-requests" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Allow Partner Requests
                          </Label>
                          <p className="text-xs text-muted-foreground">Let others send accountability partnership requests</p>
                        </div>
                        <Switch
                          id="allow-partner-requests"
                          checked={tempSettings.allowPartnerRequests}
                          onCheckedChange={(checked) => handleInputChange("allowPartnerRequests", checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-0 bg-gradient-to-br from-white to-pink-50/50 dark:from-gray-950 dark:to-pink-950/20 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-lg">
                        <Palette className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Theme & Display</CardTitle>
                        <CardDescription>Customize your app experience</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Theme
                        </Label>
                        <Select value={tempSettings.theme} onValueChange={(value) => handleInputChange("theme", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light Mode</SelectItem>
                            <SelectItem value="dark">Dark Mode</SelectItem>
                            <SelectItem value="system">System Preference</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm font-medium mb-2">Theme Preview</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-8 bg-white border rounded"></div>
                          <div className="h-8 bg-gray-100 dark:bg-gray-700 border rounded"></div>
                          <div className="h-8 bg-gray-900 dark:bg-white border rounded"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-white to-teal-50/50 dark:from-gray-950 dark:to-teal-950/20 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
                        <Globe className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Language & Region</CardTitle>
                        <CardDescription>Change language and format preferences</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Language
                        </Label>
                        <Select value={tempSettings.language} onValueChange={(value) => handleInputChange("language", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">🇺🇸 English</SelectItem>
                            <SelectItem value="es">🇪🇸 Español</SelectItem>
                            <SelectItem value="fr">🇫🇷 Français</SelectItem>
                            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date Format
                        </Label>
                        <Select value={tempSettings.dateFormat} onValueChange={(value) => handleInputChange("dateFormat", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Time Format
                        </Label>
                        <Select value={tempSettings.timeFormat} onValueChange={(value) => handleInputChange("timeFormat", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                            <SelectItem value="24h">24-hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Timezone
                        </Label>
                        <Select value={tempSettings.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="Europe/London">London</SelectItem>
                            <SelectItem value="Europe/Paris">Paris</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Goals Settings */}
            <TabsContent value="goals" className="space-y-6 mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card className="border-0 bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-950 dark:to-orange-950/20 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                          <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Goal Preferences</CardTitle>
                          <CardDescription>Customize your goal creation and management experience</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                          <Label className="text-sm font-medium mb-2 block">Default Goal Visibility</Label>
                          <Select value={tempSettings.defaultGoalVisibility} onValueChange={(value) => handleInputChange("defaultGoalVisibility", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public - Everyone can see</SelectItem>
                              <SelectItem value="partners">Partners Only - Shared with accountability partners</SelectItem>
                              <SelectItem value="private">Private - Only you can see</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
                            <Label htmlFor="auto-reminders" className="flex-1">
                              <span className="font-medium">Auto Reminders</span>
                              <p className="text-sm text-muted-foreground">Automatically remind you about incomplete goals</p>
                            </Label>
                            <Switch
                              id="auto-reminders"
                              checked={tempSettings.autoReminders}
                              onCheckedChange={(checked) => handleInputChange("autoReminders", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                            <Label htmlFor="weekly-review" className="flex-1">
                              <span className="font-medium">Weekly Review</span>
                              <p className="text-sm text-muted-foreground">Get weekly progress summaries</p>
                            </Label>
                            <Switch
                              id="weekly-review"
                              checked={tempSettings.weeklyReview}
                              onCheckedChange={(checked) => handleInputChange("weeklyReview", checked)}
                            />
                          </div>
                        </div>

                        {tempSettings.autoReminders && (
                          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl">
                            <Label htmlFor="reminder-time" className="text-sm font-medium mb-2 block">Reminder Time</Label>
                            <Input
                              id="reminder-time"
                              type="time"
                              value={tempSettings.reminderTime}
                              onChange={(e) => handleInputChange("reminderTime", e.target.value)}
                              className="max-w-40"
                            />
                            <p className="text-xs text-muted-foreground mt-2">Daily reminder time for your goals</p>
                          </div>
                        )}

                        {tempSettings.weeklyReview && (
                          <div className="p-4 bg-pink-50 dark:bg-pink-950/20 rounded-xl">
                            <Label className="text-sm font-medium mb-2 block">Review Day</Label>
                            <Select value={tempSettings.reviewDay} onValueChange={(value) => handleInputChange("reviewDay", value)}>
                              <SelectTrigger className="max-w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monday">Monday</SelectItem>
                                <SelectItem value="tuesday">Tuesday</SelectItem>
                                <SelectItem value="wednesday">Wednesday</SelectItem>
                                <SelectItem value="thursday">Thursday</SelectItem>
                                <SelectItem value="friday">Friday</SelectItem>
                                <SelectItem value="saturday">Saturday</SelectItem>
                                <SelectItem value="sunday">Sunday</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-2">Day of the week for your weekly reports</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Danger Zone */}
                <div>
                  <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-gray-950 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                          <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-red-900 dark:text-red-100">Danger Zone</CardTitle>
                          <CardDescription className="text-red-700 dark:text-red-300">
                            Irreversible actions that will permanently affect your account
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-red-100/50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-red-900 dark:text-red-100">Delete Account</h4>
                              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                Permanently delete your account and all associated data including goals, achievements, and partner relationships.
                                This action cannot be undone.
                              </p>
                            </div>
                            <Button variant="destructive" size="sm" className="ml-4 shrink-0">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 bg-yellow-100/50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Export Data</h4>
                              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                Download all your data including goals, progress, and settings in JSON format.
                              </p>
                            </div>
                            <Button variant="outline" size="sm" className="ml-4 shrink-0">
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Profile Information</CardTitle>
                    <CardDescription className="text-xs">Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={tempSettings.profilePictureUrl} />
                        <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs font-medium">Profile Picture</Label>
                        <Button size="sm" variant="outline" className="text-xs">Change</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Full Name</Label>
                        <Input value={tempSettings.displayName} className="h-7 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Username</Label>
                        <Input value={tempSettings.username} className="h-7 text-xs" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email</Label>
                      <Input value={tempSettings.email} className="h-7 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Bio</Label>
                      <Textarea rows={2} value={tempSettings.bio} className="text-xs" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Social Links</CardTitle>
                    <CardDescription className="text-xs">Connect your social profiles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-gray-400" />
                        <Input placeholder="Website URL" className="h-7 text-xs" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Share className="h-3 w-3 text-gray-400" />
                        <Input placeholder="LinkedIn" className="h-7 text-xs" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-gray-400" />
                        <Input placeholder="GitHub" className="h-7 text-xs" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Account Stats</CardTitle>
                    <CardDescription className="text-xs">Your activity summary</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">12</div>
                        <div className="text-xs text-gray-500">Goals Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">7</div>
                        <div className="text-xs text-gray-500">Current Streak</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">6</div>
                        <div className="text-xs text-gray-500">Achievements</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">24</div>
                        <div className="text-xs text-gray-500">Active Goals</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">Danger Zone</CardTitle>
                    <CardDescription className="text-xs">Irreversible actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="destructive" size="sm" className="w-full text-xs">
                      Delete Account
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Export Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Password & Authentication</CardTitle>
                  <CardDescription className="text-xs">Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Password</div>
                      <div className="text-xs text-gray-500">Last changed 3 months ago</div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">Reset Password</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Two-Factor Authentication</div>
                      <div className="text-xs text-gray-500">Add an extra layer of security</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Disabled</Badge>
                  </div>
                  <Button size="sm" className="w-full text-xs">Enable 2FA</Button>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Active Sessions</div>
                      <div className="text-xs text-gray-500">Manage your device logins</div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">View Sessions</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Login History</CardTitle>
                  <CardDescription className="text-xs">Recent login activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <Monitor className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="text-xs font-medium">MacBook Pro</div>
                        <div className="text-xs text-gray-500">New York, NY - 2 hours ago</div>
                      </div>
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="text-xs font-medium">iPhone 15 Pro</div>
                        <div className="text-xs text-gray-500">New York, NY - Yesterday</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Tab - Already exists */}
          <TabsContent value="privacy" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Profile Visibility</CardTitle>
                  <CardDescription className="text-xs">Control who can see your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Profile Visibility</Label>
                    <Select value={tempSettings.profileVisibility}
                            onValueChange={(value) => handleInputChange("profileVisibility", value)}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public" className="text-xs">Public</SelectItem>
                        <SelectItem value="partners" className="text-xs">Partners Only</SelectItem>
                        <SelectItem value="private" className="text-xs">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-medium">What others can see:</Label>
                    {[
                      { field: 'showGoals', label: 'Goals and progress', icon: Target },
                      { field: 'showAchievements', label: 'Achievements and badges', icon: Award },
                      { field: 'showActivity', label: 'Recent activity', icon: Calendar }
                    ].map(({ field, label, icon: Icon }) => (
                      <div key={field} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3 w-3 text-gray-400" />
                          <Label className="text-xs">{label}</Label>
                        </div>
                        <Switch
                          checked={tempSettings[field as keyof typeof tempSettings] as boolean}
                          onCheckedChange={(checked) => handleInputChange(field, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Interactions</CardTitle>
                  <CardDescription className="text-xs">Manage incoming connections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-medium">Allow Direct Messages</Label>
                      <p className="text-xs text-gray-500">Let other users send you private messages</p>
                    </div>
                    <Switch
                      checked={tempSettings.allowMessages}
                      onCheckedChange={(checked) => handleInputChange("allowMessages", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-medium">Allow Partner Requests</Label>
                      <p className="text-xs text-gray-500">Let others send accountability partnership requests</p>
                    </div>
                    <Switch
                      checked={tempSettings.allowPartnerRequests}
                      onCheckedChange={(checked) => handleInputChange("allowPartnerRequests", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Calendar Sync</CardTitle>
                  <CardDescription className="text-xs">Connect your external calendars</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Calendar className="h-3 w-3 mr-2" />
                    Connect Google Calendar
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Calendar className="h-3 w-3 mr-2" />
                    Connect Outlook Calendar
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Calendar className="h-3 w-3 mr-2" />
                    Connect Apple Calendar
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Fitness & Health</CardTitle>
                  <CardDescription className="text-xs">Import data from fitness apps</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Activity className="h-3 w-3 mr-2" />
                    Connect Fitbit
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Heart className="h-3 w-3 mr-2" />
                    Connect Apple Health
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <TrendingUp className="h-3 w-3 mr-2" />
                    Connect Strava
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">API Access</CardTitle>
                <CardDescription className="text-xs">Developers area for API integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">API Key</Label>
                    <div className="flex gap-2">
                      <Input value="sk-1234567890abcdef12345" readOnly className="font-mono text-xs h-7" />
                      <Button variant="outline" size="sm" className="text-xs">Regenerate</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Webhook URL</Label>
                    <Input placeholder="https://your-app.com/webhook" className="text-xs h-7" />
                  </div>
                </div>
                <Button size="sm" className="text-xs">Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Data Management</CardTitle>
                  <CardDescription className="text-xs">Import, export, and backup settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      <Download className="h-3 w-3 mr-2" />
                      Export Goals
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Upload className="h-3 w-3 mr-2" />
                      Import Goals
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      <Cloud className="h-3 w-3 mr-2" />
                      Backup Data
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <CloudOff className="h-3 w-3 mr-2" />
                      Restore Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <CardDescription className="text-xs">Optimize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-medium">Preload Data</Label>
                      <p className="text-xs text-gray-500">Load data faster with caching</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-medium">Auto-sync</Label>
                      <p className="text-xs text-gray-500">Sync across devices automatically</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-medium">Offline Mode</Label>
                      <p className="text-xs text-gray-500">Work without internet connection</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Debug Section */}
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">Developer Tools</CardTitle>
                <CardDescription className="text-xs">Debug and troubleshooting options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Database className="h-3 w-3 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <FileText className="h-3 w-3 mr-2" />
                    View Logs
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Sliders className="h-3 w-3 mr-2" />
                    Reset Layout
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">Debug Mode</Label>
                    <p className="text-xs text-gray-500">Enable detailed error reporting</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </MainLayout>
  )
}
