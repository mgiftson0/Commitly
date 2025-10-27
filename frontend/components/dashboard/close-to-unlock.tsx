import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Users } from "lucide-react"

export function CloseToUnlock() {
  return (
    <Card className="hover-lift h-[280px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Close to Unlock
        </CardTitle>
        <CardDescription>
          Achievements you&apos;re close to unlocking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Consistency Champion</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-bold">28/30</span>
              </div>
              <Progress value={93} className="h-1.5 [&>div]:bg-yellow-500" />
            </div>
          </div>

          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Goal Master</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-bold">8/10</span>
              </div>
              <Progress value={80} className="h-1.5 [&>div]:bg-blue-500" />
            </div>
          </div>
        </div>
        <Button variant="ghost" className="w-full mt-3 text-sm">
          View All Achievements
        </Button>
      </CardContent>
    </Card>
  )
}
