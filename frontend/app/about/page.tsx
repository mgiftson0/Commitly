'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Target,
  Heart,
  Users,
  TrendingUp,
  Award,
  Star,
  Quote,
  ArrowRight,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Goal Achievement",
      description: "We believe everyone deserves the tools to turn their aspirations into achievements."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a supportive community where accountability partners help each other succeed."
    },
    {
      icon: Heart,
      title: "Authenticity",
      description: "Encouraging genuine progress over perfection, celebrating every step forward."
    },
    {
      icon: TrendingUp,
      title: "Growth Mindset",
      description: "Fostering a culture of continuous improvement and lifelong learning."
    }
  ]

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Founder",
      bio: "Former product manager at tech giants, passionate about helping people achieve their dreams.",
      initials: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO",
      bio: "10+ years building scalable platforms, focused on user experience and performance.",
      initials: "MR"
    },
    {
      name: "Emma Thompson",
      role: "Head of Design",
      bio: "Award-winning UX designer with a love for creating intuitive, beautiful interfaces.",
      initials: "ET"
    },
    {
      name: "David Kim",
      role: "Lead Engineer",
      bio: "Full-stack developer specializing in modern web technologies and user-focused solutions.",
      initials: "DK"
    }
  ]

  const milestones = [
    { year: "2023", event: "Commitly founded with a vision to revolutionize goal tracking" },
    { year: "2024", event: "Launched beta version with core accountability features" },
    { year: "2024", event: "Reached 10,000+ active users milestone" },
    { year: "2025", event: "Expanded to mobile apps and advanced analytics" }
  ]

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Goals Achieved" },
    { number: "95%", label: "User Satisfaction" },
    { number: "4.8/5", label: "App Store Rating" }
  ]

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
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
            Our <span className="text-primary">Mission</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            We&apos;re on a mission to empower millions of people to achieve their goals through accountability,
            community, and intelligent goal-tracking tools. Every achievement starts with a single step,
            and we&apos;re here to guide you every step of the way.
          </p>
          <div className="flex justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                Join Our Community <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Commitly was born from a simple observation: while many people set ambitious goals,
                  very few achieve them consistently. The missing ingredient? Accountability.
                </p>
                <p>
                  Our founders experienced this firsthand. Despite having clear goals and strong motivation,
                  they struggled to maintain momentum without someone to share progress with and stay accountable to.
                </p>
                <p>
                  What started as a personal tool evolved into a platform that now helps thousands of people
                  worldwide turn their aspirations into achievements through smart technology and human connection.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <Quote className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-lg italic text-muted-foreground mb-4">
                    &ldquo;The best way to predict the future is to create it.&rdquo;
                  </p>
                  <p className="font-semibold">- Peter Drucker</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/30 py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Our Values
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at Commitly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm sm:text-base">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Our Journey
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Key milestones in our mission to help people achieve their goals.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-2" />
                  {index < milestones.length - 1 && (
                    <div className="w-px h-16 bg-border mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="font-semibold text-primary mb-1">{milestone.year}</div>
                  <p className="text-muted-foreground">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-muted/30 py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Meet Our Team
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate individuals behind Commitly&apos;s mission.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/10">
                    <AvatarFallback className="text-lg font-semibold">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="font-medium text-primary">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Join Our Mission
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
            Be part of a community that&apos;s transforming how people achieve their goals worldwide.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="px-8">
              Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
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
