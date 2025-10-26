'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, FileText, Scale, AlertTriangle, Users, Shield } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: FileText,
      content: "By accessing and using Commitly, you accept and agree to be bound by the terms and provision of this agreement."
    },
    {
      title: "User Responsibilities",
      icon: Users,
      content: "You are responsible for maintaining the confidentiality of your account and password, and for restricting access to your account."
    },
    {
      title: "Acceptable Use",
      icon: Scale,
      content: "You agree not to use the service for any unlawful purposes or to conduct any unlawful activity, including, but not limited to fraud, embezzlement, or insider trading."
    },
    {
      title: "Content Ownership",
      icon: Shield,
      content: "You retain ownership of all content you create. However, you grant us a license to use, display, and distribute your content as necessary to provide our services."
    }
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
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scale className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Please read these terms carefully before using Commitly. By using our service, you agree to be bound by these terms.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: January 15, 2025
          </p>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="container mx-auto px-4 pb-12 sm:pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {sections.map((section, index) => {
            const IconComponent = section.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-sm sm:text-base">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground">{section.content}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Detailed Terms */}
      <section className="bg-muted/30 py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center">
              Complete Terms of Service
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">1. Introduction</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    Welcome to Commitly. These Terms of Service ("Terms") govern your use of our website,
                    mobile application, and related services (collectively, the "Service"). By accessing or using
                    the Service, you agree to be bound by these Terms.
                  </p>
                  <p>
                    If you disagree with any part of these terms, then you may not access the Service.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">2. Description of Service</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    Commitly is a goal-tracking platform that helps users set, track, and achieve their goals
                    with the support of accountability partners. Our services include goal creation tools,
                    progress tracking, partner matching, notifications, and analytics.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">3. User Accounts</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    To use certain features of our Service, you must register for an account. You must provide
                    accurate, complete, and current information during the registration process and keep your
                    account information updated. You are responsible for safeguarding your password and for
                    all activities that occur under your account.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">4. Acceptable Use Policy</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>You agree not to use the Service to:</p>
                  <ul>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe on the rights of others</li>
                    <li>Transmit harmful or malicious code</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Use the service for spam or harassment</li>
                    <li>Impersonate others or provide false information</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">5. Content and Intellectual Property</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    You retain ownership of the content you create on our platform. By using our Service,
                    you grant us a limited license to use, display, and distribute your content as necessary
                    to provide and improve our services.
                  </p>
                  <p>
                    Our Service and its original content, features, and functionality are owned by Commitly
                    and are protected by copyright, trademark, and other intellectual property laws.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">6. Privacy</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    Your privacy is important to us. Our collection and use of personal information is governed
                    by our Privacy Policy, which is incorporated into these Terms by reference.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">7. Termination</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    We may terminate or suspend your account and access to the Service immediately, without
                    prior notice or liability, for any reason, including breach of these Terms.
                  </p>
                  <p>
                    Upon termination, your right to use the Service will cease immediately. All provisions
                    of these Terms which by their nature should survive termination shall survive.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">8. Disclaimer of Warranties</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties,
                    expressed or implied, and hereby disclaim all warranties including, without limitation,
                    implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">9. Limitation of Liability</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    In no event shall Commitly, its directors, employees, partners, agents, suppliers, or
                    affiliates be liable for any indirect, incidental, special, consequential, or punitive
                    damages, including without limitation, loss of profits, data, use, goodwill, or other
                    intangible losses.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">10. Governing Law</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    These Terms shall be interpreted and governed by the laws of the State of Delaware,
                    United States, without regard to its conflict of law provisions.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">11. Changes to Terms</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    We reserve the right to modify or replace these Terms at any time. If a revision is
                    material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">12. Contact Information</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    If you have any questions about these Terms, please contact us at legal@commitly.com.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <Card className="max-w-4xl mx-auto border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <CardTitle className="text-amber-800 dark:text-amber-200">Important Notice</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 dark:text-amber-300 mb-4">
              Please read these terms carefully. By using Commitly, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service.
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              If you do not agree to these terms, please do not use our service.
            </p>
          </CardContent>
        </Card>
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
