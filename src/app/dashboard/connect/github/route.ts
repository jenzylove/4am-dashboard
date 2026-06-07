import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { buildOAuthUrl } from '@/utils/github/oauth'

export async function GET(request: Request) {
  // Verify user is signed in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Generate CSRF state token
  const state = crypto.randomUUID()

  // Store state in httpOnly cookie for verification on callback
  const cookieStore = await cookies()
  cookieStore.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  // Redirect to GitHub authorize page
  const { origin } = new URL(request.url)
  const redirectUri = `${origin}/auth/github/callback`
  const authorizeUrl = buildOAuthUrl(state, redirectUri)

  return NextResponse.redirect(authorizeUrl)
}