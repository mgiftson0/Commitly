"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Heart, Zap, Trophy, Flame, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { encouragementSystem } from "@/lib/encouragement-system"

interface EncouragementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  partnerId: string
  partnerName: string
  goalId?: string
}

export function EncouragementModal({
  open,
  onOpenChange,
  partnerId,
  partnerName,
  goalId
}: EncouragementModalProps) {
  const [message, setMessage] = useState("")
  const [selectedType, setSelectedType] = useState<'general' | 'cheer' | 'milestone' | 'streak' | 'comeback'>('general')
  const [loading, setLoading] = useState(false)

  const encouragementTypes = [
    { type: 'general' as const, label: 'General', icon: Heart },
    { type: 'cheer' as const, label: 'Cheer', icon: Zap },
    { type: 'milestone' as const, label: 'Milestone', icon: Trophy },
    { type: 'streak' as const, label: 'Streak', icon: Flame },
    { type: 'comeback' as const, label: 'Comeback', icon: MessageCircle }
  ]

  const suggestions = encouragementSystem.generateSuggestions({
    type: selectedType,
    partnerName
  })

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message")
      return
    }

    setLoading(true)
    try {
      await encouragementSystem.sendEncouragement(partnerId, message.trim(), selectedType, goalId)
      toast.success(`Encouragement sent to ${partnerName}!`)
      setMessage("")
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to send encouragement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Encouragement to {partnerName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="flex flex-wrap gap-2">
              {encouragementTypes.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="h-8"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick suggestions</label>
            <div className="space-y-1">
              {suggestions.slice(0, 3).map((suggestion, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-auto p-2 text-left text-xs"
                  onClick={() => setMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your message</label>
            <Textarea
              placeholder="Write your encouragement..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="flex-1"
            >
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}