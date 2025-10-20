"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Heart, Send } from "lucide-react"
import { toast } from "sonner"
import { notifications } from "@/lib/notifications"

interface EncouragementMessage {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  timestamp: string
}

// Mock store functions for frontend-only mode
const addEncouragement = (goalId: string | number, content: string, authorName: string) => {
  const key = `encouragements-${goalId}`
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  existing.push({ id: Date.now().toString(), content, authorName, timestamp: Date.now() })
  localStorage.setItem(key, JSON.stringify(existing))
}

const getEncouragements = (goalId: string | number) => {
  const key = `encouragements-${goalId}`
  return JSON.parse(localStorage.getItem(key) || '[]')
}

type StoreEncouragementMessage = { id: string; content: string; authorName: string; timestamp: number }

interface EncouragementCardProps {
  isPartner?: boolean
  goalOwnerName?: string
  goalId?: string | number
  onSendEncouragement?: (message: string) => void
  messages?: EncouragementMessage[]
  newMessageCount?: number
  compact?: boolean
}

export function EncouragementCard({
  isPartner = false,
  goalOwnerName = "Goal Owner",
  goalId,
  onSendEncouragement,
  messages = [],
  newMessageCount = 0,
  compact = false
}: EncouragementCardProps) {
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [storeMessages, setStoreMessages] = useState<EncouragementMessage[]>([])

  const loadMessages = () => {
    if (messages && messages.length > 0) return
    if (goalId !== undefined) {
      const raw = getEncouragements(goalId) as StoreEncouragementMessage[]
      setStoreMessages(raw.map(m => ({ id: m.id, author: { name: m.authorName, avatar: "/placeholder-avatar.jpg" }, content: m.content, timestamp: new Date(m.timestamp).toLocaleString() })))
    }
  }

  React.useEffect(() => {
    loadMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId])

  const handleSendEncouragement = async () => {
    if (!note.trim()) return

    setIsSubmitting(true)
    try {
      if (onSendEncouragement) {
        await onSendEncouragement(note)
      } else if (goalId !== undefined) {
        addEncouragement(goalId, note.trim(), 'You')
        const raw = getEncouragements(goalId) as StoreEncouragementMessage[]
        setStoreMessages(raw.map(m => ({ id: m.id, author: { name: m.authorName, avatar: "/placeholder-avatar.jpg" }, content: m.content, timestamp: new Date(m.timestamp).toLocaleString() })))
      }
      toast.success(`Encouragement sent to ${goalOwnerName}! ??`)
      if (isPartner && goalOwnerName) {
        await notifications.encouragementReceived('You', goalOwnerName)
      }
      setNote("")
    } catch (error) {
      toast.error("Failed to send encouragement")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Use real messages only
  const displayMessages = (messages && messages.length > 0) ? messages : storeMessages

  if (compact && isPartner) {
    return (
      <div className="space-y-3">
        <Textarea
          placeholder={`Send an encouraging message to ${goalOwnerName}...`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="focus-ring resize-none"
        />
        <Button 
          onClick={handleSendEncouragement}
          disabled={!note.trim() || isSubmitting} 
          className="hover-lift w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Sending..." : "Send Encouragement"}
        </Button>
      </div>
    )
  }

  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {isPartner ? "Send Encouragement" : "Encouragement Messages"}
          {/* Show notification badge for goal owner if there are new messages */}
          {!isPartner && newMessageCount > 0 && (
            <Badge variant="default" className="ml-auto">
              <MessageCircle className="h-3 w-3 mr-1" />
              {newMessageCount} New
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isPartner 
            ? `Send an encouraging message to ${goalOwnerName}` 
            : "View encouragement from your accountability partners"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Partner View - Send encouragement - Single Container */}
        {isPartner ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  placeholder={`Send an encouraging message to ${goalOwnerName}...`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className={`focus-ring resize-none ${isPartner ? 'w-full' : ''}`}
                />
              </div>
              <Button
                onClick={handleSendEncouragement}
                disabled={!note.trim() || isSubmitting}
                className="hover-lift self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Your message will help motivate {goalOwnerName} to keep going! ??
            </p>
          </div>
        ) : (
          /* Owner View - Add notes and view encouragements */
          <>
            <div className="space-y-3">
              <Textarea
                placeholder="Add a note about your progress, challenges, or wins..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="focus-ring resize-none"
              />
              <Button 
                onClick={handleSendEncouragement}
                disabled={!note.trim() || isSubmitting} 
                className="hover-lift"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>

            {/* Messages Section */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Recent Messages</p>
                <Badge variant="outline" className="text-xs">
                  <Heart className="h-3 w-3 mr-1 text-red-500" />
                  From Partners
                </Badge>
              </div>

              {displayMessages.map((message) => (
                <div key={message.id} className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.author.avatar} />
                    <AvatarFallback>{message.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{message.author.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {message.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {displayMessages.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No encouragement messages yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your accountability partners can send you motivational messages
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
