"use client"

import { useEffect, useState } from "react"
import { authHelpers, supabase } from "@/lib/supabase-client"

export default function DebugSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [profileInfo, setProfileInfo] = useState<any>(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authHelpers.getSession()
        setSessionInfo({
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          emailConfirmed: session?.user?.email_confirmed_at,
        })

        if (session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()

          setProfileInfo({
            hasProfile: !!profile,
            hasCompletedKyc: profile?.has_completed_kyc,
            username: profile?.username,
            error: error?.message
          })
        }
      } catch (error: any) {
        setSessionInfo({ error: error.message })
      }
    }

    checkSession()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-bold">Session Info:</h2>
          <pre className="text-sm">{JSON.stringify(sessionInfo, null, 2)}</pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-bold">Profile Info:</h2>
          <pre className="text-sm">{JSON.stringify(profileInfo, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}