'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface FollowRequest {
  id: string;
  username: string;
  display_name: string;
  profile_picture_url?: string;
  bio?: string;
  request_id: string;
  created_at: string;
}

export function FollowRequests() {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/follows?type=pending');
      if (!response.ok) throw new Error('Failed to fetch requests');

      const data = await response.json();
      setRequests(data.pending || []);
    } catch (err) {
      console.error('Error fetching follow requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string, username: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      const response = await fetch('/api/follows/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, action: 'accept' }),
      });

      if (!response.ok) throw new Error('Failed to accept request');

      toast({
        title: 'Request Accepted',
        description: `@${username} is now following you`,
      });

      setRequests(prev => prev.filter(r => r.request_id !== requestId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept follow request',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleReject = async (requestId: string, username: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      const response = await fetch('/api/follows/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, action: 'reject' }),
      });

      if (!response.ok) throw new Error('Failed to reject request');

      toast({
        title: 'Request Rejected',
        description: `Rejected follow request from @${username}`,
      });

      setRequests(prev => prev.filter(r => r.request_id !== requestId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject follow request',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <UserPlus className="h-12 w-12 text-muted-foreground" />
          <h3 className="font-semibold">No pending requests</h3>
          <p className="text-sm text-muted-foreground">
            You'll see follow requests here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <Card key={request.request_id} className="p-4">
          <div className="flex items-center justify-between gap-4">
            <Link 
              href={`/profile/${request.username}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={request.profile_picture_url} />
                <AvatarFallback>
                  {request.display_name?.charAt(0).toUpperCase() || request.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{request.display_name}</p>
                <p className="text-sm text-muted-foreground truncate">@{request.username}</p>
                {request.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    {request.bio}
                  </p>
                )}
              </div>
            </Link>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleAccept(request.request_id, request.username)}
                disabled={processingIds.has(request.request_id)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(request.request_id, request.username)}
                disabled={processingIds.has(request.request_id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
