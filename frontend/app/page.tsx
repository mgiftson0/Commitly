'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Target, Users, TrendingUp, Award, Star, Mail, Twitter, Github, Linkedin, MessageCircle, Zap, Shield, Clock } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"


export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "??" : "??"}
              </Button>
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "??" : "??"}
              </Button>
              <Link href="/auth/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Setup Warning Banner */}
      {false && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20">
          <div className="container mx-auto px-4 py-3">
            <p className="text-sm text-center">
              ?? <strong>Setup Required:</strong> Please configure your Supabase credentials in <code className="bg-muted px-2 py-1 rounded">.env.local</code> and run <code className="bg-muted px-2 py-1 rounded">node setup.js</code> to initialize the database. See <code className="bg-muted px-2 py-1 rounded">SETUP_GUIDE.md</code> for instructions.
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
          Turn Your Goals Into <span className="text-primary">Reality</span>
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
          Set, track, and complete your goals with accountability partners. Build streaks, celebrate milestones, and achieve more together.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <Button size="lg" variant="outline">Learn More</Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Everything You Need to Succeed</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Powerful features to help you stay committed</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Target className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
              <CardTitle>Multiple Goal Types</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Single tasks, multi-activity checklists, or recurring goals - track them all
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mb-3 sm:mb-4" />
              <CardTitle>Accountability Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect with partners who keep you motivated and on track
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500 mb-3 sm:mb-4" />
              <CardTitle>Streak Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build momentum with daily streaks and watch your progress grow
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Award className="h-10 w-10 sm:h-12 sm:w-12 text-orange-500 mb-3 sm:mb-4" />
              <CardTitle>Milestones & Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Celebrate achievements and track your journey to success
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 bg-muted/50 rounded-lg">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">How It Works</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Get started in three simple steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Your Goals</h3>
            <p className="text-muted-foreground">
              Set single tasks, checklists, or recurring goals with custom timeframes
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Find Partners</h3>
            <p className="text-muted-foreground">
              Connect with accountability partners to stay motivated together
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Track & Achieve</h3>
            <p className="text-muted-foreground">
              Monitor progress, build streaks, and celebrate your milestones
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10K+</div>
            <div className="text-muted-foreground">Active Users</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50K+</div>
            <div className="text-muted-foreground">Goals Completed</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">95%</div>
            <div className="text-muted-foreground">Success Rate</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">4.8?</div>
            <div className="text-muted-foreground">User Rating</div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 bg-muted/30">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">What Our Users Say</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Join thousands of successful goal achievers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-4">
                &ldquo;Commitly changed my life! I&apos;ve completed more goals in 3 months than I did in the entire previous year thanks to my accountability partner.&rdquo;
              </p>
              <div className="font-semibold">Sarah Johnson</div>
              <div className="text-sm text-muted-foreground">Fitness Enthusiast</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-4">
                &ldquo;The streak tracking feature keeps me motivated. I haven&apos;t missed a day in 6 months and I&apos;m finally building the habits I always wanted.&rdquo;
              </p>
              <div className="font-semibold">Mike Chen</div>
              <div className="text-sm text-muted-foreground">Entrepreneur</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-4">
                &ldquo;Perfect for students! I used it to track my study goals and graduation requirements. The checklist feature is a game-changer.&rdquo;
              </p>
              <div className="font-semibold">Emily Rodriguez</div>
              <div className="text-sm text-muted-foreground">Graduate Student</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Frequently Asked Questions</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Everything you need to know about Commitly</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span>How does accountability partnering work?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-muted-foreground">
                You can connect with other users who have similar goals or interests. Your accountability partner will receive notifications about your progress and can provide encouragement, motivation, and gentle reminders to help you stay on track.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>What types of goals can I track?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-muted-foreground">
                Commitly supports single tasks, multi-step checklists, and recurring goals. Whether you&apos;re learning a new skill, building a habit, completing a project, or working towards any objective, our platform can accommodate your needs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Is my data private and secure?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-muted-foreground">
                Absolutely. We use industry-standard encryption and security measures to protect your data. Your goals and progress are private by default, and you control who can see your achievements and connect with you as an accountability partner.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Can I set reminders and deadlines?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-muted-foreground">
                Yes! You can set custom deadlines, recurring reminders, and even schedule check-in times with your accountability partners. Our smart notification system will keep you on track without being overwhelming.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 bg-primary text-primary-foreground">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Stay Motivated</h2>
          <p className="mb-8 opacity-90">
            Get weekly tips, success stories, and motivation delivered to your inbox. Join our community of goal achievers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md text-foreground"
            />
            <Button variant="secondary" className="whitespace-nowrap">
              <Mail className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Ready to Start Your Journey?</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
          Join thousands of users who are achieving their goals with Commitly
        </p>
        <Link href="/auth/signup">
          <Button size="lg">Create Free Account</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Commitly</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering goal achievers worldwide with accountability partnerships and smart tracking tools.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Github className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Integrations</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">API</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Mobile App</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Status</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Bug Reports</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="font-semibold">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              � 2025 Commitly. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="text-sm text-muted-foreground">Made with ?? for goal achievers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
