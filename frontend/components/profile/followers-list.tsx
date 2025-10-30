'use client';

import { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { FollowButton } from './follow-button';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: string;
  username: string;
  display_name: string;
  profile_picture_url?: string;
  bio?: string;
}

interface FollowersListProps {
  userId: string;
  type: 'followers' | 'following';
  currentUserId?: string;
}

export function FollowersList({ userId, type, currentUserId }: FollowersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/follows?user_id=${userId}&type=${type}`);
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data[type] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchUsers} variant="outline" className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          {type === 'followers' ? (
            <>
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="font-semibold">No followers yet</h3>
              <p className="text-sm text-muted-foreground">
                Start connecting with other users
              </p>
            </>
          ) : (
            <>
              <UserPlus className="h-12 w-12 text-muted-foreground" />
              <h3 className="font-semibold">Not following anyone</h3>
              <p className="text-sm text-muted-foreground">
                Discover users to follow
              </p>
            </>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <Card key={user.id} className="p-4 hover:bg-accent/50 transition-colors">
          <div className="flex items-center justify-between gap-4">
            <Link 
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profile_picture_url} />
                <AvatarFallback>
                  {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.display_name}</p>
                <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                {user.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    {user.bio}
                  </p>
                )}
              </div>
            </Link>
            {currentUserId && currentUserId !== user.id && (
              <FollowButton 
                userId={user.id} 
                username={user.username}
                variant="outline"
                size="sm"
              />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
