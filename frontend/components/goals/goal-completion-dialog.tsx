"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Trophy, 
  Sparkles, 
  PartyPopper, 
  Star,
  Loader2
} from "lucide-react"

interface GoalCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reflection?: string) => Promise<void>
  goalTitle: string
  goalType: string
  loading?: boolean
}

export function GoalCompletionDialog({
  open,
  onOpenChange,
  onConfirm,
  goalTitle,
  goalType,
  loading = false
}: GoalCompletionDialogProps) {
  const [reflection, setReflection] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm(reflection)
      setReflection("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCompletionMessage = () => {
    const messages = {
      'recurring': "You're about to mark this recurring goal as complete! This will end the recurrence cycle.",
      'multi-activity': "All activities completed! Ready to mark this goal as achieved?",
      'single-activity': "You're about to complete this goal! This action cannot be undone.",
      'default': "Ready to mark this goal as complete?"
    }
    return messages[goalType as keyof typeof messages] || messages.default
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/40 dark:to-teal-950/40 border-2 border-emerald-300/50 dark:border-emerald-700/50">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />
        
        {/* Floating Icons Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Trophy className="absolute top-4 right-8 h-6 w-6 text-emerald-400 animate-bounce opacity-40" />
          <Sparkles className="absolute top-12 left-12 h-5 w-5 text-yellow-400 animate-pulse opacity-30" />
          <Star className="absolute bottom-12 right-12 h-4 w-4 text-amber-400 animate-spin-slow opacity-30" />
          <PartyPopper className="absolute bottom-8 left-8 h-6 w-6 text-pink-400 animate-bounce opacity-40" />
        </div>

        <DialogHeader className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-full">
                <Trophy className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Complete Goal? 🎉
          </DialogTitle>
          
          <DialogDescription className="text-center text-base pt-2">
            <span className="font-semibold text-emerald-700 dark:text-emerald-300 block mb-2">
              &quot;{goalTitle}&quot;
            </span>
            <span className="text-muted-foreground">
              {getCompletionMessage()}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reflection" className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Add a reflection (optional)
            </Label>
            <Textarea
              id="reflection"
              placeholder="What did you learn? How do you feel about completing this goal?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[100px] resize-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
              disabled={isSubmitting || loading}
            />
            <p className="text-xs text-muted-foreground">
              Your reflection will be saved with your completed goal
            </p>
          </div>

          {/* Stats Preview */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-800/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion will:</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Mark goal as completed
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Update your progress stats
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Notify accountability partners
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Unlock achievement badges
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="relative z-10 flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || loading}
            className="w-full sm:w-auto border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || loading}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/60 transition-all duration-300"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4" />
                Confirm Completion
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
