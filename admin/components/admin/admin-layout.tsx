"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Users,
  Settings,
  BarChart3,
  FileText,
  Lock,
  Activity,
  Bell,
  Menu,
  X,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const adminNavItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: BarChart3,
      description: "System overview and metrics"
    },
    {
      name: "User Management",
      href: "/users",
      icon: Users,
      description: "Manage all users and permissions"
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: Activity,
      description: "Detailed system analytics"
    },
    {
      name: "Content",
      href: "/content",
      icon: FileText,
      description: "Content and media management"
    },
    {
      name: "Security",
      href: "/security",
      icon: Lock,
      description: "Security and access control"
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      description: "System configuration"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
              <Badge variant="destructive" className="text-xs">SUPER ADMIN</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Live</Badge>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-transform duration-300 ease-in-out
          mt-[57px] lg:mt-0
        `}>
          <div className="flex h-full flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Control</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Full system access</p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <div className={`
                      flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}>
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className={`text-xs truncate ${isActive ? 'text-red-100' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Admin Access Level: SUPER
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden mt-[57px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
