'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Target,
  Calendar,
  Clock,
  ArrowRight,
  User,
  Tag,
  TrendingUp,
  Heart,
  MessageCircle
} from "lucide-react"
import Link from "next/link"

export default function BlogPage() {
  const featuredPost = {
    title: "The Science of Goal Achievement: What Really Works",
    excerpt: "Discover the psychological principles and research-backed strategies that separate successful goal achievers from those who struggle.",
    author: "Dr. Sarah Chen",
    date: "2025-01-15",
    readTime: "8 min read",
    category: "Psychology",
    image: "/api/placeholder/600/300",
    slug: "science-of-goal-achievement"
  }

  const posts = [
    {
      title: "Building Lasting Habits: The 21-Day Myth Debunked",
      excerpt: "Why the 21-day habit formation rule is misleading and what science actually tells us about creating sustainable habits.",
      author: "Marcus Rodriguez",
      date: "2025-01-10",
      readTime: "6 min read",
      category: "Habits",
      slug: "building-lasting-habits"
    },
    {
      title: "The Power of Accountability Partners",
      excerpt: "How finding the right accountability partner can increase your goal achievement rate by 300%.",
      author: "Emma Thompson",
      date: "2025-01-08",
      readTime: "5 min read",
      category: "Accountability",
      slug: "power-of-accountability-partners"
    },
    {
      title: "Goal Setting for Different Personality Types",
      excerpt: "Tailor your goal-setting approach based on whether you're an achiever, explorer, socializer, or killer.",
      author: "David Kim",
      date: "2025-01-05",
      readTime: "7 min read",
      category: "Strategy",
      slug: "goal-setting-personality-types"
    },
    {
      title: "Overcoming Procrastination: A Data-Driven Approach",
      excerpt: "Using behavioral economics and cognitive science to break the procrastination cycle.",
      author: "Dr. Sarah Chen",
      date: "2025-01-03",
      readTime: "9 min read",
      category: "Psychology",
      slug: "overcoming-procrastination"
    },
    {
      title: "The Future of Goal Tracking: AI and Machine Learning",
      excerpt: "How artificial intelligence is revolutionizing personal goal achievement and habit formation.",
      author: "Marcus Rodriguez",
      date: "2025-01-01",
      readTime: "6 min read",
      category: "Technology",
      slug: "future-of-goal-tracking"
    },
    {
      title: "Creating Goals That Actually Excite You",
      excerpt: "Why motivation matters more than methodology, and how to craft goals that light you up.",
      author: "Emma Thompson",
      date: "2024-12-28",
      readTime: "4 min read",
      category: "Motivation",
      slug: "creating-exciting-goals"
    }
  ]

  const categories = [
    { name: "All", count: 24 },
    { name: "Psychology", count: 8 },
    { name: "Habits", count: 6 },
    { name: "Strategy", count: 5 },
    { name: "Technology", count: 3 },
    { name: "Motivation", count: 2 }
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-xl sm:text-2xl font-bold">Commitly</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            Latest Insights
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
            The <span className="text-primary">Commitly</span> Blog
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Expert insights, research-backed strategies, and practical tips to help you achieve your goals
            and build lasting habits.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="container mx-auto px-4 pb-12 sm:pb-16">
        <Card className="max-w-4xl mx-auto overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Target className="h-16 w-16 sm:h-20 sm:w-20 text-primary/60" />
          </div>
          <CardHeader className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {featuredPost.category}
              </Badge>
              <span className="text-xs text-muted-foreground">Featured</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl leading-tight">
              {featuredPost.title}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-3">
              {featuredPost.excerpt}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarFallback className="text-xs bg-primary/10">
                    {featuredPost.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{featuredPost.author}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(featuredPost.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/blog/${featuredPost.slug}`}>
                  Read More <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 pb-8">
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center max-w-4xl mx-auto">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
              className="text-xs sm:text-sm"
            >
              {category.name}
              <span className="ml-1 text-muted-foreground">({category.count})</span>
            </Button>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {posts.map((post, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {post.readTime}
                  </span>
                </div>
                <CardTitle className="text-lg sm:text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{post.author}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(post.date)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3 text-xs" asChild>
                  <Link href={`/blog/${post.slug}`}>
                    Read Article <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-muted/30 py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
              Get the latest insights on goal achievement, habit formation, and productivity strategies
              delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button>Subscribe</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-bold">Commitly</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <Link href="/features" className="hover:text-primary transition-colors">Features</Link>
              <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
