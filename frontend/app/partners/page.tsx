"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FollowButton } from "@/components/profile/follow-button"
import { FollowersList } from "@/components/profile/followers-list"
import { useToast } from "@/hooks/use-toast"
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
  const [followRequests, setFollowRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  const [encouragementModal, setEncouragementModal] = useState<{open: boolean, partnerId: string, partnerName: string}>({open: false, partnerId: '', partnerName: ''})
  const { toast } = useToast()

  const handleFollowRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('/api/follows/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, action }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action} request`)
      }

      toast.success(`Request ${action}ed successfully!`)
      
      // Reload follow requests
      try {
        const response = await fetch('/api/follows?type=pending')
        if (response.ok) {
          const data = await response.json()
          setFollowRequests(data.pending || [])
        }
      } catch (error) {
        console.error('Error reloading follow requests:', error)
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} request`)
    }
  }

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
          message: 'Would like to be accountability partners!',
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
        
        setCurrentUser(user)

        // Load current user profile with follow counts
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('followers_count, following_count')
          .eq('id', user.id)
          .single()
        
        setCurrentUserProfile(userProfile)

        // Load accountability partners (for mutual goals tracking)
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

        // Load accountability partner requests (pending incoming)
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
          message: 'Would like to be accountability partners!',
          sentAt: new Date(r.created_at).toLocaleDateString(),
          compatibility: Math.floor(Math.random() * 20) + 80
        }))

        // Load follow requests
        try {
          const response = await fetch('/api/follows?type=pending')
          if (response.ok) {
            const data = await response.json()
            setFollowRequests(data.pending || [])
          }
        } catch (error) {
          console.error('Error loading follow requests:', error)
        }

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
        {/* Twitter-like Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Connect</h1>
              <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                <span>{currentUserProfile?.following_count || 0} Following</span>
                <span>{currentUserProfile?.followers_count || 0} Followers</span>
                {followRequests.length > 0 && <span>{followRequests.length} Requests</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/search" className="hidden sm:block">
                <Button size="sm" variant="outline">
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </Link>
              <Link href="/partners/search">
                <Button size="sm">
                  <UserPlus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Find People</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-b">
          <div className="grid grid-cols-3 sm:grid-cols-4 text-center py-3 gap-2">
            <div>
              <div className="text-base sm:text-lg font-bold">{currentUserProfile?.following_count || 0}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold">{currentUserProfile?.followers_count || 0}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold">{followRequests.length}</div>
              <div className="text-xs text-muted-foreground">Requests</div>
            </div>
            <div className="hidden sm:block">
              <div className="text-base sm:text-lg font-bold">{partners.length}</div>
              <div className="text-xs text-muted-foreground">Partners</div>
            </div>
          </div>
        </div>

        {/* Twitter-like Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full border-muted-foreground/20 bg-muted/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="following" className="space-y-0">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto overflow-x-auto">
            <TabsTrigger value="following" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 sm:px-6 py-3 text-sm">
              Following
            </TabsTrigger>
            <TabsTrigger value="followers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 sm:px-6 py-3 text-sm">
              Followers
            </TabsTrigger>
            <TabsTrigger value="follow-requests" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 sm:px-6 py-3 text-sm">
              Requests {followRequests.length > 0 && <Badge className="ml-1 sm:ml-2 h-5 w-5 p-0 text-xs">{followRequests.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="partners" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 sm:px-6 py-3 text-sm">
              Partners
            </TabsTrigger>
            <TabsTrigger value="discover" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 sm:px-6 py-3 text-sm">
              Discover
            </TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="space-y-4">
            <FollowersList 
              userId={currentUser?.id || ''} 
              type="following" 
              currentUserId={currentUser?.id}
            />
          </TabsContent>

          <TabsContent value="followers" className="space-y-4">
            <FollowersList 
              userId={currentUser?.id || ''} 
              type="followers" 
              currentUserId={currentUser?.id}
            />
          </TabsContent>

          <TabsContent value="follow-requests" className="space-y-4">
            <FollowRequestsList requests={followRequests} onRequestAction={handleFollowRequestAction} />
          </TabsContent>

          <TabsContent value="partners" className="space-y-4">
            <PartnersList 
              partners={filteredPartners} 
              loading={loading} 
              onSendEncouragement={(partnerId, partnerName) => 
                setEncouragementModal({open: true, partnerId, partnerName})
              }
            />
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
      <div className="space-y-0">
        {[1,2,3].map(i => (
          <div key={i} className="border-b p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="h-12 w-12 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (partners.length === 0) {
    return (
      <div className="py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">No partners found</p>
        <Link href="/partners/search">
          <Button>Find Your First Partner</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-0">
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
    <div className="border-b hover:bg-muted/50 transition-colors p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={partner.avatar} />
          <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{partner.name}</h3>
              <p className="text-sm text-muted-foreground">@{partner.username}</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSendEncouragement(partner.id, partner.name)}
              className="ml-2"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
          
          <p className="text-sm mt-2 line-clamp-2">
            {partner.bio}
          </p>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{partner.sharedGoals} shared goals</span>
            <span>{partner.successRate}% success rate</span>
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${partner.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              {partner.lastActive}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RequestsList({ requests, onRequestAction }: { requests: any[], onRequestAction: (requestId: string, action: 'accept' | 'decline') => void }) {
  if (requests.length === 0) {
    return (
      <div className="py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No pending requests</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {requests.map((request) => (
        <div key={request.id} className="border-b hover:bg-muted/50 transition-colors p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={request.avatar} />
              <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{request.name}</h3>
                  <p className="text-sm text-muted-foreground">@{request.username}</p>
                </div>
                
                <div className="flex gap-2 ml-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onRequestAction(request.id, 'decline')}
                  >
                    Decline
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => onRequestAction(request.id, 'accept')}
                  >
                    Accept
                  </Button>
                </div>
              </div>
              
              <p className="text-sm mt-2 line-clamp-2">{request.message}</p>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{request.compatibility}% match</span>
                <span>{request.sentAt}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FollowRequestsList({ requests, onRequestAction }: { requests: any[], onRequestAction: (requestId: string, action: 'accept' | 'reject') => void }) {
  if (requests.length === 0) {
    return (
      <div className="py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No pending follow requests</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {requests.map((request) => (
        <div key={request.request_id || request.id} className="border-b hover:bg-muted/50 transition-colors p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={request.profile_picture_url} />
              <AvatarFallback>{request.display_name?.charAt(0) || request.username?.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{request.display_name}</h3>
                  <p className="text-sm text-muted-foreground">@{request.username}</p>
                </div>
                
                <div className="flex gap-2 ml-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onRequestAction(request.request_id || request.id, 'reject')}
                  >
                    Reject
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => onRequestAction(request.request_id || request.id, 'accept')}
                  >
                    Accept
                  </Button>
                </div>
              </div>
              
              <p className="text-sm mt-2 text-muted-foreground">
                Requested to follow you {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'recently'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DiscoverList({ people }: { people: any[] }) {
  return (
    <div className="space-y-0">
      {people.map((person) => (
        <div key={person.id} className="border-b hover:bg-muted/50 transition-colors p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={person.avatar} />
              <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{person.name}</h3>
                  <p className="text-sm text-muted-foreground">@{person.username}</p>
                </div>
                
                <FollowButton 
                  userId={person.id} 
                  username={person.username}
                  variant="outline" 
                  size="sm" 
                />
              </div>
              
              <p className="text-sm mt-2 line-clamp-2">{person.bio}</p>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {person.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {person.location}
                  </span>
                )}
                <span>{person.compatibility}% match</span>
                {person.mutualConnections > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {person.mutualConnections} mutual follower{person.mutualConnections !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {person.badges && person.badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {person.badges.slice(0, 3).map((badge: string) => (
                    <Badge key={badge} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
