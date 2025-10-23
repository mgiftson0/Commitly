"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authHelpers } from "@/lib/supabase-client"

export default function ClearSessionPage() {
  const router = useRouter()

  useEffect(() => {
    const clearSession = async () => {
      try {
        await authHelpers.clearSession()
        router.push('/auth/login')
      } catch (error) {
        console.error('Error clearing session:', error)
        router.push('/auth/login')
      }
    }

    clearSession()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Clearing session...</p>
      </div>
    </div>
  )
}