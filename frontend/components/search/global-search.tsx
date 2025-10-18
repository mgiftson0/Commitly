"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Target, Users, Award, Bell, X, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  type: 'goal' | 'user' | 'achievement' | 'notification'
  title: string
  description?: string
  category?: string
  avatar?: string
  status?: string
  progress?: number
  streak?: number
  onClick: () => void
}

interface GlobalSearchProps {
  className?: string
  placeholder?: string
}

export function GlobalSearch({ className, placeholder = "Search goals, users, achievements..." }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Load recent searches
    try {
      const stored = localStorage.getItem('recentSearches')
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (query.length > 0) {
      performSearch(query)
    } else {
      setResults([])
    }
  }, [query])

  const performSearch = (searchQuery: string) => {
    const searchResults: SearchResult[] = []
    const lowerQuery = searchQuery.toLowerCase()

    // Search goals
    try {
      const goals = JSON.parse(localStorage.getItem('goals') || '[]')
      goals.forEach((goal: any) => {
        if (
          goal.title.toLowerCase().includes(lowerQuery) ||
          goal.description?.toLowerCase().includes(lowerQuery) ||
          goal.category?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: goal.id,
            type: 'goal',
            title: goal.title,
            description: goal.description,
            category: goal.category,
            status: goal.status,
            progress: goal.progress,
            streak: goal.streak,
            onClick: () => {
              router.push(`/goals/${goal.id}`)
              addToRecentSearches(searchQuery)
              setIsOpen(false)
            }
          })
        }
      })

      // Search partner goals
      const partnerGoals = JSON.parse(localStorage.getItem('partnerGoals') || '[]')
      partnerGoals.forEach((goal: any) => {
        if (
          goal.title.toLowerCase().includes(lowerQuery) ||
          goal.description?.toLowerCase().includes(lowerQuery) ||
          goal.ownerName?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: goal.id,
            type: 'goal',
            title: goal.title,
            description: `Partner goal by ${goal.ownerName}`,
            category: goal.category,
            status: 'partner',
            progress: goal.progress,
            onClick: () => {
              router.push(`/goals/${goal.id}`)
              addToRecentSearches(searchQuery)
              setIsOpen(false)
            }
          })
        }
      })
    } catch {}

    // Search achievements
    try {
      const { ACHIEVEMENTS } = require('@/lib/achievements')
      ACHIEVEMENTS.forEach((achievement: any) => {
        if (
          achievement.title.toLowerCase().includes(lowerQuery) ||
          achievement.description.toLowerCase().includes(lowerQuery) ||
          achievement.type.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: achievement.id,
            type: 'achievement',
            title: achievement.title,
            description: achievement.description,
            category: achievement.rarity,
            onClick: () => {
              router.push('/achievements')
              addToRecentSearches(searchQuery)
              setIsOpen(false)
            }
          })
        }
      })
    } catch {}

    // Search notifications
    try {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      notifications.slice(0, 20).forEach((notification: any) => {
        if (
          notification.title.toLowerCase().includes(lowerQuery) ||
          notification.message.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: notification.id,
            type: 'notification',
            title: notification.title,
            description: notification.message,
            onClick: () => {
              router.push('/notifications')
              addToRecentSearches(searchQuery)
              setIsOpen(false)
            }
          })
        }
      })
    } catch {}

    // Mock users search
    const mockUsers = [
      { id: 'sarah-martinez', name: 'Sarah Martinez', avatar: '/placeholder-avatar.jpg' },
      { id: 'mike-chen', name: 'Mike Chen', avatar: '/placeholder-avatar.jpg' },
      { id: 'alex-johnson', name: 'Alex Johnson', avatar: '/placeholder-avatar.jpg' },
      { id: 'emma-wilson', name: 'Emma Wilson', avatar: '/placeholder-avatar.jpg' }
    ]

    mockUsers.forEach(user => {
      if (user.name.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: user.id,
          type: 'user',
          title: user.name,
          description: 'Accountability partner',
          avatar: user.avatar,
          onClick: () => {
            router.push('/partners')
            addToRecentSearches(searchQuery)
            setIsOpen(false)
          }
        })
      }
    })

    setResults(searchResults.slice(0, 8)) // Limit to 8 results
  }

  const addToRecentSearches = (search: string) => {
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'goal': return Target
      case 'user': return Users
      case 'achievement': return Award
      case 'notification': return Bell
      default: return Search
    }
  }

  const getResultColor = (type: string) => {
    switch (type) {
      case 'goal': return 'text-blue-600'
      case 'user': return 'text-purple-600'
      case 'achievement': return 'text-yellow-600'
      case 'notification': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setQuery("")
              setResults([])
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Results */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
                  <Button variant="ghost" size="sm" onClick={clearRecentSearches} className="h-6 text-xs">
                    Clear
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      className="flex items-center gap-2 w-full p-2 text-left hover:bg-accent rounded text-sm"
                      onClick={() => {
                        setQuery(search)
                        inputRef.current?.focus()
                      }}
                    >
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query.length > 0 && results.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results found for "{query}"</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </div>
                <div className="space-y-1">
                  {results.map((result) => {
                    const Icon = getResultIcon(result.type)
                    return (
                      <button
                        key={result.id}
                        className="flex items-center gap-3 w-full p-2 text-left hover:bg-accent rounded transition-colors"
                        onClick={result.onClick}
                      >
                        {result.type === 'user' ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={result.avatar} />
                            <AvatarFallback className="text-xs">
                              {result.title.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className={`p-2 rounded-full bg-muted`}>
                            <Icon className={`h-4 w-4 ${getResultColor(result.type)}`} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{result.title}</span>
                            {result.status && (
                              <Badge variant="outline" className="text-xs">
                                {result.status}
                              </Badge>
                            )}
                            {result.progress !== undefined && (
                              <Badge variant="secondary" className="text-xs">
                                {result.progress}%
                              </Badge>
                            )}
                          </div>
                          {result.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {result.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {result.type}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}