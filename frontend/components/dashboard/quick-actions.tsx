import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Target, Award, Zap } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card className="hover-lift h-[200px] sm:h-[220px] flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-blue-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:gap-3 flex-1">
        <Link href="/goals/create">
          <div className="aspect-square p-2 sm:p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-105 cursor-pointer shadow-lg overflow-hidden">
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-white/20 rounded-full mb-2">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-xs font-bold leading-tight">CREATE</div>
              <div className="text-[10px] opacity-90 font-medium">New Goal</div>
            </div>
          </div>
        </Link>
        <Link href="/partners/find">
          <div className="aspect-square p-2 sm:p-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all hover:scale-105 cursor-pointer shadow-lg overflow-hidden">
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-white/20 rounded-full mb-2">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-xs font-bold leading-tight">PARTNERS</div>
              <div className="text-[10px] opacity-90 font-medium">Find Help</div>
            </div>
          </div>
        </Link>
        <Link href="/goals">
          <div className="aspect-square p-2 sm:p-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all hover:scale-105 cursor-pointer shadow-lg overflow-hidden">
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-white/20 rounded-full mb-2">
                <Target className="h-6 w-6" />
              </div>
              <div className="text-xs font-bold leading-tight">BROWSE</div>
              <div className="text-[10px] opacity-90 font-medium">All Goals</div>
            </div>
          </div>
        </Link>
        <Link href="/achievements">
          <div className="aspect-square p-2 sm:p-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-all hover:scale-105 cursor-pointer shadow-lg overflow-hidden">
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-white/20 rounded-full mb-2">
                <Award className="h-6 w-6" />
              </div>
              <div className="text-xs font-bold leading-tight">AWARDS</div>
              <div className="text-[10px] opacity-90 font-medium">Badges</div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
