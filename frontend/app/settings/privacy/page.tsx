"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, Users, Globe, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  goalVisibility: 'public' | 'private' | 'friends'
  showStreaks: boolean
  showAchievements: boolean
  showProgress: boolean
  allowPartnerRequests: boolean
  showOnlineStatus: boolean
  dataCollection: boolean
  analytics: boolean
  notifications: boolean
}

export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    goalVisibility: 'private',
    showStreaks: true,
    showAchievements: true,
    showProgress: true,
    allowPartnerRequests: true,
    showOnlineStatus: true,
    dataCollection: true,
    analytics: false,
    notifications: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('privacySettings')
      if (stored) {
        setSettings(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error)
    }
    setLoading(false)
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      localStorage.setItem('privacySettings', JSON.stringify(settings))
      
      // Update user profile with new visibility settings
      const profiles = JSON.parse(localStorage.getItem('userProfiles') || '[]')
      const currentUserId = 'mock-user-id'
      const profileIndex = profiles.findIndex((p: any) => p.id === currentUserId)
      
      if (profileIndex !== -1) {
        profiles[profileIndex].visibility = {
          profileVisibility: settings.profileVisibility,
          showStreaks: settings.showStreaks,
          showAchievements: settings.showAchievements,
          showProgress: settings.showProgress,
          showFollowers: settings.allowPartnerRequests, // Use partner requests as followers visibility
          showFollowing: settings.showOnlineStatus, // Use online status as following visibility
          showGoals: true // Always show goals, filtered by individual goal visibility
        }
        localStorage.setItem('userProfiles', JSON.stringify(profiles))
      }
      
      // Update KYC data
      const kycData = localStorage.getItem('kycData')
      if (kycData) {
        const profile = JSON.parse(kycData)
        profile.profileVisibility = settings.profileVisibility
        localStorage.setItem('kycData', JSON.stringify(profile))
      }
      
      // Update goal visibility for existing goals
      const goals = JSON.parse(localStorage.getItem('goals') || '[]')
      if (settings.goalVisibility !== 'public') {
        goals.forEach((goal: any) => {
          if (goal.visibility === 'public') {
            goal.visibility = settings.goalVisibility === 'friends' ? 'restricted' : settings.goalVisibility
          }
        })
        localStorage.setItem('goals', JSON.stringify(goals))
        window.dispatchEvent(new CustomEvent('goalUpdated'))
      }
      
      toast.success('Privacy settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save privacy settings')
    }
    setSaving(false)
  }

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Shield className="h-12 w-12 text-blue-600 animate-pulse" />
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
            <h1 className="text-2xl font-bold">Privacy & Visibility</h1>
            <p className="text-muted-foreground">Control who can see your information and activities</p>
          </div>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* Profile Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Profile Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select value={settings.profileVisibility} onValueChange={(value: 'public' | 'private' | 'friends') => updateSetting('profileVisibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Public - Anyone can see your profile
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Friends Only - Only your partners can see
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Private - Only you can see
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Streaks</Label>
                    <p className="text-sm text-muted-foreground">Display your streak information on your profile</p>
                  </div>
                  <Switch
                    checked={settings.showStreaks}
                    onCheckedChange={(checked) => updateSetting('showStreaks', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Achievements</Label>
                    <p className="text-sm text-muted-foreground">Display your badges and achievements</p>
                  </div>
                  <Switch
                    checked={settings.showAchievements}
                    onCheckedChange={(checked) => updateSetting('showAchievements', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Progress</Label>
                    <p className="text-sm text-muted-foreground">Display your goal completion statistics</p>
                  </div>
                  <Switch
                    checked={settings.showProgress}
                    onCheckedChange={(checked) => updateSetting('showProgress', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goal Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Goal Privacy
              </CardTitle>
              <CardDescription>
                Set default visibility for your goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Goal Visibility</Label>
                <Select value={settings.goalVisibility} onValueChange={(value: 'public' | 'private' | 'friends') => updateSetting('goalVisibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Public - Anyone can see your goals
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Partners Only - Only accountability partners
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Private - Only you can see
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This will be the default visibility for new goals. You can change individual goal visibility when creating them.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Social Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Social Settings
              </CardTitle>
              <CardDescription>
                Control social interactions and partner requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Partner Requests</Label>
                  <p className="text-sm text-muted-foreground">Let others send you accountability partner requests</p>
                </div>
                <Switch
                  checked={settings.allowPartnerRequests}
                  onCheckedChange={(checked) => updateSetting('allowPartnerRequests', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Online Status</Label>
                  <p className="text-sm text-muted-foreground">Let partners see when you are active</p>
                </div>
                <Switch
                  checked={settings.showOnlineStatus}
                  onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Privacy Settings'}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}