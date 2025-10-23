"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Target, Users, Award, Bell, X, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase-client"

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

interface GoalData {
  id: string
  title: string
  description?: string
  category?: string
  status?: string
  progress?: number
  streak?: number
}

interface PartnerGoalData extends GoalData {
  ownerName?: string
}

interface AchievementData {
  id: string
  title: string
  description: string
  type: string
  rarity: string
}

interface NotificationData {
  id: string
  title: string
  message: string
}

interface MockUser {
  id: string
  name: string
  avatar: string
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
    // Load recent searches with improved error handling
    const loadRecentSearches = (): void => {
      try {
        const stored = localStorage.getItem('recentSearches')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed)
          }
        }
      } catch (error) {
        console.warn('Failed to load recent searches:', error)
        // Clear corrupted data
        localStorage.removeItem('recentSearches')
      }
    }

    loadRecentSearches()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length > 0) {
        performSearch(query)
      } else {
        setResults([])
      }
    }, 300) // Debounce search by 300ms

    return () => clearTimeout(timeoutId)
  }, [query])

  const performSearch = async (searchQuery: string): Promise<void> => {
    // Early return for very short queries
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    const searchResults: SearchResult[] = []
    const lowerQuery = searchQuery.toLowerCase()

    try {
      // Search users by username, first_name, last_name
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, profile_picture_url')
        .or(`username.ilike.%${lowerQuery}%,first_name.ilike.%${lowerQuery}%,last_name.ilike.%${lowerQuery}%`)
        .limit(5)

      if (users) {
        users.forEach(user => {
          const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
          searchResults.push({
            id: user.id,
            type: 'user',
            title: fullName,
            description: `@${user.username}`,
            avatar: user.profile_picture_url,
            onClick: () => {
              router.push(`/profile/${user.username}`)
              addToRecentSearches(searchQuery)
              setIsOpen(false)
            }
          })
        })
      }

      // Search goals by title and description
      const { data: goals } = await supabase
        .from('goals')
        .select(`
          id, title, description, category, status, progress,
          profiles!goals_user_id_fkey(username, first_name, last_name)
        `)
        .or(`title.ilike.%${lowerQuery}%,description.ilike.%${lowerQuery}%`)
        .eq('visibility', 'public')
        .limit(5)

      if (goals) {
        goals.forEach(goal => {
          const owner = goal.profiles as any
          const ownerName = owner ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || owner.username : 'Unknown'
          
          searchResults.push({
            id: goal.id,
            type: 'goal',
            title: goal.title,
            description: `by ${ownerName}`,
            category: goal.category,
            status: goal.status,
            progress: goal.progress,
            onClick: () => {
              router.push(`/goals/${goal.id}`)
              addToRecentSearches(searchQuery)
              setIsOpen(false)
            }
          })
        })
      }

      // Search notifications for current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: notifications } = await supabase
          .from('notifications')
          .select('id, title, message')
          .eq('user_id', user.id)
          .or(`title.ilike.%${lowerQuery}%,message.ilike.%${lowerQuery}%`)
          .limit(3)

        if (notifications) {
          notifications.forEach(notification => {
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
          })
        }
      }
    } catch (error) {
      console.warn('Error performing search:', error)
    }

    // Sort results by relevance - users first, then goals, then notifications
    searchResults.sort((a, b) => {
      if (a.type === 'user' && b.type !== 'user') return -1
      if (a.type !== 'user' && b.type === 'user') return 1
      if (a.type === 'goal' && b.type !== 'goal') return -1
      if (a.type !== 'goal' && b.type === 'goal') return 1
      return a.title.length - b.title.length
    })

    setResults(searchResults.slice(0, 8))
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
              <div className="p-4 text-center text-muted-foreground" role="status" aria-live="polite">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
                <p className="text-sm mb-2">
                  No results found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Try adjusting your search terms or browse categories
                </p>
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
