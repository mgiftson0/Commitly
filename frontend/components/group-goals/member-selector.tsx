"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, X, Users } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

interface User {
  id: string
  first_name: string
  last_name: string
  username: string
  profile_picture_url?: string
}

interface MemberSelectorProps {
  selectedMembers: string[]
  onMembersChange: (memberIds: string[]) => void
  maxMembers?: number
}

export function MemberSelector({ selectedMembers, onMembersChange, maxMembers = 20 }: MemberSelectorProps) {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    searchUsers()
  }, [searchTerm])

  const searchUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, username, profile_picture_url')
        .limit(20)

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      onMembersChange(selectedMembers.filter(id => id !== userId))
    } else {
      if (selectedMembers.length < maxMembers) {
        onMembersChange([...selectedMembers, userId])
      }
    }
  }

  const removeMember = (userId: string) => {
    onMembersChange(selectedMembers.filter(id => id !== userId))
  }

  const selectedUsers = users.filter(u => selectedMembers.includes(u.id))

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Members */}
      {selectedMembers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Selected Members ({selectedMembers.length}/{maxMembers})
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMembersChange([])}
              className="h-auto p-1 text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map(user => (
              <Badge
                key={user.id}
                variant="secondary"
                className="pl-1 pr-2 py-1 flex items-center gap-2"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={user.profile_picture_url} />
                  <AvatarFallback className="text-[10px]">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">
                  {user.first_name} {user.last_name}
                </span>
                <button
                  onClick={() => removeMember(user.id)}
                  className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* User List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 animate-pulse mx-auto mb-2" />
            <p className="text-sm">Searching users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          users.map(user => {
            const isSelected = selectedMembers.includes(user.id)
            const isDisabled = !isSelected && selectedMembers.length >= maxMembers

            return (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-pink-300 bg-pink-50 dark:bg-pink-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !isDisabled && toggleMember(user.id)}
              >
                <Checkbox
                  checked={isSelected}
                  disabled={isDisabled}
                  onCheckedChange={() => toggleMember(user.id)}
                />
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profile_picture_url} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
                {isSelected && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300">
                    Selected
                  </Badge>
                )}
              </div>
            )
          })
        )}
      </div>

      {selectedMembers.length >= maxMembers && (
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
          Maximum {maxMembers} members reached
        </p>
      )}
    </div>
  )
}
