"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Target,
  Menu,
  Bell,
  Search as SearchIcon,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Users
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GlobalSearch } from "@/components/search/global-search"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [bellShake, setBellShake] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  // Handle hydration
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Load unread notifications count
  const loadUnreadCount = () => {
    try {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      const unread = notifications.filter((n: any) => !n.is_read).length
      setUnreadCount(unread)
    } catch {
      setUnreadCount(0)
    }
  }

  // Listen for new notifications
  useEffect(() => {
    loadUnreadCount()
    
    const handleNewNotification = () => {
      setBellShake(true)
      loadUnreadCount()
      setTimeout(() => setBellShake(false), 1000)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('newNotification', handleNewNotification)
      window.addEventListener('storage', loadUnreadCount)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('newNotification', handleNewNotification)
        window.removeEventListener('storage', loadUnreadCount)
      }
    }
  }, [])

  const handleLogout = () => {
    router.push("/")
  }

  const ThemeToggle = () => {
    if (!mounted) return null

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="hover-lift">
            {theme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : theme === "light" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Monitor className="mr-2 h-4 w-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center justify-between px-3 sm:px-4">
        {/* Left side - Logo and mobile menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 px-3 py-3 border-b">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="text-base font-bold">Commitly</span>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start h-9 text-sm">
                      <Target className="h-4 w-4 mr-2" /> Dashboard
                    </Button>
                  </Link>
                  <Link href="/goals">
                    <Button variant="ghost" className="w-full justify-start h-9 text-sm">
                      <Target className="h-4 w-4 mr-2" /> Goals
                    </Button>
                  </Link>
                  <Link href="/partners">
                    <Button variant="ghost" className="w-full justify-start h-9 text-sm">
                      <Users className="h-4 w-4 mr-2" /> Partners
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full justify-start h-9 text-sm">
                      <User className="h-4 w-4 mr-2" /> Profile
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="ghost" className="w-full justify-start h-9 text-sm">
                      <Settings className="h-4 w-4 mr-2" /> Settings
                    </Button>
                  </Link>
                </nav>
                <div className="border-t p-2">
                  {/* Theme toggle at bottom */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Theme</span>
                    </div>
                    <div>
                      <ThemeToggle />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-2" onClick={() => router.push('/') }>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 hover-lift">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-75" />
              <div className="relative bg-background rounded-lg p-1 border">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Commitly
            </span>
          </Link>
        </div>

        {/* Center - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 sm:mx-8">
          <GlobalSearch className="w-full" />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search */}
          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <SearchIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="p-4">
              <GlobalSearch className="w-full" />
            </SheetContent>
          </Sheet>

          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="hover-lift relative" onClick={loadUnreadCount}>
              <Bell className={`h-5 w-5 transition-transform duration-200 ${bellShake ? 'animate-bounce' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Theme toggle (desktop) */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-lift">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    JD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john.doe@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
