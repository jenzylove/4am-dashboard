import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { exchangeCodeForToken, getGitHubUser } from '@/utils/github/oauth'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  console.log('[GitHub Callback] code:', code ? 'present' : 'missing', 'state:', state ? 'present' : 'missing')

  // User denied at GitHub
  if (errorParam) {
    console.log('[GitHub Callback] User denied:', errorParam)
    return NextResponse.redirect(new URL('/dashboard?error=github_denied', origin))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/dashboard?error=github_missing_params', origin))
  }

  // Verify state matches stored cookie (CSRF protection)
  const cookieStore = await cookies()
  const storedState = cookieStore.get('github_oauth_state')?.value

  if (!storedState || storedState !== state) {
    console.error('[GitHub Callback] State mismatch')
    return NextResponse.redirect(new URL('/dashboard?error=github_state_mismatch', origin))
  }

  cookieStore.delete('github_oauth_state')

  // Verify user is still signed in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/', origin))
  }

  try {
    // Exchange code for access token
    const redirectUri = `${origin}/auth/github/callback`
    const tokenData = await exchangeCodeForToken(code, redirectUri)
    console.log('[GitHub Callback] Token received, scope:', tokenData.scope)

    // Fetch the user's GitHub info
    const githubUser = await getGitHubUser(tokenData.access_token)
    console.log('[GitHub Callback] GitHub user:', githubUser.login)

    // Save connection to Supabase (RLS scopes it to this user)
    const { error: dbError } = await supabase
      .from('github_connections')
      .upsert({
        user_id: user.id,
        access_token: tokenData.access_token,
        github_username: githubUser.login,
        updated_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('[GitHub Callback] DB save failed:', dbError)
      return NextResponse.redirect(new URL('/dashboard?error=github_save_failed', origin))
    }

    console.log('[GitHub Callback] ✅ Connected:', githubUser.login)
    return NextResponse.redirect(new URL('/dashboard?connected=github', origin))
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'unknown'
    console.error('[GitHub Callback] Exchange failed:', errMsg)
    return NextResponse.redirect(
      new URL(`/dashboard?error=github_oauth_failed&msg=${encodeURIComponent(errMsg)}`, origin)
    )
  }
}