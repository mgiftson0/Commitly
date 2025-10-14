"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  ArrowLeft,
  Upload,
  MapPin,
  Link as LinkIcon,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Camera,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Users
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { isMockAuthEnabled, mockDelay } from "@/lib/mock-auth"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

export default function KYCPage() {
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      if (isMockAuthEnabled()) {
        // In mock mode, allow KYC to proceed
        return
      }
      
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign up first")
        router.push("/auth/signup")
        return
      }

      // Check if user profile already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()

      if (existingUser) {
        toast.info("Profile already exists")
        router.push("/dashboard")
      }
    }

    checkAuth()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isMockAuthEnabled()) {
      setLoading(true)
      await mockDelay(1000)
      toast.success("Profile created successfully! (Mock Mode)")
      router.push("/dashboard")
      setLoading(false)
      return
    }
    
    if (!supabase) {
      toast.error("Authentication service is not available")
      return
    }
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Insert user record
      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        username: username.toLowerCase(),
        display_name: displayName,
        phone_number: phoneNumber,
        email: user.email!,
        bio: bio || null,
      })

      if (insertError) {
        console.error("Insert error:", insertError)
        throw insertError
      }

      toast.success("Profile created successfully!")
      router.push("/dashboard")
    } catch (error: unknown) {
      console.error("KYC error:", error)
      const err = error as { code?: string; message?: string }
      if (err.code === "23505") {
        toast.error("Username or phone number already taken")
      } else if (err.message) {
        toast.error(`Database error: ${err.message}`)
      } else {
        toast.error("Failed to create profile. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Additional state for enhanced KYC
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [goalCategories, setGoalCategories] = useState<string[]>([])
  const [profilePicture, setProfilePicture] = useState("")

  // Interest options
  const interestOptions = [
    "Health & Fitness", "Career & Business", "Learning & Education",
    "Personal Growth", "Relationships", "Finance", "Travel",
    "Creative Arts", "Technology", "Sports", "Music", "Reading"
  ]

  // Goal category options
  const categoryOptions = [
    "Health & Fitness", "Career", "Learning", "Personal",
    "Relationships", "Finance", "Travel", "Creative"
  ]

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest))
    } else {
      setInterests([...interests, interest])
    }
  }

  const toggleCategory = (category: string) => {
    if (goalCategories.includes(category)) {
      setGoalCategories(goalCategories.filter(c => c !== category))
    } else {
      setGoalCategories([...goalCategories, category])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-75" />
                <div className="relative bg-white dark:bg-slate-900 rounded-lg p-2 border shadow-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Commitly</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Step 1 of 1
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-2xl">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-full blur opacity-75 animate-pulse" />
                <div className="relative bg-white dark:bg-slate-900 rounded-full p-4 border shadow-2xl">
                  <Target className="h-16 w-16 text-primary" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Welcome to Commitly!
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Let&apos;s set up your profile to personalize your goal-setting experience
            </p>
          </div>

          {/* Form Card */}
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-2xl border-0 shadow-blue-100/50 dark:shadow-slate-900/50">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-base">
                Help us create the best experience for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                      <AvatarImage src={profilePicture} />
                      <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                        {displayName.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full hover-lift shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Profile Picture</p>
                    <p className="text-xs text-muted-foreground">
                      Optional - you can add this later
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="username"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="focus-ring"
                      required
                      pattern="[a-z0-9_]+"
                      minLength={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lowercase letters, numbers, and underscores only (min 3 characters)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Display Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="displayName"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="focus-ring"
                      required
                      minLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="focus-ring"
                      required
                      pattern="[\+]?[0-9\s\-\(\)]{10,15}"
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code (e.g., +1234567890)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="focus-ring"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself, your interests, and what motivates you..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="focus-ring"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {bio.length}/500 characters
                  </p>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="focus-ring"
                  />
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Interests</Label>
                  <p className="text-xs text-muted-foreground">
                    Select topics that interest you (helps us suggest relevant goals and partners)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {interestOptions.map((interest) => (
                      <Button
                        key={interest}
                        type="button"
                        variant={interests.includes(interest) ? "default" : "outline"}
                        size="sm"
                        className="justify-start text-xs h-8 hover-lift"
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Goal Categories */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Goal Categories</Label>
                  <p className="text-xs text-muted-foreground">
                    What types of goals are you most interested in?
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categoryOptions.map((category) => (
                      <Button
                        key={category}
                        type="button"
                        variant={goalCategories.includes(category) ? "default" : "outline"}
                        size="sm"
                        className="justify-start text-xs h-8 hover-lift"
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-semibold hover-lift shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || !username || !displayName || !phoneNumber}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Profile...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Complete Setup & Start Goal Setting!
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          <div className="mt-6">
            <Card className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-0">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Setup Progress</div>
                  <div className="flex justify-center gap-4 text-sm">
                    <div className={`flex items-center gap-1 ${username ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {username ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                      Username
                    </div>
                    <div className={`flex items-center gap-1 ${displayName ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {displayName ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                      Display Name
                    </div>
                    <div className={`flex items-center gap-1 ${phoneNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {phoneNumber ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                      Phone
                    </div>
                  </div>
                  <Progress
                    value={
                      (username ? 25 : 0) +
                      (displayName ? 25 : 0) +
                      (phoneNumber ? 25 : 0) +
                      (interests.length > 0 ? 15 : 0) +
                      (bio ? 10 : 0)
                    }
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              By completing your profile, you&apos;ll get better goal recommendations and can connect with accountability partners
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
