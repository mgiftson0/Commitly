// Mock auth callback for frontend-only mode
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Redirect to dashboard for frontend-only mode
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
