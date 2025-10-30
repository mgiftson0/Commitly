"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, authHelpers } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"

export interface UserSettings {
  // Profile settings
  displayName: string
  username: string
  email: string
  bio: string
  location: string
  website: string
  profilePictureUrl?: string

  // Notification settings
  emailNotifications: boolean
  pushNotifications: boolean
  goalReminders: boolean
  achievementAlerts: boolean
  partnerMessages: boolean
  weeklyReports: boolean
  marketingEmails: boolean

  // Privacy settings
  profileVisibility: string
  showGoals: boolean
  showAchievements: boolean
  showActivity: boolean
  allowMessages: boolean
  allowPartnerRequests: boolean

  // App settings
  theme: string
  language: string
  timezone: string
  dateFormat: string
  timeFormat: string

  // Goal settings
  defaultGoalVisibility: string
  autoReminders: boolean
  reminderTime: string
  weeklyReview: boolean
  reviewDay: string
}

export interface ProfileData {
  id: string
  first_name?: string
  last_name?: string
  profile_picture_url?: string
  username?: string
  phone_number?: string
  bio?: string
  location?: string
  website?: string
  email?: string
  gender?: string
  date_of_birth?: string
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    displayName: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    profilePictureUrl: "",

    emailNotifications: true,
    pushNotifications: true,
    goalReminders: true,
    achievementAlerts: true,
    partnerMessages: true,
    weeklyReports: false,
    marketingEmails: false,

    profileVisibility: "public",
    showGoals: true,
    showAchievements: true,
    showActivity: true,
    allowMessages: true,
    allowPartnerRequests: true,

    theme: "system",
    language: "en",
    timezone: "America/Los_Angeles",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",

    defaultGoalVisibility: "private",
    autoReminders: true,
    reminderTime: "09:00",
    weeklyReview: true,
    reviewDay: "sunday"
  })

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Load settings from Supabase
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      // Load user preferences (if we had a preferences table)
      // For now, we'll use localStorage with fallbacks to profile data
      if (profileData) {
        setProfile(profileData)
        setSettings(prev => ({
          ...prev,
          displayName: profileData.first_name && profileData.last_name
            ? `${profileData.first_name} ${profileData.last_name}`
            : profileData.username || prev.displayName,
          username: profileData.username || prev.username,
          email: user.email || prev.email,
          bio: profileData.bio || prev.bio,
          location: profileData.location || prev.location,
          website: profileData.website || prev.website,
          profilePictureUrl: profileData.profile_picture_url || prev.profilePictureUrl,
        }))
      }

      // Load user preferences from localStorage (client-side settings)
      if (typeof window !== 'undefined') {
        const storedSettings = {
          emailNotifications: localStorage.getItem('emailNotifications') !== 'false',
          pushNotifications: localStorage.getItem('pushNotifications') !== 'false',
          goalReminders: localStorage.getItem('goalReminders') !== 'false',
          achievementAlerts: localStorage.getItem('achievementAlerts') !== 'false',
          partnerMessages: localStorage.getItem('partnerMessages') !== 'false',
          weeklyReports: localStorage.getItem('weeklyReports') === 'true',
          marketingEmails: localStorage.getItem('marketingEmails') === 'true',
          theme: localStorage.getItem('theme') || 'system',
          language: localStorage.getItem('language') || 'en',
          timezone: localStorage.getItem('timezone') || 'America/Los_Angeles',
          dateFormat: localStorage.getItem('dateFormat') || 'MM/DD/YYYY',
          timeFormat: localStorage.getItem('timeFormat') || '12h',
          defaultGoalVisibility: localStorage.getItem('defaultGoalVisibility') || 'private',
          autoReminders: localStorage.getItem('autoReminders') !== 'false',
          reminderTime: localStorage.getItem('reminderTime') || '09:00',
          weeklyReview: localStorage.getItem('weeklyReview') !== 'false',
          reviewDay: localStorage.getItem('reviewDay') || 'sunday'
        }

        setSettings(prev => ({ ...prev, ...storedSettings }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Save settings to Supabase and localStorage
  const saveSettings = useCallback(async (updatedSettings: Partial<UserSettings>) => {
    try {
      setSaving(true)
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save settings.",
          variant: "destructive",
        })
        return
      }

      // Update local settings state
      setSettings(prev => ({ ...prev, ...updatedSettings }))

      // Save profile settings to Supabase
      const profileUpdates: any = {}

      if (updatedSettings.displayName !== undefined || updatedSettings.username !== undefined) {
        // Handle display name parsing
        if (updatedSettings.displayName) {
          const nameParts = updatedSettings.displayName.trim().split(' ')
          profileUpdates.first_name = nameParts[0] || profile?.first_name
          profileUpdates.last_name = nameParts.slice(1).join(' ') || profile?.last_name
        }
        if (updatedSettings.username !== undefined) {
          profileUpdates.username = updatedSettings.username
        }
      }

      if (updatedSettings.bio !== undefined) profileUpdates.bio = updatedSettings.bio
      if (updatedSettings.location !== undefined) profileUpdates.location = updatedSettings.location
      if (updatedSettings.website !== undefined) profileUpdates.website = updatedSettings.website

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            ...profileUpdates,
            updated_at: new Date().toISOString()
          })

        if (profileError) throw profileError

        // Update local profile state
        setProfile(prev => prev ? { ...prev, ...profileUpdates } : null)
      }

      // Save client-side settings to localStorage
      const clientSettings = [
        'emailNotifications', 'pushNotifications', 'goalReminders', 'achievementAlerts',
        'partnerMessages', 'weeklyReports', 'marketingEmails', 'theme', 'language',
        'timezone', 'dateFormat', 'timeFormat', 'defaultGoalVisibility', 'autoReminders',
        'reminderTime', 'weeklyReview', 'reviewDay'
      ]

      clientSettings.forEach(setting => {
        if (updatedSettings[setting as keyof UserSettings] !== undefined) {
          const value = updatedSettings[setting as keyof UserSettings]
          localStorage.setItem(setting, String(value))
        }
      })

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }, [toast])

  // Update profile picture
  const updateProfilePicture = useCallback(async (file: File) => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/profile.${fileExt}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      // Update profile with new URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_picture_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Update local state
      setSettings(prev => ({ ...prev, profilePictureUrl: publicUrl }))
      setProfile(prev => prev ? { ...prev, profile_picture_url: publicUrl } : null)

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating profile picture:', error)
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    profile,
    loading,
    saving,
    loadSettings,
    saveSettings,
    updateProfilePicture,
  }
}
