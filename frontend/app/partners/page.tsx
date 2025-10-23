"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Plus,
  Search,
  UserPlus,
  UserCheck,
  MessageCircle,
  Target,
  Award,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  MoreHorizontal,
  Send,
  Zap
} from "lucide-react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { authHelpers, supabase } from "@/lib/supabase-client"
import { EncouragementModal } from "@/components/encouragement/encouragement-modal"
import { contactSync } from "@/lib/contact-sync"

// Mock data for partners
const mockPartners = [
  {
    id: 1,
    name: "Sarah Martinez",
    username: "sarah_m",
    avatar: "/placeholder-avatar.jpg",
    bio: "Fitness enthusiast and goal crusher! Let's motivate each other ??",
    location: "San Francisco, CA",
    joinedAt: "2024-01-15",
    status: "active",
    sharedGoals: 3,
    successRate: 92,
    streak: 15,
    lastActive: "2 hours ago",
    compatibility: 95,
    badges: ["Fitness Fanatic", "Consistency King", "Motivator"]
  },
  {
    id: 2,
    name: "Mike Chen",
    username: "mike_c",
    avatar: "/placeholder-avatar.jpg",
    bio: "Software engineer passionate about continuous learning and career growth",
    location: "Seattle, WA",
    joinedAt: "2024-02-01",
    status: "active",
    sharedGoals: 2,
    successRate: 88,
    streak: 8,
    lastActive: "1 day ago",
    compatibility: 87,
    badges: ["Career Climber", "Tech Guru"]
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    username: "emily_r",
    avatar: "/placeholder-avatar.jpg",
    bio: "Student and aspiring writer. Love setting reading and writing goals!",
    location: "Austin, TX",
    joinedAt: "2024-01-20",
    status: "pending",
    sharedGoals: 1,
    successRate: 95,
    streak: 22,
    lastActive: "5 minutes ago",
    compatibility: 91,
    badges: ["Bookworm", "Creative Spirit"]
  }
]

const mockRequests = [
  {
    id: 1,
    name: "Alex Thompson",
    username: "alex_t",
    avatar: "/placeholder-avatar.jpg",
    message: "Hey! I saw your fitness goals and would love to be accountability partners. I'm also working on building a consistent workout routine!",
    sharedInterests: ["Fitness", "Health", "Morning Routines"],
    sentAt: "2 hours ago",
    compatibility: 89
  },
  {
    id: 2,
    name: "Jessica Liu",
    username: "jessica_l",
    avatar: "/placeholder-avatar.jpg",
    message: "Hi! I'm a fellow reader and noticed your reading streak goals. Would love to connect and share book recommendations!",
    sharedInterests: ["Reading", "Learning", "Personal Growth"],
    sentAt: "1 day ago",
    compatibility: 94
  }
]

const mockDiscover = [
  {
    id: 1,
    name: "David Kim",
    username: "david_k",
    avatar: "/placeholder-avatar.jpg",
    bio: "Entrepreneur building healthy habits while scaling my business",
    location: "Los Angeles, CA",
    sharedGoals: ["Exercise", "Meditation", "Reading"],
    compatibility: 92,
    mutualConnections: 3,
    badges: ["Entrepreneur", "Wellness Warrior"]
  },
  {
    id: 2,
    name: "Rachel Green",
    username: "rachel_g",
    avatar: "/placeholder-avatar.jpg",
    bio: "Digital nomad passionate about fitness and sustainable living",
    location: "Remote",
    sharedGoals: ["Fitness", "Travel", "Environment"],
    compatibility: 88,
    mutualConnections: 1,
    badges: ["Digital Nomad", "Eco-Friendly"]
  },
  {
    id: 3,
    name: "Tom Wilson",
    username: "tom_w",
    avatar: "/placeholder-avatar.jpg",
    bio: "Father of two, focusing on work-life balance and family goals",
    location: "Denver, CO",
    sharedGoals: ["Family Time", "Career", "Health"],
    compatibility: 85,
    mutualConnections: 0,
    badges: ["Family Man", "Balance Seeker"]
  }
]

export default function PartnersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [partners, setPartners] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [discover, setDiscover] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [encouragementModal, setEncouragementModal] = useState<{open: boolean, partnerId: string, partnerName: string}>({open: false, partnerId: '', partnerName: ''})

  const handleRequestAction = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const { error } = await supabase
        .from('accountability_partners')
        .update({ status: action === 'accept' ? 'accepted' : 'declined' })
        .eq('id', requestId)

      if (error) throw error

      toast.success(`Request ${action}ed successfully!`)
      
      // Reload data
      const user = await authHelpers.getCurrentUser()
      if (user) {
        // Reload requests
        const { data: requestsData } = await supabase
          .from('accountability_partners')
          .select(`
            *,
            sender_profile:profiles!accountability_partners_user_id_fkey(*)
          `)
          .eq('partner_id', user.id)
          .eq('status', 'pending')

        const requestsList = (requestsData || []).map(r => ({
          id: r.id,
          senderId: r.user_id,
          name: r.sender_profile ? `${r.sender_profile.first_name || ''} ${r.sender_profile.last_name || ''}`.trim() || 'User' : 'User',
          username: r.sender_profile?.username || 'user',
          avatar: r.sender_profile?.profile_picture_url,
          message: r.message || 'Would like to be accountability partners!',
          sentAt: new Date(r.created_at).toLocaleDateString(),
          compatibility: Math.floor(Math.random() * 20) + 80
        }))

        setRequests(requestsList)
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} request`)
    }
  }

  const handleSyncContacts = async () => {
    try {
      setLoading(true)
      toast.info('Accessing contacts...')
      
      const contacts = await contactSync.getContacts()
      if (contacts.length === 0) {
        toast.info('No contacts found')
        return
      }

      const foundUsers = await contactSync.findUsersByContacts(contacts)
      if (foundUsers.length === 0) {
        toast.info('No Commitly users found in your contacts')
        return
      }

      // Add found users to discover list
      const newDiscoverUsers = foundUsers.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
        username: user.username || 'user',
        avatar: user.profile_picture_url,
        bio: `Found in your contacts as ${user.contact?.name}`,
        location: 'From Contacts',
        compatibility: 95,
        isFromContacts: true
      }))

      setDiscover(prev => [...newDiscoverUsers, ...prev.filter(u => !u.isFromContacts)])
      toast.success(`Found ${foundUsers.length} Commitly users in your contacts!`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync contacts')
    } finally {
      setLoading(false)
    }
  }

  // Load real data
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await authHelpers.getCurrentUser()
        if (!user) return

        // Load partners
        const { data: partnersData } = await supabase
          .from('accountability_partners')
          .select(`
            *,
            partner_profile:profiles!accountability_partners_partner_id_fkey(*),
            user_profile:profiles!accountability_partners_user_id_fkey(*)
          `)
          .or(`user_id.eq.${user.id},partner_id.eq.${user.id}`)
          .eq('status', 'accepted')

        const partnersList = (partnersData || []).map(p => {
          const isUserInitiator = p.user_id === user.id
          const partnerProfile = isUserInitiator ? p.partner_profile : p.user_profile
          return {
            id: isUserInitiator ? p.partner_id : p.user_id,
            name: partnerProfile ? `${partnerProfile.first_name || ''} ${partnerProfile.last_name || ''}`.trim() || 'Partner' : 'Partner',
            username: partnerProfile?.username || 'partner',
            avatar: partnerProfile?.profile_picture_url,
            bio: partnerProfile?.bio || 'No bio available',
            location: partnerProfile?.location || 'Unknown',
            status: 'active',
            sharedGoals: Math.floor(Math.random() * 5) + 1,
            successRate: Math.floor(Math.random() * 20) + 80,
            streak: Math.floor(Math.random() * 30) + 1,
            lastActive: '2 hours ago',
            compatibility: Math.floor(Math.random() * 20) + 80
          }
        })

        // Load requests (pending incoming)
        const { data: requestsData } = await supabase
          .from('accountability_partners')
          .select(`
            *,
            sender_profile:profiles!accountability_partners_user_id_fkey(*)
          `)
          .eq('partner_id', user.id)
          .eq('status', 'pending')

        const requestsList = (requestsData || []).map(r => ({
          id: r.id,
          senderId: r.user_id,
          name: r.sender_profile ? `${r.sender_profile.first_name || ''} ${r.sender_profile.last_name || ''}`.trim() || 'User' : 'User',
          username: r.sender_profile?.username || 'user',
          avatar: r.sender_profile?.profile_picture_url,
          message: r.message || 'Would like to be accountability partners!',
          sentAt: new Date(r.created_at).toLocaleDateString(),
          compatibility: Math.floor(Math.random() * 20) + 80
        }))

        // Load discover (other users not connected)
        const { data: discoverData } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id)
          .eq('has_completed_kyc', true)
          .limit(10)

        const discoverList = (discoverData || []).map(p => ({
          id: p.id,
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'User',
          username: p.username || 'user',
          avatar: p.profile_picture_url,
          bio: p.bio || 'No bio available',
          location: p.location || 'Unknown',
          compatibility: Math.floor(Math.random() * 20) + 70
        }))

        setPartners(partnersList)
        setRequests(requestsList)
        setDiscover(discoverList)
      } catch (error) {
        console.error('Error loading partners:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDiscover = discover.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.bio.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Partners</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Connect with accountability partners to achieve your goals together
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/partners/search">
              <Button className="hover-lift">
                <UserPlus className="h-4 w-4 mr-2" />
                Find Partners
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="hover-lift"
              onClick={handleSyncContacts}
              disabled={loading}
            >
              <Send className="h-4 w-4 mr-2" />
              Sync Contacts
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-500/10 mr-3">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Partners</p>
                  <p className="text-2xl font-bold">{partners.filter(p => p.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-500/10 mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">{requests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-500/10 mr-3">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shared Goals</p>
                  <p className="text-2xl font-bold">{partners.reduce((sum, p) => sum + p.sharedGoals, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-orange-500/10 mr-3">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Success Rate</p>
                  <p className="text-2xl font-bold">92%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search partners by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Partners Tabs */}
        <Tabs defaultValue="partners" className="space-y-4">
          <TabsList>
            <TabsTrigger value="partners">My Partners ({partners.length})</TabsTrigger>
            <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
            <TabsTrigger value="discover">Discover ({discover.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-4">
            <PartnersList 
              partners={filteredPartners} 
              loading={loading} 
              onSendEncouragement={(partnerId, partnerName) => 
                setEncouragementModal({open: true, partnerId, partnerName})
              }
            />
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <RequestsList requests={requests} onRequestAction={handleRequestAction} />
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            <DiscoverList people={filteredDiscover} />
          </TabsContent>
        </Tabs>

        {/* Encouragement Modal */}
        <EncouragementModal
          open={encouragementModal.open}
          onOpenChange={(open) => setEncouragementModal(prev => ({...prev, open}))}
          partnerId={encouragementModal.partnerId}
          partnerName={encouragementModal.partnerName}
        />
      </div>
    </MainLayout>
  )
}

function PartnersList({ partners, loading, onSendEncouragement }: { 
  partners: any[], 
  loading: boolean,
  onSendEncouragement: (partnerId: string, partnerName: string) => void
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1,2,3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  if (partners.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No partners found</p>
          <Link href="/partners/find">
            <Button>Find Your First Partner</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {partners.map((partner) => (
        <PartnerCard 
          key={partner.id} 
          partner={partner} 
          onSendEncouragement={onSendEncouragement}
        />
      ))}
    </div>
  )
}

function PartnerCard({ partner, onSendEncouragement }: { 
  partner: any,
  onSendEncouragement: (partnerId: string, partnerName: string) => void
}) {
  return (
    <Card className="hover-lift group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={partner.avatar} />
            <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{partner.name}</h3>
            <p className="text-xs text-muted-foreground">@{partner.username}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => onSendEncouragement(partner.id, partner.name)}
              title="Send encouragement"
            >
              <MessageCircle className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {partner.bio}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 rounded bg-muted/50">
            <div className="text-sm font-bold text-primary">{partner.sharedGoals}</div>
            <div className="text-xs text-muted-foreground">Goals</div>
          </div>
          <div className="text-center p-2 rounded bg-muted/50">
            <div className="text-sm font-bold text-green-600">{partner.successRate}%</div>
            <div className="text-xs text-muted-foreground">Success</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${partner.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-muted-foreground capitalize">{partner.status}</span>
          </div>
          <span className="text-muted-foreground">{partner.lastActive}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function RequestsList({ requests, onRequestAction }: { requests: any[], onRequestAction: (requestId: string, action: 'accept' | 'decline') => void }) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No pending requests</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.avatar} />
                <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{request.name}</h3>
                    <p className="text-xs text-muted-foreground">@{request.username}</p>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-medium">{request.compatibility}%</div>
                    <div className="text-muted-foreground">match</div>
                  </div>
                </div>

                <p className="text-xs mb-3 line-clamp-2">{request.message}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {request.sentAt}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => onRequestAction(request.id, 'decline')}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Decline
                    </Button>
                    <Button 
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onRequestAction(request.id, 'accept')}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Accept
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function DiscoverList({ people }: { people: any[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {people.map((person) => (
        <Card key={person.id} className="hover-lift group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <Avatar className="h-12 w-12">
                <AvatarImage src={person.avatar} />
                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline">
                  View Profile
                </Button>
                <Button size="sm">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <CardTitle className="text-lg">{person.name}</CardTitle>
              <CardDescription>@{person.username}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {person.bio}
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{person.location}</span>
            </div>

            {/* Shared Goals */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Shared Goals:</p>
              <div className="flex flex-wrap gap-1">
                {person.sharedGoals.map((goal) => (
                  <Badge key={goal} variant="outline" className="text-xs">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Compatibility */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Compatibility</span>
                <span className="font-medium">{person.compatibility}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-primary to-primary/60 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${person.compatibility}%` }}
                />
              </div>
            </div>

            {/* Mutual Connections */}
            {person.mutualConnections > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{person.mutualConnections} mutual connection{person.mutualConnections !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1">
              {person.badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
