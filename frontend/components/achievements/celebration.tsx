"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CelebrationProps {
  show: boolean
  onComplete: () => void
  achievement?: {
    title: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }
}

export function Celebration({ show, onComplete, achievement }: CelebrationProps) {
  const [balloons, setBalloons] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([])

  useEffect(() => {
    if (show) {
      // Create balloons
      const newBalloons = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        color: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'][Math.floor(Math.random() * 6)]
      }))
      setBalloons(newBalloons)

      // Auto-complete after animation
      const timer = setTimeout(onComplete, 4000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600', 
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Balloons */}
      {balloons.map((balloon) => (
        <div
          key={balloon.id}
          className={cn(
            "absolute w-4 h-6 rounded-full animate-bounce",
            balloon.color
          )}
          style={{
            left: `${balloon.x}%`,
            bottom: '-10%',
            animationDelay: `${balloon.delay}s`,
            animationDuration: '3s',
            animationFillMode: 'forwards',
            animationName: 'balloonFloat'
          }}
        />
      ))}

      {/* Achievement notification */}
      <div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg p-6 mx-4 max-w-sm w-full shadow-2xl animate-in zoom-in-50 duration-500">
        <div className="text-center">
          <div className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r flex items-center justify-center",
            achievement ? rarityColors[achievement.rarity] : rarityColors.common
          )}>
            <span className="text-2xl">🏆</span>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Achievement Unlocked!
          </h2>
          
          {achievement && (
            <>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                {achievement.title}
              </h3>
              <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r text-white mb-4"
                   style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                   className={cn(
                     "inline-block px-2 py-1 rounded-full text-xs font-medium text-white mb-4",
                     `bg-gradient-to-r ${rarityColors[achievement.rarity]}`
                   )}>
                {achievement.rarity.toUpperCase()}
              </div>
            </>
          )}
          
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Keep up the great work! 🎉
          </p>
        </div>
      </div>

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes balloonFloat {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}