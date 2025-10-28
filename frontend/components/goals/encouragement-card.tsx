import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Heart, Send, ThumbsUp, Heart as HeartIcon, HandHeart, Flame } from "lucide-react"
import { toast } from "sonner"
import { supabase, authHelpers } from "@/lib/supabase-client"

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
  const [sentEncouragements, setSentEncouragements] = useState<EncouragementMessage[]>([])
  const [messageReactions, setMessageReactions] = useState<Record<string, string[]>>({})

  const loadMessages = async () => {
    console.log('loadMessages called for goalId:', goalId, 'isPartner:', isPartner)
    if (messages && messages.length > 0) return
    if (goalId !== undefined) {
      const raw = getEncouragements(goalId) as StoreEncouragementMessage[]
      setStoreMessages(raw.map(m => ({ id: m.id, author: { name: m.authorName, avatar: "/placeholder-avatar.jpg" }, content: m.content, timestamp: new Date(m.timestamp).toLocaleString() })))
      
      // Load message reactions
      const reactionsKey = `message_reactions_${goalId}`
      const savedReactions = JSON.parse(localStorage.getItem(reactionsKey) || '{}')
      setMessageReactions(savedReactions)
      
      // Load sent encouragements from local storage for partners
      if (isPartner) {
        const sentKey = `sent_encouragements_${goalId}`
        const sentData = JSON.parse(localStorage.getItem(sentKey) || '[]')
        console.log('Loading sent encouragements:', sentData)
        const sentMessages = sentData.map((item: any) => ({
          id: item.id,
          author: { name: 'You', avatar: '/placeholder-avatar.jpg' },
          content: item.message,
          timestamp: new Date(item.timestamp).toLocaleString()
        }))
        console.log('Processed sent messages:', sentMessages)
        setSentEncouragements(sentMessages)
      }
    }
  }

  useEffect(() => {
    loadMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId])

  const handleSendEncouragement = async () => {
    console.log('handleSendEncouragement called with note:', note)
    if (!note.trim()) {
      console.log('Note is empty, returning')
      return
    }

    console.log('Starting to send encouragement...')
    setIsSubmitting(true)
    let actualOwnerName = goalOwnerName
    try {
      if (onSendEncouragement) {
        await onSendEncouragement(note)
      } else if (goalId !== undefined && isPartner) {
        // Send real notification to goal owner
        const user = await authHelpers.getCurrentUser()
        if (!user) {
          toast.error('Please log in to send encouragement')
          return
        }

        // Get sender profile
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, username')
          .eq('id', user.id)
          .single()

        const senderName = senderProfile?.first_name 
          ? `${senderProfile.first_name} ${senderProfile.last_name || ''}`.trim()
          : senderProfile?.username || 'Someone'

        // Get goal owner ID and profile
        const { data: goal } = await supabase
          .from('goals')
          .select('user_id, title')
          .eq('id', goalId)
          .single()

        if (!goal) {
          toast.error('Goal not found')
          return
        }

        // Get goal owner's name
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, username')
          .eq('id', goal.user_id)
          .single()

        actualOwnerName = ownerProfile?.first_name 
          ? `${ownerProfile.first_name} ${ownerProfile.last_name || ''}`.trim()
          : ownerProfile?.username || 'Goal Owner'

        console.log('Sending encouragement notification to:', goal.user_id)
        console.log('From:', senderName, 'To:', actualOwnerName, 'Message:', note.trim())

        // Send notification to goal owner
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([
            {
              user_id: goal.user_id,
              title: 'Encouragement Received! 💝',
              message: `${senderName} sent you encouragement: "${note.trim()}"`,
              type: 'encouragement_received',
              read: false,
              data: JSON.stringify({ 
                sender_id: user.id,
                sender_name: senderName,
                goal_id: goalId.toString(),
                goal_title: goal.title,
                message: note.trim()
              })
            }
          ])

        if (notificationError) {
          console.error('Notification error:', notificationError)
          throw notificationError
        }

        console.log('Notification sent successfully!')
        console.log('Notification data:', {
          user_id: goal.user_id,
          title: 'Encouragement Received! 💝',
          message: `${senderName} sent you encouragement: "${note.trim()}"`,
          type: 'encouragement_received'
        })

        // Store locally for sender tracking (no database notification needed)
        console.log('Encouragement sent successfully to', actualOwnerName)
        
        // Trigger a refresh of notifications for the goal owner
        window.dispatchEvent(new CustomEvent('notificationSent', { 
          detail: { userId: goal.user_id, type: 'encouragement_received' } 
        }))

        // Store locally for immediate display
        addEncouragement(goalId, note.trim(), senderName)
        
        // Store sent encouragement for sender tracking
        const sentKey = `sent_encouragements_${goalId}`
        const existingSent = JSON.parse(localStorage.getItem(sentKey) || '[]')
        existingSent.push({
          id: Date.now().toString(),
          message: note.trim(),
          timestamp: Date.now(),
          receiver: actualOwnerName
        })
        localStorage.setItem(sentKey, JSON.stringify(existingSent))
        console.log('Stored sent encouragement:', existingSent)
        
        await loadMessages()
      } else if (goalId !== undefined) {
        // Goal owner adding a note
        addEncouragement(goalId, note.trim(), 'You')
        await loadMessages()
      }
      
      toast.success(isPartner ? `Encouragement sent to ${actualOwnerName || goalOwnerName}! 💝` : 'Note added!')
      setNote("")
    } catch (error: any) {
      console.error('Error sending encouragement:', error)
      toast.error(error.message || "Failed to send encouragement")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReaction = (messageId: string, emoji: string) => {
    const reactionsKey = `message_reactions_${goalId}`
    const currentReactions = { ...messageReactions }
    const messageReactionsList = currentReactions[messageId] || []
    
    if (messageReactionsList.includes(emoji)) {
      // Remove reaction
      currentReactions[messageId] = messageReactionsList.filter(r => r !== emoji)
    } else {
      // Add reaction
      currentReactions[messageId] = [...messageReactionsList, emoji]
    }
    
    setMessageReactions(currentReactions)
    localStorage.setItem(reactionsKey, JSON.stringify(currentReactions))
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
    <Card className="hover-lift shadow-lg hover:shadow-xl transition-all duration-200 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5" />
          {isPartner ? "Send Encouragement" : "Encouragement Messages"}
          {/* Show notification badge for goal owner if there are new messages */}
          {!isPartner && newMessageCount > 0 && (
            <Badge variant="default" className="ml-auto bg-green-500 hover:bg-green-600">
              <MessageCircle className="h-3 w-3 mr-1" />
              {newMessageCount} New
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-sm">
          {isPartner 
            ? `Send an encouraging message to ${goalOwnerName}` 
            : "View encouragement from your accountability partners"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {/* Partner View - Send encouragement - Single Container */}
        {isPartner ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  placeholder={`Send an encouraging message to ${goalOwnerName}...`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className={`focus-ring resize-none ${isPartner ? 'w-full' : ''}`}
                />
              </div>
              <Button
                onClick={handleSendEncouragement}
                disabled={!note.trim() || isSubmitting}
                className="hover-lift self-end px-3"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Your message will help motivate {goalOwnerName} to keep going! 💪
            </p>
            
            {/* Show sent encouragements for partners */}
            <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-muted-foreground">Your sent messages ({sentEncouragements.length}):</p>
              {sentEncouragements.length > 0 ? (
                <div className="space-y-2">
                  {sentEncouragements.slice(-3).map((msg) => ( // Only show last 3 messages
                    <div key={msg.id} className="p-2 rounded bg-muted/30 border text-right">
                      <p className="text-xs">"{msg.content}"</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{msg.timestamp}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/60">No messages sent yet</p>
              )}
            </div>
          </div>
        ) : (
          /* Owner View - Add notes and view encouragements */
          <>
            <div className="space-y-3">
              <Textarea
                placeholder="Add a note about your progress, challenges, or wins..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="focus-ring resize-none"
              />
              <Button 
                onClick={handleSendEncouragement}
                disabled={!note.trim() || isSubmitting} 
                className="hover-lift"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>

            {/* Messages Section */}
            <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Recent Messages</p>
                <Badge variant="outline" className="text-xs">
                  <Heart className="h-3 w-3 mr-1 text-red-500" />
                  From Partners
                </Badge>
              </div>

              {/* Chat-like messages container */}
              <div className="space-y-4 max-h-80 overflow-hidden">
                {displayMessages.slice(-5).map((message, index) => { // Only show last 5 messages
                  const isOwnMessage = message.author.name === 'You'
                  const reactions = messageReactions[message.id] || []

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-full duration-500 ${
                        index === 0 ? 'delay-100' : index === 1 ? 'delay-200' : index === 2 ? 'delay-300' : 'delay-500'
                      }`}
                    >
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8 flex-shrink-0 mr-3 mt-1">
                          <AvatarImage src={message.author.avatar} />
                          <AvatarFallback className="text-xs bg-blue-500 text-white">{message.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`max-w-[75%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                        {!isOwnMessage && (
                          <p className="text-xs font-medium text-muted-foreground mb-1 px-1">
                            {message.author.name}
                          </p>
                        )}

                        <div className="relative group">
                          {/* Chat bubble */}
                          <div className={`px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 relative ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-600'
                          }`}>
                            {/* Chat tail */}
                            <div className={`absolute bottom-0 w-0 h-0 ${
                              isOwnMessage
                                ? 'right-0 border-l-[8px] border-l-blue-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
                                : 'left-0 border-r-[8px] border-r-white dark:border-r-gray-700 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
                            }`} />

                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-2 opacity-75 ${isOwnMessage ? 'text-blue-100' : 'text-muted-foreground'}`}>
                              {message.timestamp}
                            </p>
                          </div>

                          {/* Emoji reactions */}
                          <div className={`absolute ${isOwnMessage ? '-left-2' : '-right-2'} -bottom-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm hover:scale-110 transition-transform"
                              onClick={() => handleReaction(message.id, '👍')}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm hover:scale-110 transition-transform"
                              onClick={() => handleReaction(message.id, '❤️')}
                            >
                              <HeartIcon className="h-3 w-3 text-red-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm hover:scale-110 transition-transform"
                              onClick={() => handleReaction(message.id, '🙌')}
                            >
                              <HandHeart className="h-3 w-3 text-purple-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm hover:scale-110 transition-transform"
                              onClick={() => handleReaction(message.id, '🔥')}
                            >
                              <Flame className="h-3 w-3 text-orange-500" />
                            </Button>
                          </div>
                        </div>

                        {/* Display reactions */}
                        {reactions.length > 0 && (
                          <div className={`flex gap-1 mt-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            {reactions.map((reaction, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-2 py-1 shadow-sm animate-in zoom-in duration-300"
                              >
                                {reaction}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {isOwnMessage && (
                        <Avatar className="h-8 w-8 flex-shrink-0 ml-3 mt-1 order-2">
                          <AvatarImage src={message.author.avatar} />
                          <AvatarFallback className="text-xs bg-green-500 text-white">Y</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )
                })}
              </div>

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
