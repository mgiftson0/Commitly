"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Target, Edit, AlertTriangle } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"

export default function EditGoalPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.id as string

  useEffect(() => {
    // Redirect to update page instead
    router.replace(`/goals/${goalId}/update`)
  }, [goalId, router])

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/goals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Redirecting...</h1>
            <p className="text-sm text-muted-foreground">
              Redirecting to goal update page
            </p>
          </div>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Edit className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Goal Management Update</h2>
            <p className="text-sm text-blue-700 mb-4">
              Goal editing and activity updates have been moved to the Update page for better organization.
            </p>
            <div className="space-y-2 text-xs text-blue-600">
              <p>• Edit goal details within 5 hours of creation</p>
              <p>• Update activities and track progress anytime</p>
              <p>• Confirm completions with review dialog</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}