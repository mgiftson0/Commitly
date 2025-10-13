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
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-full blur opacity-75" />
              <div className="relative bg-background rounded-full p-4 border">
                <Target className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Help us personalize your experience and connect you with the right goals and partners
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 max-w-4xl mx-auto">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Tell us about yourself to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profilePicture} />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                          {displayName.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full hover-lift"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Profile Picture</p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG or GIF. Max size 2MB.
                      </p>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium">
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
                      <Label htmlFor="displayName" className="text-sm font-medium">
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
                      <Label htmlFor="phoneNumber" className="text-sm font-medium">
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
                      <Label htmlFor="location" className="text-sm font-medium">
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
                    <Label htmlFor="bio" className="text-sm font-medium">
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
                    <Label htmlFor="website" className="text-sm font-medium">
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
                    <Label className="text-sm font-medium">Interests</Label>
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
                          className="justify-start text-xs h-8"
                          onClick={() => toggleInterest(interest)}
                        >
                          {interest}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Goal Categories */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Goal Categories</Label>
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
                          className="justify-start text-xs h-8"
                          onClick={() => toggleCategory(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-4">
                    <Button type="submit" className="w-full hover-lift" disabled={loading || !username || !displayName || !phoneNumber}>
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Profile...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Complete Setup
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Sidebar - Progress & Tips */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-lg">Setup Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 text-sm ${username ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {username ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                    Username
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${displayName ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {displayName ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                    Display Name
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${phoneNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {phoneNumber ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                    Phone Number
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${interests.length > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {interests.length > 0 ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                    Interests ({interests.length})
                  </div>
                </div>
                <Progress value={
                  (username ? 20 : 0) +
                  (displayName ? 20 : 0) +
                  (phoneNumber ? 20 : 0) +
                  (interests.length > 0 ? 20 : 0) +
                  (bio ? 10 : 0) +
                  (location ? 10 : 0)
                } className="h-2" />
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-lg">💡 Why This Matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Better goal recommendations based on your interests
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Connect with like-minded people for accountability
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Personalized experience tailored to your goals
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Interests Preview */}
            {interests.length > 0 && (
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle className="text-lg">Your Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
