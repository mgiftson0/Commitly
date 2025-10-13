"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Target className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Tell us a bit about yourself</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                required
                pattern="[a-z0-9_]+"
                minLength={3}
              />
              <p className="text-xs text-slate-500">Lowercase letters, numbers, and underscores only (min 3 characters)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                pattern="[\+]?[0-9]{10,15}"
              />
              <p className="text-xs text-slate-500">Include country code (e.g., +1234567890)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Profile..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
