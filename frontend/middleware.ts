import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options,
            path: '/',
          })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.delete({
            name,
            ...options,
            path: '/',
          })
        }
      }
    }
  )

  // Get session with error handling
  let session = null;
  try {
    const { data: { session: sessionData }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Session error in middleware:', error);
      return NextResponse.redirect(new URL('/auth/clear-session', request.url));
    }
    session = sessionData;
  } catch (error) {
    console.error('Failed to get session in middleware:', error);
    return NextResponse.redirect(new URL('/auth/clear-session', request.url));
  }

  // Auth routes logic
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isLoginRoute = request.nextUrl.pathname === '/auth/login'
  const isSignupRoute = request.nextUrl.pathname === '/auth/signup'
  const isKycRoute = request.nextUrl.pathname === '/auth/kyc'
  const isClearSessionRoute = request.nextUrl.pathname === '/auth/clear-session'
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isPublicRoute = request.nextUrl.pathname === '/' || 
                       request.nextUrl.pathname === '/about' ||
                       request.nextUrl.pathname.startsWith('/blog')

  // Skip middleware for clear-session route
  if (isClearSessionRoute) {
    return NextResponse.next()
  }

  // Redirect logic
  if (!session) {
    // If not logged in and trying to access protected route
    if (!isAuthRoute && !isPublicRoute && !isApiRoute) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    // If not logged in and trying to access KYC
    if (isKycRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  } else {
    // User is logged in
    // NOTE: Email verification check disabled
    // Uncomment this block if you want to require email verification:
    /*
    const isEmailVerified = session.user.email_confirmed_at;
    const isUpdatePasswordRoute = request.nextUrl.pathname === '/auth/update-password';
    
    if (!isEmailVerified && !isUpdatePasswordRoute) {
      if (!isAuthRoute || isKycRoute) {
        await supabase.auth.signOut();
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('error', 'Please verify your email address before continuing');
        return NextResponse.redirect(redirectUrl);
      }
    }
    */
    
    // If logged in and trying to access login/signup routes
    if ((isLoginRoute || isSignupRoute)) {
      // Check if user has completed KYC
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_completed_kyc')
          .eq('id', session.user.id)
          .single()
        
        if (profile?.has_completed_kyc) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        } else {
          return NextResponse.redirect(new URL('/auth/kyc', request.url))
        }
      } catch (error) {
        // If no profile exists, redirect to KYC
        return NextResponse.redirect(new URL('/auth/kyc', request.url))
      }
    }
    
    // If logged in and trying to access KYC
    if (isKycRoute) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_completed_kyc')
          .eq('id', session.user.id)
          .single()
        
        // If KYC already completed, redirect to dashboard
        if (profile?.has_completed_kyc) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        // Otherwise allow access to KYC page
      } catch (error) {
        // If no profile exists, allow access to KYC to create one
        console.log('No profile found, allowing KYC access');
      }
    }
    
    // If logged in and trying to access dashboard without completing KYC
    if (request.nextUrl.pathname === '/dashboard') {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_completed_kyc')
          .eq('id', session.user.id)
          .single()
        
        if (!profile?.has_completed_kyc) {
          return NextResponse.redirect(new URL('/auth/kyc', request.url))
        }
      } catch (error) {
        // If no profile exists, redirect to KYC
        return NextResponse.redirect(new URL('/auth/kyc', request.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}