"use client"

import { useState } from "react"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("users").insert({
        id: user.id,
        username,
        display_name: displayName,
        phone_number: phoneNumber,
        email: user.email!,
        bio: bio || null,
      })

      if (error) throw error

      toast.success("Profile created successfully!")
      router.push("/dashboard")
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Username or phone number already taken")
      } else {
        toast.error(error.message || "Failed to create profile")
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
              />
              <p className="text-xs text-slate-500">Lowercase letters, numbers, and underscores only</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
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
