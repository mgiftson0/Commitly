"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Target, Award, Zap } from "lucide-react"
import Link from "next/link"

export function QuickActionsSection() {
  return (
    <Card className="hover-lift h-[420px] w-full flex flex-col hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 shadow-lg transition-all duration-200 border-2 border-green-400/50">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 grid grid-cols-2 gap-3 p-3">
        <Link href="/goals/create" className="block group">
          <div className="h-20 border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 rounded-2xl hover:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-all duration-200 cursor-pointer overflow-hidden">
            <div className="h-full flex flex-col items-center justify-center text-center p-2">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div className="font-bold text-blue-900 dark:text-blue-100 text-xs mb-1">Create</div>
              <div className="text-blue-600 dark:text-blue-300 text-[10px]">New Goal</div>
            </div>
          </div>
        </Link>

        <Link href="/partners/find" className="block group">
          <div className="h-20 border-2 border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800 rounded-2xl hover:border-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-all duration-200 cursor-pointer overflow-hidden">
            <div className="h-full flex flex-col items-center justify-center text-center p-2">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="font-bold text-purple-900 dark:text-purple-100 text-xs mb-1">Partners</div>
              <div className="text-purple-600 dark:text-purple-300 text-[10px]">Find Help</div>
            </div>
          </div>
        </Link>

        <Link href="/goals" className="block group">
          <div className="h-20 border-2 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 rounded-2xl hover:border-green-400 hover:bg-green-100 dark:hover:bg-green-950/40 transition-all duration-200 cursor-pointer overflow-hidden">
            <div className="h-full flex flex-col items-center justify-center text-center p-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div className="font-bold text-green-900 dark:text-green-100 text-xs mb-1">Browse</div>
              <div className="text-green-600 dark:text-green-300 text-[10px]">All Goals</div>
            </div>
          </div>
        </Link>

        <Link href="/achievements" className="block group">
          <div className="h-20 border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 rounded-2xl hover:border-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-all duration-200 cursor-pointer overflow-hidden">
            <div className="h-full flex flex-col items-center justify-center text-center p-2">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div className="font-bold text-orange-900 dark:text-orange-100 text-xs mb-1">Awards</div>
              <div className="text-orange-600 dark:text-orange-300 text-[10px]">Badges</div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
