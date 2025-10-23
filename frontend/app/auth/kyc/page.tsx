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

import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { authHelpers, supabase } from "@/lib/supabase-client"

export default function KYCPage() {
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [gender, setGender] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const router = useRouter()



  // Check username availability with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username.toLowerCase())
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 error

        // If data exists, username is taken; if null, it's available
        setUsernameAvailable(!data);
      } catch (error) {
        console.error('Username check error:', error);
        // On error, assume username might be available (better UX)
        setUsernameAvailable(true);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!username || !displayName || !phoneNumber || !gender || !dateOfBirth) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (usernameAvailable === false) {
      toast.error("Username is not available. Please choose another.");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      toast.error("Username can only contain lowercase letters, numbers, and underscores");
      return;
    }

    if (displayName.length < 2) {
      toast.error("Display name must be at least 2 characters long");
      return;
    }

    if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(phoneNumber)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      const user = await authHelpers.getCurrentUser();
      
      if (!user) {
        toast.error("Please log in again.");
        router.push('/auth/login');
        return;
      }
      
      // Check if username is already taken
      if (usernameAvailable === false) {
        toast.error("Username is not available. Please choose another.");
        return;
      }
      
      // Prepare profile data
      const profileData = {
        id: user.id,
        username: username.toLowerCase(),
        first_name: displayName.split(' ')[0] || displayName,
        last_name: displayName.split(' ').slice(1).join(' ') || '',
        phone_number: phoneNumber,
        gender,
        date_of_birth: dateOfBirth,
        email: user.email,
        bio: bio || null,
        location: location || null,
        website: website || null,
        profile_picture_url: profilePicture || null,
        has_completed_kyc: true
      };
      
      // Insert into profiles table
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error("Profile upsert error:", upsertError);
        
        if (upsertError.code === '23505') {
          if (upsertError.message.includes('username')) {
            toast.error("Username already exists. Please choose a different username.");
          } else {
            toast.error("This information is already in use. Please check your details.");
          }
          return;
        }
        
        throw upsertError;
      }

      toast.success("Profile completed successfully! Welcome to Commitly!");
      
      // Refresh session to ensure cookies are synced before redirect
      await supabase.auth.refreshSession();
      
      // Small delay to ensure session is fully synced
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use router for client-side navigation
      router.push('/dashboard');
    } catch (error) {
      console.error("KYC error:", error);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Additional state for enhanced KYC
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [goalCategories, setGoalCategories] = useState<string[]>([])
  const [profilePicture, setProfilePicture] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)

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

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setUploadingImage(true)
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        toast.error('Authentication error')
        return
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      setProfilePicture(publicUrl)
      toast.success('Profile picture uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-4">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-6">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-75" />
                <div className="relative bg-white dark:bg-slate-900 rounded-lg p-1.5 sm:p-2 border shadow-lg">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Commitly</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Step 1 of 1
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-xl sm:max-w-2xl">
          {/* Welcome Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-5 sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-full blur opacity-75 animate-pulse" />
                <div className="relative bg-white dark:bg-slate-900 rounded-full p-3 sm:p-4 border shadow-2xl">
                  <Target className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Welcome to Commitly!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm sm:max-w-md mx-auto">
              Let&apos;s set up your profile to personalize your goal-setting experience
            </p>
          </div>

          {/* Form Card */}
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-2xl border-0 shadow-blue-100/50 dark:shadow-slate-900/50">
            <CardHeader className="text-center pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-white">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Help us create the best experience for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 sm:border-4 border-primary/20">
                      <AvatarImage src={profilePicture} />
                      <AvatarFallback className="text-lg sm:text-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                        {displayName.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full hover-lift shadow-lg"
                      onClick={() => document.getElementById('profile-picture-input')?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                    <input
                      id="profile-picture-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureUpload}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Profile Picture</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      Optional - you can add this later
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="username"
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className={`focus-ring pr-10 ${
                          username.length >= 3 && usernameAvailable === false ? 'border-red-500' : 
                          username.length >= 3 && usernameAvailable === true ? 'border-green-500' : ''
                        }`}
                        required
                        pattern="[a-z0-9_]+"
                        minLength={3}
                      />
                      {username.length >= 3 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {checkingUsername ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : usernameAvailable === true ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : usernameAvailable === false ? (
                            <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✕</span>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Lowercase letters, numbers, and underscores only (min 3 characters)
                      </p>
                      {username.length >= 3 && (
                        <p className={`text-xs font-medium ${
                          checkingUsername ? 'text-gray-500' :
                          usernameAvailable === true ? 'text-green-600' :
                          usernameAvailable === false ? 'text-red-600' : ''
                        }`}>
                          {checkingUsername ? 'Checking availability...' :
                           usernameAvailable === true ? '✓ Username is available' :
                           usernameAvailable === false ? '✕ Username is already taken' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Display Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="displayName"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                      className="focus-ring"
                      required
                      minLength={2}
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                      Letters and spaces only (2-50 characters)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+\-\s\(\)]/g, ''))}
                      className="focus-ring"
                      required
                      pattern="[\+]?[0-9\s\-\(\)]{10,15}"
                      minLength={10}
                      maxLength={15}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code (e.g., +1234567890) - 10-15 digits
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Gender <span className="text-destructive">*</span>
                    </Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="focus-ring">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date of Birth <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="focus-ring"
                      max={new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 13 years old
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
                    rows={3}
                    className="focus-ring"
                    maxLength={500}
                  />
                  <p className="text-[11px] sm:text-xs text-muted-foreground text-right">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {interestOptions.map((interest) => (
                      <Button
                        key={interest}
                        type="button"
                        variant={interests.includes(interest) ? "default" : "outline"}
                        size="sm"
                        className="justify-start text-[11px] sm:text-xs h-7 sm:h-8 hover-lift"
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categoryOptions.map((category) => (
                      <Button
                        key={category}
                        type="button"
                        variant={goalCategories.includes(category) ? "default" : "outline"}
                        size="sm"
                        className="justify-start text-[11px] sm:text-xs h-7 sm:h-8 hover-lift"
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-3 sm:pt-4">
                  <Button
                    type="submit"
                    className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold hover-lift shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || !username || !displayName || !phoneNumber || !gender || !dateOfBirth || usernameAvailable === false || checkingUsername}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Profile...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="truncate">Complete Setup & Start Goal Setting!</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          <div className="mt-5 sm:mt-6">
            <Card className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-0">
              <CardContent className="p-3 sm:p-4">
                <div className="text-center space-y-2 sm:space-y-3">
                  <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Setup Progress</div>
                  <div className="flex justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className={`flex items-center gap-1 ${username ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {username ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-current" />}
                      Username
                    </div>
                    <div className={`flex items-center gap-1 ${displayName ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {displayName ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-current" />}
                      Display Name
                    </div>
                    <div className={`flex items-center gap-1 ${phoneNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {phoneNumber ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-current" />}
                      Phone
                    </div>
                    <div className={`flex items-center gap-1 ${gender && dateOfBirth ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {gender && dateOfBirth ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-current" />}
                      Details
                    </div>
                  </div>
                  <Progress
                    value={
                      (username ? 20 : 0) +
                      (displayName ? 20 : 0) +
                      (phoneNumber ? 20 : 0) +
                      (gender ? 15 : 0) +
                      (dateOfBirth ? 15 : 0) +
                      (interests.length > 0 ? 10 : 0)
                    }
                    className="h-1.5 sm:h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-muted-foreground">
              By completing your profile, you&apos;ll get better goal recommendations and can connect with accountability partners
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
