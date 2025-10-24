"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Users,
  Target,
  FileText,
  UserPlus,
  UserCheck,
  UserX,
  MapPin,
  Calendar,
  Star,
  Heart,
  BookOpen,
  Briefcase,
  Filter
} from "lucide-react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { authHelpers, supabase } from "@/lib/supabase-client"
import { toast } from "sonner"

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("all")
  const [users, setUsers] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [followStates, setFollowStates] = useState<Record<string, 'none' | 'pending' | 'following' | 'followers'>>({})

  useEffect(() => {
    const loadCurrentUser = async () => {
      const user = await authHelpers.getCurrentUser()
      setCurrentUser(user)
    }
    loadCurrentUser()
  }, [])

  const performSearch = async () => {
    if (!searchTerm.trim() || !currentUser) return
    
    setLoading(true)
    try {
      // Search users
      if (searchType === "all" || searchType === "users") {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', currentUser.id)
          .eq('has_completed_kyc', true)
          .or(`username.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
          .limit(20)

        setUsers(usersData || [])

        // Load follow states for found users
        if (usersData?.length) {
          const userIds = usersData.map(u => u.id)
          const { data: followData } = await supabase
            .from('accountability_partners')
            .select('user_id, partner_id, status')
            .or(`and(user_id.eq.${currentUser.id},partner_id.in.(${userIds.join(',')})),and(user_id.in.(${userIds.join(',')}),partner_id.eq.${currentUser.id})`)

          const states: Record<string, 'none' | 'pending' | 'following' | 'followers'> = {}
          userIds.forEach(id => { states[id] = 'none' })
          
          followData?.forEach(f => {
            if (f.user_id === currentUser.id) {
              states[f.partner_id] = f.status === 'accepted' ? 'following' : 'pending'
            } else {
              states[f.user_id] = f.status === 'accepted' ? 'following' : 'followers'
            }
          })
          
          setFollowStates(states)
        }
      }

      // Search goals
      if (searchType === "all" || searchType === "goals") {
        const { data: goalsData } = await supabase
          .from('goals')
          .select(`
            *,
            profiles!goals_user_id_fkey(username, first_name, last_name, profile_picture_url)
          `)
          .eq('is_public', true)
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
          .limit(20)

        setGoals(goalsData || [])
      }

      // Search templates (mock for now)
      if (searchType === "all" || searchType === "templates") {
        const mockTemplates = [
          {
            id: 1,
            title: "30-Day Fitness Challenge",
            description: "Complete workout routine for beginners",
            category: "health-fitness",
            uses: 1250,
            rating: 4.8,
            author: "FitnessGuru"
          },
          {
            id: 2,
            title: "Learn Spanish in 90 Days",
            description: "Structured language learning program",
            category: "learning",
            uses: 890,
            rating: 4.6,
            author: "LanguageMaster"
          }
        ].filter(t => 
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        
        setTemplates(mockTemplates)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFollowAction = async (userId: string, userName: string, action: 'follow' | 'unfollow' | 'accept' | 'decline') => {
    try {
      if (action === 'follow') {
        // Check if both users exist in profiles table
        const { data: userExists } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single()

        const { data: currentUserExists } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', currentUser.id)
          .single()

        if (!userExists || !currentUserExists) {
          toast.error('User profile not found')
          return
        }

        const { error } = await supabase
          .from('accountability_partners')
          .insert({
            user_id: currentUser.id,
            partner_id: userId,
            status: 'pending'
          })

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            toast.error('Request already sent')
          } else {
            throw error
          }
          return
        }

        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'New Follow Request',
            message: `Someone wants to follow you!`,
            type: 'partner_request',
            read: false,
            data: { sender_id: currentUser.id }
          })

        setFollowStates(prev => ({ ...prev, [userId]: 'pending' }))
        toast.success(`Follow request sent to ${userName}!`)
      }
      // Add other actions as needed
    } catch (error: any) {
      console.error('Follow action error:', error)
      toast.error(error.message || 'Action failed')
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch()
      } else {
        setUsers([])
        setGoals([])
        setTemplates([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchType, currentUser])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health-fitness': return Heart
      case 'learning': return BookOpen
      case 'career': return Briefcase
      case 'personal': return Star
      default: return Target
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Search</h1>
          <p className="text-muted-foreground">Find users, goals, and templates</p>
        </div>

        {/* Search Controls */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for anything..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="goals">Goals</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Searching...</p>
          </div>
        )}

        {/* Results */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>
            <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserResults users={users} followStates={followStates} onFollowAction={handleFollowAction} />
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <GoalResults goals={goals} />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <TemplateResults templates={templates} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

function UserResults({ users, followStates, onFollowAction }: {
  users: any[]
  followStates: Record<string, 'none' | 'pending' | 'following' | 'followers'>
  onFollowAction: (userId: string, userName: string, action: 'follow' | 'unfollow' | 'accept' | 'decline') => void
}) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No users found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {users.map((user) => {
        const followState = followStates[user.id] || 'none'
        const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
        
        return (
          <Card key={user.id} className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profile_picture_url} />
                  <AvatarFallback className="text-lg">
                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold truncate">{userName}</h3>
                      <p className="text-muted-foreground">@{user.username}</p>
                      
                      {user.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          {user.location}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/profile/${user.username}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                      
                      {followState === 'none' && (
                        <Button 
                          size="sm"
                          onClick={() => onFollowAction(user.id, userName, 'follow')}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </Button>
                      )}
                      
                      {followState === 'pending' && (
                        <Button size="sm" variant="outline" disabled>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Pending
                        </Button>
                      )}
                      
                      {followState === 'following' && (
                        <Button size="sm" variant="outline">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Following
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {user.bio && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                  
                  {user.interests && user.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {user.interests.slice(0, 5).map((interest: string) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function GoalResults({ goals }: { goals: any[] }) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No goals found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => {
        const Icon = getCategoryIcon(goal.category)
        const isSeasonalGoal = goal.is_seasonal || goal.duration_type === 'seasonal'
        const ownerName = goal.profiles ? `${goal.profiles.first_name || ''} ${goal.profiles.last_name || ''}`.trim() || goal.profiles.username : 'Unknown'
        
        return (
          <Card key={goal.id} className={`hover-lift ${
            isSeasonalGoal 
              ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30' 
              : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    isSeasonalGoal 
                      ? 'bg-amber-100 dark:bg-amber-900/30' 
                      : 'bg-primary/10'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      isSeasonalGoal 
                        ? 'text-amber-600 dark:text-amber-400' 
                        : 'text-primary'
                    }`} />
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {goal.category}
                    </Badge>
                    {isSeasonalGoal && (
                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 ml-1">
                        <Star className="h-3 w-3 mr-1" />
                        Seasonal
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <CardTitle className="text-lg line-clamp-2">{goal.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {goal.description}
              </p>
              
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={goal.profiles?.profile_picture_url} />
                  <AvatarFallback className="text-xs">
                    {goal.profiles?.first_name?.charAt(0)}{goal.profiles?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">by {ownerName}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">{goal.progress || 0}%</span>
                  <span className="text-muted-foreground"> complete</span>
                </div>
                <Link href={`/goals/${goal.id}`}>
                  <Button size="sm" variant="outline">
                    View Goal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function TemplateResults({ templates }: { templates: any[] }) {
  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No templates found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id} className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg">{template.title}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {template.description}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">by {template.author}</span>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{template.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {template.uses} uses
              </span>
              <Button size="sm">
                Use Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'health-fitness': return Heart
    case 'learning': return BookOpen
    case 'career': return Briefcase
    case 'personal': return Star
    default: return Target
  }
}