"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Share2, Copy, Check, Twitter, Facebook, MessageCircle } from "lucide-react"
import { toast } from "sonner"

interface ShareProfileProps {
  username: string
  displayName: string
  profilePicture?: string
}

export function ShareProfile({ username, displayName, profilePicture }: ShareProfileProps) {
  const [copied, setCopied] = useState(false)
  const profileUrl = `${window.location.origin}/profile/${username}`
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      toast.success("Profile link copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const shareToTwitter = () => {
    const text = `Check out ${displayName}'s goals on Commitly!`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`
    window.open(url, '_blank')
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`
    window.open(url, '_blank')
  }

  const shareToWhatsApp = () => {
    const text = `Check out ${displayName}'s goals on Commitly! ${profileUrl}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {profilePicture && (
              <img src={profilePicture} alt={displayName} className="w-8 h-8 rounded-full" />
            )}
            Share {displayName}'s Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input value={profileUrl} readOnly />
            <Button size="sm" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={shareToTwitter} className="flex flex-col gap-1 h-auto py-3">
              <Twitter className="h-5 w-5" />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button variant="outline" onClick={shareToFacebook} className="flex flex-col gap-1 h-auto py-3">
              <Facebook className="h-5 w-5" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button variant="outline" onClick={shareToWhatsApp} className="flex flex-col gap-1 h-auto py-3">
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}