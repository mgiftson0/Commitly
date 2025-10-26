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

  const UserCard = ({ user }: { user: UserProfile }) => {
    const isCurrentUser = currentUser && currentUser.id === user.id

    return (
      <div className="group hover-lift">
        <div className="flex items-center justify-between p-4 hover:bg-accent/30 rounded-xl transition-all duration-200 border border-transparent hover:border-border/50">
          <Link href={`/profile/${user.username}`} className="flex items-center gap-4 flex-1">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                <AvatarImage src={user.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isCurrentUser && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate text-foreground">
                  {user.first_name} {user.last_name}
                </p>
                {isCurrentUser && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    You
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                @{user.username}
              </p>
              {user.bio && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1 max-w-xs">
                  {user.bio}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {user.followers_count || 0} followers
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck className="h-3 w-3" />
                  {user.following_count || 0} following
                </span>
              </div>
            </div>
          </Link>

          {currentUser && !isCurrentUser && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" size="sm" className="hover-lift">
                <MessageCircle className="h-3 w-3" />
              </Button>
              <Button size="sm" className="hover-lift">
                <UserPlus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] p-0 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-t-lg" />
          <DialogHeader className="px-6 py-4 relative">
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">Connections</span>
            </DialogTitle>
          </DialogHeader>
        </div>

        <Tabs defaultValue={initialTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-6 mb-2 bg-muted/50">
            <TabsTrigger
              value="followers"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              Followers
              <Badge variant="secondary" className="ml-2 text-xs">
                {followers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              Following
              <Badge variant="secondary" className="ml-2 text-xs">
                {following.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="followers" className="h-full mt-0">
              <div className="max-h-96 overflow-y-auto px-6 pb-6 scrollbar-thin">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : followers.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="p-4 rounded-2xl bg-muted/30 inline-block">
                      <Users className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">No followers yet</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Be the first to inspire someone!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {followers.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="following" className="h-full mt-0">
              <div className="max-h-96 overflow-y-auto px-6 pb-6 scrollbar-thin">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : following.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="p-4 rounded-2xl bg-muted/30 inline-block">
                      <UserCheck className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Not following anyone yet</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Discover amazing goal-setters!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
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