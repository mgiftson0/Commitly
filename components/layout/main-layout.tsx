"use client"

import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
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
          <div className="container mx-auto px-4 py-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
