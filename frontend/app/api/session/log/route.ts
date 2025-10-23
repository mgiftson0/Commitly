import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const res = NextResponse.json({ ok: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options, path: "/" });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.delete({ name, ...options, path: "/" });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const ua = request.headers.get('user-agent') || 'unknown';
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || (request as any).ip || 'unknown';
  const now = new Date();
  const expires_at = session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null;

  const payload = {
    user_id: session?.user?.id ?? null,
    session_token: session?.access_token ?? null,
    device: ua,
    ip,
    created_at: now.toISOString(),
    expires_at,
  };

  try {
    const { error } = await supabase.from('session_logs').insert(payload as any);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
