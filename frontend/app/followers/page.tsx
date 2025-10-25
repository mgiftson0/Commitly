"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { authHelpers, supabase } from "@/lib/supabase-client"

export default function FollowersPage() {
  const [followers, setFollowers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        const user = await authHelpers.getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data } = await supabase
          .from('follows')
          .select('follower_profile:profiles!follows_follower_id_fkey(*)')
          .eq('following_id', user.id)
          .eq('status', 'accepted')

        setFollowers(data?.map(f => f.follower_profile) || [])
      } catch (error) {
        console.error('Error loading followers:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFollowers()
  }, [router])

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Followers</h1>
            <p className="text-sm text-muted-foreground">{followers.length} followers</p>
          </div>
        </div>

        <div className="space-y-0">
          {followers.map((follower) => (
            <Link key={follower.id} href={`/profile/${follower.username}`}>
              <div className="border-b hover:bg-muted/50 transition-colors p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={follower.profile_picture_url} />
                    <AvatarFallback>
                      {follower.first_name?.charAt(0)}{follower.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {follower.first_name} {follower.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{follower.username}</p>
                    {follower.bio && (
                      <p className="text-sm mt-1 line-clamp-2">{follower.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {followers.length === 0 && (
          <div className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No followers yet</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}