"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Search, UserPlus, X } from "lucide-react"
import { toast } from "sonner"
import { supabase, authHelpers } from "@/lib/supabase-client"

interface GoalPartnerRequestProps {
  goalId: string
  goalTitle: string
}

export function GoalPartnerRequest({ goalId, goalTitle }: GoalPartnerRequestProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, username, profile_picture_url')
        .or(`username.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .limit(5)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error: any) {
      console.error('Search error:', error)
      toast.error('Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async () => {
    if (!selectedPartner) return

    try {
      setLoading(true)
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      // Check if request already exists
      const { data: existingRequest } = await supabase
        .from('goal_partner_requests')
        .select('id, status')
        .eq('goal_id', goalId)
        .eq('requester_id', user.id)
        .eq('partner_id', selectedPartner.id)
        .maybeSingle()

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          toast.error('You already have a pending request with this user')
        } else {
          toast.error('A request already exists with this user')
        }
        return
      }

      // Create partner request
      const { error: requestError } = await supabase
        .from('goal_partner_requests')
        .insert({
          goal_id: goalId,
          requester_id: user.id,
          partner_id: selectedPartner.id,
          status: 'pending',
          message: message || null
        })

      if (requestError) throw requestError

      // Get requester profile for notification
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name, username')
        .eq('id', user.id)
        .single()

      const requesterName = requesterProfile?.first_name
        ? `${requesterProfile.first_name} ${requesterProfile.last_name || ''}`.trim()
        : requesterProfile?.username || 'Someone'

      // Check for existing notification to avoid 409 conflict
      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', selectedPartner.id)
        .eq('type', 'goal_partner_request')
        .eq('data->>goal_id', goalId)
        .eq('data->>requester_id', user.id)
        .maybeSingle()

      if (!existingNotif) {
        await supabase
          .from('notifications')
          .insert({
            user_id: selectedPartner.id,
            title: 'Goal Partner Request',
            message: `${requesterName} wants you as a partner on "${goalTitle}"`,
            type: 'goal_partner_request',
            read: false,
            data: {
              goal_id: goalId,
              requester_id: user.id,
              requester_name: requesterName,
              goal_title: goalTitle,
              message: message || null
            }
          })
      }

      toast.success('Partner request sent!')
      setOpen(false)
      setSelectedPartner(null)
      setMessage("")
      setSearchTerm("")
      setSearchResults([])
    } catch (error: any) {
      console.error('Request error:', error)
      toast.error(error.message || 'Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Partner
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Accountability Partner</DialogTitle>
          <DialogDescription>
            Invite someone to be your partner on this goal
          </DialogDescription>
        </DialogHeader>

        {!selectedPartner ? (
          <div className="space-y-4">
            <div>
              <Label>Search Users</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Search by name or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg border hover:bg-accent cursor-pointer"
                    onClick={() => setSelectedPartner(user)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profile_picture_url} />
                      <AvatarFallback>
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedPartner.profile_picture_url} />
                <AvatarFallback>
                  {selectedPartner.first_name?.[0]}{selectedPartner.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">
                  {selectedPartner.first_name} {selectedPartner.last_name}
                </p>
                <p className="text-sm text-muted-foreground">@{selectedPartner.username}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPartner(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label>Message (Optional)</Label>
              <Textarea
                placeholder="Add a personal message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedPartner(null)}>
                Back
              </Button>
              <Button onClick={handleSendRequest} disabled={loading}>
                <Users className="h-4 w-4 mr-2" />
                Send Request
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
