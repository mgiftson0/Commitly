"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock } from "lucide-react"
import { toast } from "sonner"
import { supabase, authHelpers } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

interface GoalPartnerRequestCardProps {
  request: {
    id: string
    goal_id: string
    requester_id: string
    status: 'pending' | 'accepted' | 'declined'
    message?: string
    created_at: string
    goal?: {
      title: string
    }
    requester?: {
      first_name: string
      last_name: string
      username: string
      profile_picture_url?: string
    }
  }
  onUpdate?: () => void
}

export function GoalPartnerRequestCard({ request, onUpdate }: GoalPartnerRequestCardProps) {
  const router = useRouter()

  const handleResponse = async (action: 'accept' | 'decline') => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      // Update request status
      const { error: updateError } = await supabase
        .from('goal_partner_requests')
        .update({
          status: action === 'accept' ? 'accepted' : 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (updateError) throw updateError

      if (action === 'accept') {
        // Create goal partnership
        const { error: partnerError } = await supabase
          .from('goal_partners')
          .insert({
            goal_id: request.goal_id,
            user_id: request.requester_id,
            partner_id: user.id,
            role: 'partner',
            can_view_activities: true,
            can_edit: false
          })

        if (partnerError) {
          console.error('Partner creation error:', partnerError)
          // Don't throw - request was still accepted
        }

        // Get acceptor profile for notification
        const { data: acceptorProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, username')
          .eq('id', user.id)
          .single()

        const acceptorName = acceptorProfile?.first_name
          ? `${acceptorProfile.first_name} ${acceptorProfile.last_name || ''}`.trim()
          : acceptorProfile?.username || 'Someone'

        // Check for existing notification
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', request.requester_id)
          .eq('type', 'goal_partner_accepted')
          .eq('data->>goal_id', request.goal_id)
          .maybeSingle()

        if (!existingNotif) {
          await supabase
            .from('notifications')
            .insert({
              user_id: request.requester_id,
              title: 'Partner Request Accepted!',
              message: `${acceptorName} accepted your request for "${request.goal?.title}"`,
              type: 'goal_partner_accepted',
              read: false,
              data: {
                goal_id: request.goal_id,
                partner_id: user.id,
                partner_name: acceptorName
              }
            })
        }

        toast.success('Partner request accepted!')
      } else {
        toast.success('Partner request declined')
      }

      onUpdate?.()
    } catch (error: any) {
      console.error('Response error:', error)
      toast.error(error.message || 'Failed to respond to request')
    }
  }

  const getStatusBadge = () => {
    switch (request.status) {
      case 'accepted':
        return <Badge className="bg-green-600"><Check className="h-3 w-3 mr-1" /> Accepted</Badge>
      case 'declined':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Declined</Badge>
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={request.requester?.profile_picture_url} />
            <AvatarFallback>
              {request.requester?.first_name?.[0]}{request.requester?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="font-medium text-sm">
                  {request.requester?.first_name} {request.requester?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{request.requester?.username}
                </p>
              </div>
              {getStatusBadge()}
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              Wants to be your partner on: <span className="font-medium text-foreground">{request.goal?.title}</span>
            </p>

            {request.message && (
              <p className="text-sm bg-muted/50 p-2 rounded mb-2 italic">
                &ldquo;{request.message}&rdquo;
              </p>
            )}

            <p className="text-xs text-muted-foreground mb-3">
              {new Date(request.created_at).toLocaleDateString()}
            </p>

            {request.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResponse('decline')}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleResponse('accept')}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
              </div>
            )}

            {request.status !== 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/goals/${request.goal_id}`)}
                className="w-full"
              >
                View Goal
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
