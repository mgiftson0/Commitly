"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { authHelpers, supabase } from "@/lib/supabase-client"

export default function FollowingPage() {
  const [following, setFollowing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadFollowing = async () => {
      try {
        const user = await authHelpers.getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data } = await supabase
          .from('follows')
          .select('following_profile:profiles!follows_following_id_fkey(*)')
          .eq('follower_id', user.id)
          .eq('status', 'accepted')

        setFollowing(data?.map(f => f.following_profile) || [])
      } catch (error) {
        console.error('Error loading following:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFollowing()
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
            <h1 className="text-xl font-bold">Following</h1>
            <p className="text-sm text-muted-foreground">{following.length} following</p>
          </div>
        </div>

        <div className="space-y-0">
          {following.map((user) => (
            <Link key={user.id} href={`/profile/${user.username}`}>
              <div className="border-b hover:bg-muted/50 transition-colors p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profile_picture_url} />
                    <AvatarFallback>
                      {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    {user.bio && (
                      <p className="text-sm mt-1 line-clamp-2">{user.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {following.length === 0 && (
          <div className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Not following anyone yet</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}