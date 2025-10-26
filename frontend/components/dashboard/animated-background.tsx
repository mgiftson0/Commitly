"use client"

import { useEffect, useState } from "react"

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-700" />

      {/* Animated orbs */}
      <div className="absolute inset-0">
        {/* Large floating orb - top right */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl animate-pulse"
             style={{ animation: 'float 8s ease-in-out infinite' }} />

        {/* Medium floating orb - bottom left */}
        <div className="absolute bottom-32 left-16 w-80 h-80 bg-gradient-to-r from-emerald-400/15 to-teal-400/15 dark:from-emerald-500/8 dark:to-teal-500/8 rounded-full blur-3xl animate-pulse"
             style={{ animation: 'float 10s ease-in-out infinite reverse' }} />

        {/* Small floating orb - center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-400/10 to-orange-400/10 dark:from-pink-500/5 dark:to-orange-500/5 rounded-full blur-3xl animate-pulse"
             style={{ animation: 'float 12s ease-in-out infinite' }} />

        {/* Extra small orbs for depth */}
        <div className="absolute top-40 left-40 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-full blur-2xl animate-pulse"
             style={{ animation: 'float 6s ease-in-out infinite reverse' }} />

        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-gradient-to-r from-violet-400/15 to-purple-400/15 dark:from-violet-500/8 dark:to-purple-500/8 rounded-full blur-2xl animate-pulse"
             style={{ animation: 'float 9s ease-in-out infinite' }} />
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.15)_1px,_transparent_0)] bg-[length:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.05)_1px,_transparent_0)]" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(2deg);
          }
          66% {
            transform: translateY(10px) rotate(-2deg);
          }
        }
      `}</style>
    </div>
  )
}
