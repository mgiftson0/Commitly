"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Instagram, Twitter, Mail, MessageCircle } from "lucide-react"

interface SocialLinksProps {
  profile: {
    instagram?: string
    twitter?: string
    snapchat?: string
    email?: string
  }
  isEditing?: boolean
  onChange?: (field: string, value: string) => void
}

export function SocialLinks({ profile, isEditing = false, onChange }: SocialLinksProps) {
  const socialLinks = [
    {
      key: 'instagram',
      label: 'Instagram',
      icon: Instagram,
      placeholder: '@username',
      value: profile.instagram || ''
    },
    {
      key: 'twitter',
      label: 'Twitter/X',
      icon: Twitter,
      placeholder: '@username',
      value: profile.twitter || ''
    },
    {
      key: 'snapchat',
      label: 'Snapchat',
      icon: MessageCircle,
      placeholder: '@username',
      value: profile.snapchat || ''
    },
    {
      key: 'email',
      label: 'Email',
      icon: Mail,
      placeholder: 'email@example.com',
      value: profile.email || ''
    }
  ]

  if (isEditing) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Social Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {socialLinks.map((link) => {
            const Icon = link.icon
            return (
              <div key={link.key} className="space-y-2">
                <Label htmlFor={link.key} className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Label>
                <Input
                  id={link.key}
                  placeholder={link.placeholder}
                  value={link.value}
                  onChange={(e) => onChange?.(link.key, e.target.value)}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const visibleLinks = socialLinks.filter(link => link.value)
  
  if (visibleLinks.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {visibleLinks.map((link) => {
        const Icon = link.icon
        const getHref = () => {
          switch (link.key) {
            case 'instagram':
              return `https://instagram.com/${link.value.replace('@', '')}`
            case 'twitter':
              return `https://twitter.com/${link.value.replace('@', '')}`
            case 'snapchat':
              return `https://snapchat.com/add/${link.value.replace('@', '')}`
            case 'email':
              return `mailto:${link.value}`
            default:
              return '#'
          }
        }

        return (
          <Button
            key={link.key}
            variant="outline"
            size="sm"
            asChild
            className="h-8 px-3"
          >
            <a href={getHref()} target="_blank" rel="noopener noreferrer">
              <Icon className="h-4 w-4 mr-2" />
              {link.label}
            </a>
          </Button>
        )
      })}
    </div>
  )
}