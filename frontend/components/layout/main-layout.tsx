"use client"

import { useEffect } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { notifications } from "@/lib/notifications"
import { dueDateChecker } from "@/lib/due-date-checker"
import { UserProvider } from "@/lib/user-context"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  useEffect(() => {
    notifications.init()
    dueDateChecker.start()
    
    return () => {
      dueDateChecker.stop()
    }
  }, [])

  return (
    <UserProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar - Hidden on mobile, shown on md+ */}
        <aside className="hidden md:block">
          <Sidebar />
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 animate-fade-in text-[13.5px] sm:text-[14.5px] md:text-base leading-tight sm:leading-relaxed">
              {children}
            </div>
          </main>
        </div>
      </div>
    </UserProvider>
  )
}
