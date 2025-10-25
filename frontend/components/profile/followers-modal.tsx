"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, UserCheck, MessageCircle } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase-client"
import { toast } from "sonner"

interface FollowersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  initialTab?: 'followers' | 'following'
}

interface UserProfile {
  id: string
  username: string
  first_name: string
  last_name: string
  profile_picture_url?: string
  bio?: string
  followers_count: number
  following_count: number
}

export function FollowersModal({ open, onOpenChange, userId, initialTab = 'followers' }: FollowersModalProps) {
  const [followers, setFollowers] = useState<UserProfile[]>([])
  const [following, setFollowing] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, userId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Load followers
      const { data: followersData } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles!follows_follower_id_fkey(*)
        `)
        .eq('following_id', userId)
        .eq('status', 'accepted')

      if (followersData) {
        setFollowers(followersData.map(f => f.profiles).filter(Boolean))
      }

      // Load following
      const { data: followingData } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey(*)
        `)
        .eq('follower_id', userId)
        .eq('status', 'accepted')

      if (followingData) {
        setFollowing(followingData.map(f => f.profiles).filter(Boolean))
      }
    } catch (error) {
      console.error('Error loading follow data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const UserCard = ({ user }: { user: UserProfile }) => (
    <div className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg">
      <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profile_picture_url} />
          <AvatarFallback>
            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            @{user.username}
          </p>
          {user.bio && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {user.bio}
            </p>
          )}
        </div>
      </Link>
      
      {currentUser && currentUser.id !== user.id && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] p-0">
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
        
        <DialogHeader className="px-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connections
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={initialTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-6">
            <TabsTrigger value="followers">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({following.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="followers" className="h-full mt-0">
              <div className="h-96 overflow-y-auto px-6 pb-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : followers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No followers yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {followers.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="following" className="h-full mt-0">
              <div className="h-96 overflow-y-auto px-6 pb-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : following.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Not following anyone yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {following.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}