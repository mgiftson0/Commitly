'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, TrendingUp, Award, CheckCircle2, Calendar } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [supabaseReady, setSupabaseReady] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSupabaseReady(isSupabaseConfigured())
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Commitly</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </Button>
            {supabaseReady ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            ) : (
              <Button variant="outline" disabled>
                Setup Required
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Setup Warning Banner */}
      {!supabaseReady && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20">
          <div className="container mx-auto px-4 py-3">
            <p className="text-sm text-center">
              ⚠️ <strong>Setup Required:</strong> Please configure your Supabase credentials in <code className="bg-muted px-2 py-1 rounded">.env.local</code> and run <code className="bg-muted px-2 py-1 rounded">node setup.js</code> to initialize the database. See <code className="bg-muted px-2 py-1 rounded">SETUP_GUIDE.md</code> for instructions.
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Turn Your Goals Into <span className="text-primary">Reality</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Set, track, and complete your goals with accountability partners. Build streaks, celebrate milestones, and achieve more together.
        </p>
        <div className="flex gap-4 justify-center">
          {supabaseReady ? (
            <>
              <Link href="/auth/signup">
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Button size="lg" variant="outline">Learn More</Button>
            </>
          ) : (
            <>
              <Button size="lg" disabled>Get Started Free</Button>
              <Button size="lg" variant="outline" asChild>
                <a href="https://github.com/supabase/supabase" target="_blank" rel="noopener noreferrer">
                  Setup Guide
                </a>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-muted-foreground">Powerful features to help you stay committed</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Target className="h-12 w-12 text-primary mb-4" />
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
              <Users className="h-12 w-12 text-green-500 mb-4" />
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
              <TrendingUp className="h-12 w-12 text-purple-500 mb-4" />
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
              <Award className="h-12 w-12 text-orange-500 mb-4" />
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
      <section className="container mx-auto px-4 py-20 bg-muted/50 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground">Get started in three simple steps</p>
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

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-muted-foreground mb-8">
          {supabaseReady 
            ? "Join thousands of users who are achieving their goals with Commitly"
            : "Complete the setup to start tracking your goals with Commitly"
          }
        </p>
        {supabaseReady ? (
          <Link href="/auth/signup">
            <Button size="lg">Create Free Account</Button>
          </Link>
        ) : (
          <div className="space-y-4">
            <Button size="lg" disabled>Create Free Account</Button>
            <div className="text-sm text-muted-foreground">
              <p>To get started:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a></li>
                <li>Copy your project URL and API keys</li>
                <li>Update <code className="bg-muted px-2 py-1 rounded">.env.local</code> with your credentials</li>
                <li>Run <code className="bg-muted px-2 py-1 rounded">node setup.js</code> to create the database</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Commitly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
