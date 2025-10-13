"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Plus,
  Search,
  Filter,
  UserPlus,
  UserCheck,
  MessageCircle,
  Calendar,
  Target,
  Award,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  X,
  MoreHorizontal,
  Send,
  Heart,
  Zap
} from "lucide-react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"

// Mock data for partners
const mockPartners = [
  {
    id: 1,
    name: "Sarah Martinez",
    username: "sarah_m",
    avatar: "/placeholder-avatar.jpg",
    bio: "Fitness enthusiast and goal crusher! Let's motivate each other 💪",
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
  const [filterCategory, setFilterCategory] = useState("all")

  const filteredPartners = mockPartners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDiscover = mockDiscover.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.bio.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
            <p className="text-muted-foreground">
              Connect with accountability partners to achieve your goals together
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/partners/find">
              <Button className="hover-lift">
                <UserPlus className="h-4 w-4 mr-2" />
                Find Partners
              </Button>
            </Link>
            <Link href="/partners/invite">
              <Button variant="outline" className="hover-lift">
                <Send className="h-4 w-4 mr-2" />
                Invite Friends
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Partners</p>
                  <p className="text-2xl font-bold">{mockPartners.filter(p => p.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">{mockRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shared Goals</p>
                  <p className="text-2xl font-bold">{mockPartners.reduce((sum, p) => sum + p.sharedGoals, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
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

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fitness">Fitness & Health</SelectItem>
                  <SelectItem value="career">Career & Business</SelectItem>
                  <SelectItem value="learning">Learning & Education</SelectItem>
                  <SelectItem value="personal">Personal Growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Partners Tabs */}
        <Tabs defaultValue="partners" className="space-y-4">
          <TabsList>
            <TabsTrigger value="partners">My Partners ({mockPartners.length})</TabsTrigger>
            <TabsTrigger value="requests">Requests ({mockRequests.length})</TabsTrigger>
            <TabsTrigger value="discover">Discover ({mockDiscover.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-4">
            <PartnersList partners={filteredPartners} />
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <RequestsList requests={mockRequests} />
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            <DiscoverList people={filteredDiscover} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

function PartnersList({ partners }: { partners: typeof mockPartners }) {
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
        <PartnerCard key={partner.id} partner={partner} />
      ))}
    </div>
  )
}

function PartnerCard({ partner }: { partner: typeof mockPartners[0] }) {
  return (
    <Card className="hover-lift group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={partner.avatar} />
              <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{partner.name}</CardTitle>
              <CardDescription>@{partner.username}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {partner.bio}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="font-bold text-primary">{partner.sharedGoals}</div>
            <div className="text-xs text-muted-foreground">Shared Goals</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="font-bold text-green-600">{partner.successRate}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {partner.badges.slice(0, 2).map((badge) => (
            <Badge key={badge} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
          {partner.badges.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{partner.badges.length - 2}
            </Badge>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${partner.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="capitalize">{partner.status}</span>
          </div>
          <span>{partner.lastActive}</span>
        </div>

        {/* Compatibility */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Compatibility</span>
            <span className="font-medium">{partner.compatibility}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-primary to-primary/60 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${partner.compatibility}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RequestsList({ requests }: { requests: typeof mockRequests }) {
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={request.avatar} />
                <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold">{request.name}</h3>
                    <p className="text-sm text-muted-foreground">@{request.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm">
                      <div className="font-medium">{request.compatibility}% match</div>
                      <div className="text-muted-foreground">compatibility</div>
                    </div>
                  </div>
                </div>

                <p className="text-sm mb-3">{request.message}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {request.sharedInterests.map((interest) => (
                    <Badge key={interest} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Sent {request.sentAt}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                    <Button size="sm">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
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

function DiscoverList({ people }: { people: typeof mockDiscover }) {
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
