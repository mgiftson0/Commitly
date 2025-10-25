'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';

export interface FollowStatus {
  isFollowing: boolean;
  isFollower: boolean;
  isMutual: boolean;
  isPending: boolean;
  followersCount: number;
  followingCount: number;
  isPrivate: boolean;
}

export function useFollow(targetUserId: string | null) {
  const [status, setStatus] = useState<FollowStatus>({
    isFollowing: false,
    isFollower: false,
    isMutual: false,
    isPending: false,
    followersCount: 0,
    followingCount: 0,
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const response = await fetch(`/api/follows/status?target_id=${targetUserId}`);
      if (!response.ok) throw new Error('Failed to fetch follow status');
      
      const data = await response.json();
      setStatus({
        isFollowing: data.is_following || false,
        isFollower: data.is_follower || false,
        isMutual: data.is_mutual || false,
        isPending: data.is_pending || false,
        followersCount: data.target_followers_count || 0,
        followingCount: data.target_following_count || 0,
        isPrivate: data.target_is_private || false,
      });
    } catch (err) {
      console.error('Error fetching follow status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const followUser = async () => {
    if (!targetUserId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following_id: targetUserId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to follow user');
      }

      const result = await response.json();
      
      // Refresh status after following
      await fetchStatus();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to follow user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async () => {
    if (!targetUserId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/follows?following_id=${targetUserId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unfollow user');
      }

      // Refresh status after unfollowing
      await fetchStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unfollow user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptFollowRequest = async (requestId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/follows/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, action: 'accept' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept request');
      }

      await fetchStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectFollowRequest = async (requestId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/follows/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, action: 'reject' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject request');
      }

      await fetchStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    loading,
    error,
    followUser,
    unfollowUser,
    acceptFollowRequest,
    rejectFollowRequest,
    refresh: fetchStatus,
  };
}
