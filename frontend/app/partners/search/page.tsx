"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, UserPlus, ArrowLeft, MapPin } from "lucide-react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { authHelpers, supabase } from "@/lib/supabase-client"
import { toast } from "sonner"

export default function SearchPartnersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const loadCurrentUser = async () => {
      const user = await authHelpers.getCurrentUser()
      setCurrentUser(user)
    }
    loadCurrentUser()
  }, [])

  const searchUsers = async () => {
    if (!searchTerm.trim() || !currentUser) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.id)
        .eq('has_completed_kyc', true)
        .or(`username.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .limit(20)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const sendFollowRequest = async (partnerId: string, partnerName: string) => {
    try {
      const { data: existing } = await supabase
        .from('accountability_partners')
        .select('id, status')
        .or(`and(user_id.eq.${currentUser.id},partner_id.eq.${partnerId}),and(user_id.eq.${partnerId},partner_id.eq.${currentUser.id})`)
        .maybeSingle()

      if (existing) {
        toast.error(existing.status === 'pending' ? 'Request already sent' : 'Already partners')
        return
      }

      const { error } = await supabase
        .from('accountability_partners')
        .insert({
          user_id: currentUser.id,
          partner_id: partnerId,
          status: 'pending',
          message: `Hi! I'd like to be accountability partners with you.`
        })

      if (error) throw error

      await supabase
        .from('notifications')
        .insert({
          user_id: partnerId,
          title: 'New Partner Request',
          message: `Someone wants to be your accountability partner!`,
          type: 'partner_request',
          read: false,
          data: { sender_id: currentUser.id }
        })

      toast.success(`Request sent to ${partnerName}!`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to send request')
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsers()
      } else {
        setUsers([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, currentUser])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/partners">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Search Partners</h1>
            <p className="text-muted-foreground">Find accountability partners</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by username or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Searching...</p>
          </div>
        )}

        {users.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <Card key={user.id} className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
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
                      {user.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {user.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {user.bio && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  <Button
                    onClick={() => sendFollowRequest(user.id, `${user.first_name} ${user.last_name}`)}
                    className="w-full"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchTerm && !loading && users.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}