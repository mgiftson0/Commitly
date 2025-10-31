import { useEffect, useState } from 'react';
import { messaging, getToken, onMessage } from '@/lib/firebase';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!messaging) return false;

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (currentToken) {
          setToken(currentToken);
          await saveTokenToDatabase(currentToken);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error getting notification permission:', error);
      return false;
    }
  };

  const saveTokenToDatabase = async (token: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('push_tokens')
        .upsert({
          user_id: user.id,
          token,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      toast(payload.notification?.title || 'New notification', {
        description: payload.notification?.body,
      });
    });

    return () => unsubscribe();
  }, []);

  return {
    token,
    permission,
    requestPermission,
  };
};