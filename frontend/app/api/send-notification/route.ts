import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { supabase } from '@/lib/supabase-client';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, body, data } = await request.json();

    // Get user's push tokens
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ success: false, error: 'No tokens found' });
    }

    const message = {
      notification: { title, body },
      data: data || {},
      tokens: tokens.map(t => t.token),
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    return NextResponse.json({ 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount 
    });
  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send notification' });
  }
}