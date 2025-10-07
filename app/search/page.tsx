"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Target, ArrowLeft, Search, UserPlus } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient, type User } from "@/lib/supabase"
import { toast } from "sonner"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%`)
        .limit(20)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error: any) {
      toast.error("Search failed")
    } finally {
      setLoading(false)
    }
  }

  const sendAccountabilityRequest = async (partnerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("accountability_partners")
        .insert({
          requester_id: user.id,
          partner_id: partnerId,
          status: "pending",
        })

      if (error) throw error

      // Create notification for partner
      await supabase.from("notifications").insert({
        user_id: partnerId,
        title: "Accountability Request",
        message: "Someone wants to be your accountability partner!",
        notification_type: "accountability_request",
        related_user_id: user.id,
      })

      toast.success("Request sent!")
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Request already sent")
      } else {
        toast.error("Failed to send request")
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Target className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Search Users</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Find Accountability Partners</CardTitle>
            <CardDescription>
              Search by username, display name, or phone number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold mb-4">
              {searchResults.length} {searchResults.length === 1 ? "result" : "results"} found
            </h2>
            {searchResults.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profile_picture_url} />
                        <AvatarFallback>
                          {user.display_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.display_name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendAccountabilityRequest(user.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Partner
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No users found matching "{searchQuery}"
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
