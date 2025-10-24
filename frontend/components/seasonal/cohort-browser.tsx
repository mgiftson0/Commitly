"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, Target } from 'lucide-react'
import { cohortsApi, SeasonalCohort } from '@/lib/cohorts-api'

interface CohortBrowserProps {
  durationType: 'annual' | 'quarterly' | 'biannual'
  onJoinCohort?: (cohortId: string) => void
}

export function CohortBrowser({ durationType, onJoinCohort }: CohortBrowserProps) {
  const [cohorts, setCohorts] = useState<SeasonalCohort[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCohorts()
  }, [durationType])

  const loadCohorts = async () => {
    try {
      const data = await cohortsApi.getCohorts(durationType)
      setCohorts(data)
    } catch (error) {
      console.error('Failed to load cohorts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDurationLabel = (cohort: SeasonalCohort) => {
    if (cohort.duration_type === 'quarterly') {
      return `Q${cohort.quarter} ${cohort.year}`
    }
    if (cohort.duration_type === 'biannual') {
      return `${cohort.period} ${cohort.year}`
    }
    return cohort.year.toString()
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded"></div>)}
    </div>
  }

  if (cohorts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No Active Cohorts</h3>
          <p className="text-muted-foreground text-sm">
            Be the first to create a {durationType} cohort for community accountability
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {cohorts.map((cohort) => (
        <Card key={cohort.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{cohort.name}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  {getDurationLabel(cohort)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{cohort.current_members}/{cohort.max_members}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{cohort.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{durationType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{cohort.current_members} members</span>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => onJoinCohort?.(cohort.id)}
                disabled={cohort.current_members >= cohort.max_members}
              >
                {cohort.current_members >= cohort.max_members ? 'Full' : 'Join Cohort'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}