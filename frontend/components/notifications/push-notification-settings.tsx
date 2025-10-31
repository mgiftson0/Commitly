"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { toast } from 'sonner';

export function PushNotificationSettings() {
  const { permission, requestPermission } = usePushNotifications();
  const [loading, setLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setLoading(true);
    const success = await requestPermission();
    
    if (success) {
      toast.success('Push notifications enabled!');
    } else {
      toast.error('Failed to enable notifications');
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about goal updates and achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {permission === 'granted' ? (
          <div className="flex items-center gap-2 text-green-600">
            <Bell className="h-4 w-4" />
            <span className="text-sm">Notifications enabled</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BellOff className="h-4 w-4" />
              <span className="text-sm">Notifications disabled</span>
            </div>
            <Button 
              onClick={handleEnableNotifications}
              disabled={loading}
              size="sm"
            >
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}