"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Pause, Play, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase-client"

interface SuspendResumeDialogProps {
  goalId: string
  goalTitle: string
  isSuspended: boolean
  onStatusChange: () => void
}

export function SuspendResumeDialog({ goalId, goalTitle, isSuspended, onStatusChange }: SuspendResumeDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    setLoading(true)
    try {
      const newStatus = isSuspended ? 'active' : 'paused'
      
      const { error } = await supabase
        .from('goals')
        .update({ 
          status: newStatus,
          is_suspended: !isSuspended,
          suspension_reason: isSuspended ? null : reason
        })
        .eq('id', goalId)

      if (error) throw error

      toast.success(isSuspended ? 'Goal resumed successfully!' : 'Goal suspended successfully!')
      onStatusChange()
      setOpen(false)
      setReason("")
    } catch (error: any) {
      toast.error(error.message || 'Failed to update goal status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {isSuspended ? (
            <>
              <Play className="h-4 w-4 mr-2" />
              Resume Goal
            </>
          ) : (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Suspend Goal
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuspended ? (
              <>
                <Play className="h-5 w-5 text-green-600" />
                Resume Goal
              </>
            ) : (
              <>
                <Pause className="h-5 w-5 text-yellow-600" />
                Suspend Goal
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium text-sm">{goalTitle}</p>
          </div>
          
          {isSuspended ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <Play className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800 dark:text-green-200">Resume this goal</p>
                  <p className="text-green-700 dark:text-green-300">Your goal will become active again and you can continue tracking progress.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Suspend this goal</p>
                  <p className="text-yellow-700 dark:text-yellow-300">Your goal will be paused and won't affect your streaks or progress tracking.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium">
                  Reason for suspension (optional)
                </Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Taking a break, focusing on other priorities..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleAction} 
              disabled={loading}
              className="flex-1"
              variant={isSuspended ? "default" : "secondary"}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {isSuspended ? 'Resuming...' : 'Suspending...'}
                </div>
              ) : (
                isSuspended ? 'Resume Goal' : 'Suspend Goal'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}