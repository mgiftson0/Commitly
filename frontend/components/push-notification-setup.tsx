"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff } from 'lucide-react';
import { pushService } from '@/lib/push-notifications';
import { toast } from 'sonner';

export function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      initializePushService();
    }
  }, []);

  const initializePushService = async () => {
    const initialized = await pushService.initialize();
    if (initialized && permission === 'granted') {
      const token = await pushService.subscribeToPush();
      setIsSubscribed(!!token);
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const newPermission = await pushService.requestPermission();
      setPermission(newPermission);

      if (newPermission === 'granted') {
        const token = await pushService.subscribeToPush();
        if (token) {
          setIsSubscribed(true);
          toast.success('Push notifications enabled!');
        } else {
          toast.error('Failed to enable push notifications');
        }
      } else {
        toast.error('Permission denied for notifications');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    try {
      await pushService.unsubscribe();
      setIsSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {isSubscribed ? (
            <Bell className="h-4 w-4 text-green-600" />
          ) : (
            <BellOff className="h-4 w-4 text-gray-400" />
          )}
          Push Notifications
        </CardTitle>
        <CardDescription className="text-xs">
          Get notified about goal updates and reminders
        </CardDescription>
      </CardHeader>
      <CardContent>
        {permission === 'denied' ? (
          <p className="text-xs text-muted-foreground">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        ) : (
          <Button
            onClick={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
            disabled={loading}
            variant={isSubscribed ? "outline" : "default"}
            size="sm"
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                {isSubscribed ? 'Disabling...' : 'Enabling...'}
              </div>
            ) : (
              <>
                {isSubscribed ? (
                  <>
                    <BellOff className="h-3 w-3 mr-1" />
                    Disable Notifications
                  </>
                ) : (
                  <>
                    <Bell className="h-3 w-3 mr-1" />
                    Enable Notifications
                  </>
                )}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}