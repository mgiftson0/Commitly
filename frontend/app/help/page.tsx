'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Target,
  Search,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  Book,
  Users,
  Settings,
  CreditCard,
  Shield,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function HelpCenterPage() {
  const categories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of using Commitly",
      articles: [
        "How to create your first goal",
        "Setting up your profile",
        "Understanding the dashboard",
        "Mobile app setup"
      ]
    },
    {
      icon: Users,
      title: "Accountability Partners",
      description: "Everything about finding and managing partners",
      articles: [
        "How to find accountability partners",
        "Managing partner requests",
        "Best practices for partnerships",
        "Resolving partner conflicts"
      ]
    },
    {
      icon: Settings,
      title: "Account & Settings",
      description: "Manage your account and preferences",
      articles: [
        "Updating your profile",
        "Notification preferences",
        "Privacy settings",
        "Account deletion"
      ]
    },
    {
      icon: CreditCard,
      title: "Billing & Plans",
      description: "Questions about pricing and payments",
      articles: [
        "Understanding our pricing",
        "Managing subscriptions",
        "Payment methods",
        "Refunds and cancellations"
      ]
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your data protection and security",
      articles: [
        "Data privacy policy",
        "Account security",
        "GDPR compliance",
        "Data export options"
      ]
    }
  ]

  const faqs = [
    {
      question: "How do I create my first goal?",
      answer: "Creating your first goal is easy! Navigate to the Goals section from your dashboard, click 'Create New Goal', and follow the guided setup. We recommend starting with a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound)."
    },
    {
      question: "How do I find accountability partners?",
      answer: "You can find partners through our partner matching system. Go to the Partners section and click 'Find Partners'. You can search by interests, goal types, or location. We also suggest partners based on your goal history and preferences."
    },
    {
      question: "What happens if I miss a goal deadline?",
      answer: "Missing a deadline doesn't mean failure! You can extend your goal, break it into smaller milestones, or reset it entirely. Your accountability partner will be notified, and you can discuss adjustments together."
    },
    {
      question: "How secure is my data?",
      answer: "We take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices, regular security audits, and comply with GDPR and other privacy regulations."
    },
    {
      question: "Can I export my goal data?",
      answer: "Yes! Pro and Teams users can export their goal data, progress reports, and partner interactions. Go to Settings > Data Export to download your information in various formats."
    },
    {
      question: "How do notifications work?",
      answer: "You can customize notifications in Settings > Notifications. Choose what you want to be notified about: goal deadlines, partner updates, achievements, and reminders. You can also set quiet hours."
    }
  ]

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "Available 9 AM - 6 PM EST",
      action: "Start Chat"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "Response within 24 hours",
      action: "Send Email"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our experts",
      availability: "Mon-Fri 9 AM - 5 PM EST",
      action: "Call Now"
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
            <HelpCircle className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
            Help <span className="text-primary">Center</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Find answers to common questions, browse our knowledge base, or get in touch with our support team.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-10 pr-4 py-3 text-base"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Browse by Category
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive help articles organized by topic.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {categories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {category.articles.slice(0, 3).map((article, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                        {article}
                      </li>
                    ))}
                    {category.articles.length > 3 && (
                      <li className="text-sm text-primary font-medium cursor-pointer">
                        +{category.articles.length - 3} more articles
                      </li>
                    )}
                  </ul>
                  <Button variant="outline" size="sm" className="w-full">
                    View All <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Quick answers to the most common questions about Commitly.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-background rounded-lg border px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Still Need Help?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Our support team is here to help you succeed with Commitly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {contactOptions.map((option, index) => {
            const IconComponent = option.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{option.title}</CardTitle>
                  <CardDescription className="mb-2">{option.description}</CardDescription>
                  <p className="text-xs text-muted-foreground">{option.availability}</p>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-muted/30 py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Join Our Community
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
              Connect with other goal achievers, share experiences, and get support from the Commitly community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Join Community Forum
              </Button>
              <Button size="lg" variant="outline">
                Follow on Social Media
              </Button>
            </div>
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
