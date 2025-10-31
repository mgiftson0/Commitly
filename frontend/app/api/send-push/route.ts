import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, title, body, data } = await request.json();

    if (!userId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's push tokens
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching push tokens:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ message: 'No push tokens found for user' }, { status: 200 });
    }

    const payload = JSON.stringify({
      title,
      body,
      data: data || {},
      tag: 'commitly-notification'
    });

    const promises = tokens.map(async (tokenRecord) => {
      try {
        const subscription = JSON.parse(tokenRecord.token);
        await webpush.sendNotification(subscription, payload);
        return { success: true };
      } catch (error) {
        console.error('Error sending push notification:', error);
        // Remove invalid tokens
        if (error.statusCode === 410) {
          await supabase
            .from('push_tokens')
            .delete()
            .eq('token', tokenRecord.token);
        }
        return { success: false, error };
      }
    });

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({ 
      message: `Sent ${successCount}/${tokens.length} notifications`,
      results 
    });

  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}