import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[Auth Callback] code:', code ? 'present' : 'missing')
  console.log('[Auth Callback] origin:', origin)

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[Auth Callback] Exchange failed:', error.message, error)
    } else {
      console.log('[Auth Callback] ✅ Session created for:', data.session?.user?.email)
      return NextResponse.redirect(`${origin}${next}`)
    }
  } else {
    console.error('[Auth Callback] No code in URL')
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}