"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, Target } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase-client"

interface ActivityCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalId: string
  goalTitle: string
  activities: Array<{
    id: string
    title: string
    completed: boolean
  }>
  onComplete: () => void
}

export function ActivityCompletionDialog({ 
  open, 
  onOpenChange, 
  goalId, 
  goalTitle, 
  activities, 
  onComplete 
}: ActivityCompletionDialogProps) {
  const [checkedActivities, setCheckedActivities] = useState<Set<string>>(
    new Set(activities.filter(a => a.completed).map(a => a.id))
  )
  const [loading, setLoading] = useState(false)

  const handleActivityToggle = (activityId: string) => {
    const newChecked = new Set(checkedActivities)
    if (newChecked.has(activityId)) {
      newChecked.delete(activityId)
    } else {
      newChecked.add(activityId)
    }
    setCheckedActivities(newChecked)
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      // Update activity completion status
      const updates = activities.map(activity => ({
        id: activity.id,
        completed: checkedActivities.has(activity.id)
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('goal_activities')
          .update({ completed: update.completed })
          .eq('id', update.id)

        if (error) throw error
      }

      // Calculate new progress
      const completedCount = checkedActivities.size
      const totalCount = activities.length
      const progress = Math.round((completedCount / totalCount) * 100)

      // Update goal progress
      const { error: goalError } = await supabase
        .from('goals')
        .update({ 
          progress,
          status: progress === 100 ? 'completed' : 'active',
          completed_at: progress === 100 ? new Date().toISOString() : null
        })
        .eq('id', goalId)

      if (goalError) throw goalError

      toast.success('Activities updated successfully!')
      onComplete()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update activities')
    } finally {
      setLoading(false)
    }
  }

  const completedCount = checkedActivities.size
  const totalCount = activities.length
  const progress = Math.round((completedCount / totalCount) * 100)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Confirm Activity Completion
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium text-sm">{goalTitle}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {completedCount}/{totalCount} completed
              </Badge>
              <Badge variant={progress === 100 ? "default" : "secondary"}>
                {progress}% progress
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Review your completed activities:</span>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center gap-3 p-2 rounded-lg border hover:bg-accent/50 cursor-pointer"
                  onClick={() => handleActivityToggle(activity.id)}
                >
                  <Checkbox
                    checked={checkedActivities.has(activity.id)}
                    onChange={() => handleActivityToggle(activity.id)}
                  />
                  <span className={`text-sm flex-1 ${
                    checkedActivities.has(activity.id) 
                      ? 'line-through text-muted-foreground' 
                      : ''
                  }`}>
                    {activity.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {progress === 100 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 dark:text-green-200">Goal Complete!</p>
                <p className="text-green-700 dark:text-green-300">All activities are marked as completed. This goal will be marked as finished.</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                'Confirm Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}