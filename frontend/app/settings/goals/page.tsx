"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Target, Flame, Bell, Clock, ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

interface GoalSettings {
  defaultVisibility: 'public' | 'private' | 'restricted'
  defaultCategory: string
  streakThreshold: number
  groupStreakThreshold: number
  overallStreakQuota: number
  reminderTime: string
  weekendReminders: boolean
  streakNotifications: boolean
  milestoneNotifications: boolean
  atRiskNotifications: boolean
  autoSuspendDays: number
  gracePeriodHours: number
}

export default function GoalSettingsPage() {
  const [settings, setSettings] = useState<GoalSettings>({
    defaultVisibility: 'private',
    defaultCategory: 'personal',
    streakThreshold: 60,
    groupStreakThreshold: 60,
    overallStreakQuota: 50,
    reminderTime: '22:00',
    weekendReminders: false,
    streakNotifications: true,
    milestoneNotifications: true,
    atRiskNotifications: true,
    autoSuspendDays: 7,
    gracePeriodHours: 24
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('goalSettings')
      if (stored) {
        setSettings(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load goal settings:', error)
    }
    setLoading(false)
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      localStorage.setItem('goalSettings', JSON.stringify(settings))
      
      // Update streak system settings
      const streakSettings = {
        multiActivityThreshold: settings.streakThreshold / 100,
        overallStreakQuota: settings.overallStreakQuota / 100,
        groupStreakThreshold: settings.groupStreakThreshold / 100,
        gracePeriodHours: settings.gracePeriodHours
      }
      localStorage.setItem('streakSettings', JSON.stringify(streakSettings))
      
      toast.success('Goal settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save goal settings')
    }
    setSaving(false)
  }

  const updateSetting = (key: keyof GoalSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Target className="h-12 w-12 text-blue-600 animate-pulse" />
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Goal Settings</h1>
            <p className="text-muted-foreground">Customize your goal creation and tracking preferences</p>
          </div>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* Default Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Default Goal Settings
              </CardTitle>
              <CardDescription>
                Set default values for new goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Visibility</Label>
                  <Select value={settings.defaultVisibility} onValueChange={(value: 'public' | 'private' | 'restricted') => updateSetting('defaultVisibility', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="restricted">Partners Only</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Category</Label>
                  <Select value={settings.defaultCategory} onValueChange={(value) => updateSetting('defaultCategory', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health-fitness">Health & Fitness</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Streak Configuration
              </CardTitle>
              <CardDescription>
                Customize how streaks are calculated and maintained
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Multi-Activity Streak Threshold: {settings.streakThreshold}%</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Percentage of activities needed to maintain streak for multi-activity goals
                  </p>
                  <Slider
                    value={[settings.streakThreshold]}
                    onValueChange={([value]) => updateSetting('streakThreshold', value)}
                    max={100}
                    min={1}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label>Group Streak Threshold: {settings.groupStreakThreshold}%</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Percentage of group members needed to maintain group streak
                  </p>
                  <Slider
                    value={[settings.groupStreakThreshold]}
                    onValueChange={([value]) => updateSetting('groupStreakThreshold', value)}
                    max={100}
                    min={1}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label>Overall Streak Quota: {settings.overallStreakQuota}%</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Percentage of active goals needed to maintain overall streak
                  </p>
                  <Slider
                    value={[settings.overallStreakQuota]}
                    onValueChange={([value]) => updateSetting('overallStreakQuota', value)}
                    max={100}
                    min={1}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label>Grace Period: {settings.gracePeriodHours} hours</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Extra time allowed before breaking a streak
                  </p>
                  <Slider
                    value={[settings.gracePeriodHours]}
                    onValueChange={([value]) => updateSetting('gracePeriodHours', value)}
                    max={48}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control when and how you receive goal-related notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Daily Reminder Time</Label>
                  <Input
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => updateSetting('reminderTime', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Time to receive daily goal reminders
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Auto-Suspend After: {settings.autoSuspendDays} days</Label>
                  <Slider
                    value={[settings.autoSuspendDays]}
                    onValueChange={([value]) => updateSetting('autoSuspendDays', value)}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Automatically suspend goals after inactivity
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekend Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send reminders on weekends</p>
                  </div>
                  <Switch
                    checked={settings.weekendReminders}
                    onCheckedChange={(checked) => updateSetting('weekendReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Streak Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when streaks start/end</p>
                  </div>
                  <Switch
                    checked={settings.streakNotifications}
                    onCheckedChange={(checked) => updateSetting('streakNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Milestone Notifications</Label>
                    <p className="text-sm text-muted-foreground">Celebrate streak milestones (7, 30, 100 days)</p>
                  </div>
                  <Switch
                    checked={settings.milestoneNotifications}
                    onCheckedChange={(checked) => updateSetting('milestoneNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>At-Risk Notifications</Label>
                    <p className="text-sm text-muted-foreground">Warn when streaks are about to break</p>
                  </div>
                  <Switch
                    checked={settings.atRiskNotifications}
                    onCheckedChange={(checked) => updateSetting('atRiskNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Goal Settings'}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}