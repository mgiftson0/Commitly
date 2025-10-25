'use client';

import { Button } from '@/components/ui/button';
import { useFollow } from '@/hooks/use-follow';
import { UserPlus, UserMinus, Clock, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FollowButtonProps {
  userId: string;
  username?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function FollowButton({ 
  userId, 
  username,
  variant = 'default',
  size = 'default',
  showText = true
}: FollowButtonProps) {
  const { status, loading, followUser, unfollowUser } = useFollow(userId);
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFollow = async () => {
    setIsProcessing(true);
    try {
      const result = await followUser();
      toast({
        title: 'Success',
        description: result.message || 'Follow request sent',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to follow user',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnfollow = async () => {
    setIsProcessing(true);
    try {
      await unfollowUser();
      toast({
        title: 'Success',
        description: `Unfollowed ${username || 'user'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to unfollow user',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = loading || isProcessing;

  // Following (accepted)
  if (status.isFollowing && !status.isPending) {
    return (
      <Button
        onClick={handleUnfollow}
        disabled={isLoading}
        variant={variant === 'default' ? 'outline' : variant}
        size={size}
        className="gap-2"
      >
        {status.isMutual ? (
          <>
            <Check className="h-4 w-4" />
            {showText && 'Mutual'}
          </>
        ) : (
          <>
            <UserMinus className="h-4 w-4" />
            {showText && 'Following'}
          </>
        )}
      </Button>
    );
  }

  // Pending request
  if (status.isPending) {
    return (
      <Button
        onClick={handleUnfollow}
        disabled={isLoading}
        variant="outline"
        size={size}
        className="gap-2"
      >
        <Clock className="h-4 w-4" />
        {showText && 'Requested'}
      </Button>
    );
  }

  // Not following
  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      variant={variant}
      size={size}
      className="gap-2"
    >
      <UserPlus className="h-4 w-4" />
      {showText && 'Follow'}
    </Button>
  );
}
