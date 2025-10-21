import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"

export function PartnerRequests() {
  return (
    <Card className="hover-lift h-[280px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Partner Requests
        </CardTitle>
        <CardDescription>
          People who want to team up with you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">Sarah Martinez</p>
              <p className="text-xs text-muted-foreground">
                Wants to be your fitness partner
              </p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline">Decline</Button>
              <Button size="sm">Accept</Button>
            </div>
          </div>
        </div>
        <Button variant="ghost" className="w-full mt-3 text-sm">
          View All Requests
        </Button>
      </CardContent>
    </Card>
  )
}
