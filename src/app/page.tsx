'use client'

import { createClient } from '@/utils/supabase/client'

export default function Home() {
  const handleSignIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-20">
        <div className="flex items-center gap-3 mb-16">
          <div className="text-2xl font-mono font-bold tracking-tight">
            4AM
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          Your autonomous<br />on-call engineer.
        </h1>

        <p className="text-lg text-gray-400 mb-12 leading-relaxed max-w-xl">
          For when production breaks at 4AM and nobody else is awake. 4AM watches your monitoring, diagnoses bugs, and files fixes — automatically.
        </p>

        <button
          onClick={handleSignIn}
          className="inline-flex items-center gap-3 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="mt-24 pt-8 border-t border-gray-900 text-sm text-gray-600 font-mono">
          launching jun 11.
        </div>
      </div>
    </main>
  )
}