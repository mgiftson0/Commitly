'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Shield, Eye, Lock, Database, Users, Mail } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: [
        "Personal information you provide (name, email, profile data)",
        "Goal and progress data you create",
        "Usage analytics and app interactions",
        "Device information and IP addresses",
        "Communication preferences and settings"
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        "Provide and improve our goal-tracking services",
        "Send important updates and notifications",
        "Personalize your experience and recommendations",
        "Ensure platform security and prevent abuse",
        "Analyze usage patterns to improve our product"
      ]
    },
    {
      title: "Information Sharing",
      icon: Users,
      content: [
        "With accountability partners (as part of the service)",
        "Service providers who help operate our platform",
        "Legal authorities when required by law",
        "In connection with business transfers",
        "With your explicit consent only"
      ]
    },
    {
      title: "Data Security",
      icon: Shield,
      content: [
        "Industry-standard encryption for data in transit and at rest",
        "Regular security audits and vulnerability testing",
        "Access controls and employee training",
        "Secure data centers with physical protection",
        "Regular backups with encryption"
      ]
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
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: January 15, 2025
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="container mx-auto px-4 pb-12 sm:pb-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Privacy Overview</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base max-w-none">
            <p>
              At Commitly, we are committed to protecting your privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
              goal-tracking platform and related services.
            </p>
            <p>
              By using Commitly, you agree to the collection and use of information in accordance with this policy.
              We will not use or share your information except as described in this Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Key Sections */}
      <section className="container mx-auto px-4 pb-12 sm:pb-16">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {sections.map((section, index) => {
            const IconComponent = section.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm sm:text-base">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Detailed Policy */}
      <section className="bg-muted/30 py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center">
              Detailed Privacy Policy
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">1. Information Collection</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    We collect information you provide directly to us, such as when you create an account,
                    set goals, or contact our support team. This includes your name, email address, profile information,
                    and the goals and progress data you create on our platform.
                  </p>
                  <p>
                    We also automatically collect certain information about your use of our services, including
                    device information, IP addresses, browser type, and usage analytics to help us improve our service.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">2. Cookies and Tracking</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience, analyze usage,
                    and assist in our marketing efforts. You can control cookie preferences through your browser settings,
                    though this may limit some functionality of our service.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">3. Data Retention</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    We retain your personal information for as long as necessary to provide our services,
                    comply with legal obligations, resolve disputes, and enforce our agreements.
                    You can request deletion of your account and associated data at any time.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">4. Your Rights</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    Depending on your location, you may have certain rights regarding your personal information,
                    including the right to access, correct, delete, or restrict processing of your data.
                    You can exercise these rights by contacting us at privacy@commitly.com.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">5. International Data Transfers</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    Your information may be transferred to and processed in countries other than your own.
                    We ensure appropriate safeguards are in place to protect your data during such transfers.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">6. Third-Party Services</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    We may use third-party services for analytics, payment processing, and email delivery.
                    These services have their own privacy policies, and we encourage you to review them.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">7. Children's Privacy</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    Our service is not intended for children under 13. We do not knowingly collect personal
                    information from children under 13. If we become aware of such collection, we will delete
                    the information immediately.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">8. Changes to This Policy</h3>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any changes
                    by posting the new policy on this page and updating the "Last updated" date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Questions About Privacy?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
            If you have any questions about this Privacy Policy or our data practices,
            please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">
                <Mail className="mr-2 h-4 w-4" />
                Contact Privacy Team
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="mailto:privacy@commitly.com">
                privacy@commitly.com
              </Link>
            </Button>
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
