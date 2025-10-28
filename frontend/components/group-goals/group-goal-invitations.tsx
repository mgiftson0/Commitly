"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, Users, Clock, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import {
  getPendingInvitations,
  acceptGroupGoalInvitation,
  declineGroupGoalInvitation,
  type GroupGoalInvitation
} from "@/lib/group-goals"

export function GroupGoalInvitations() {
  const [invitations, setInvitations] = useState<GroupGoalInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    setLoading(true)
    const result = await getPendingInvitations()
    if (result.success && result.data) {
      setInvitations(result.data as any)
    }
    setLoading(false)
  }

  const handleAccept = async (invitationId: string) => {
    setProcessingId(invitationId)
    const result = await acceptGroupGoalInvitation(invitationId)
    
    if (result.success) {
      toast.success("Invitation accepted! You're now part of the group goal.")
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
    } else {
      toast.error("Failed to accept invitation. Please try again.")
    }
    setProcessingId(null)
  }

  const handleDecline = async (invitationId: string) => {
    setProcessingId(invitationId)
    const result = await declineGroupGoalInvitation(invitationId)
    
    if (result.success) {
      toast.success("Invitation declined.")
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
    } else {
      toast.error("Failed to decline invitation. Please try again.")
    }
    setProcessingId(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-pulse">Loading invitations...</div>
        </CardContent>
      </Card>
    )
  }

  if (invitations.length === 0) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Group Goal Invitations</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {invitations.length} pending
          </Badge>
        </div>
        <CardDescription>
          You've been invited to join collaborative goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {invitations.map((invitation) => (
          <Card key={invitation.id} className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 mt-1">
                  <AvatarImage src={invitation.inviter?.profile_picture_url} />
                  <AvatarFallback>
                    {invitation.inviter?.first_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {invitation.inviter?.first_name} {invitation.inviter?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{invitation.inviter?.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">
                      {invitation.goal?.title}
                    </p>
                    {invitation.goal?.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {invitation.goal.description}
                      </p>
                    )}
                  </div>

                  {invitation.message && (
                    <div className="mb-3 p-2 rounded bg-slate-100 dark:bg-slate-800">
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        "{invitation.message}"
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(invitation.id)}
                      disabled={processingId === invitation.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDecline(invitation.id)}
                      disabled={processingId === invitation.id}
                      className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
