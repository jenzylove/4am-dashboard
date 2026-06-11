'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { SiDynatrace } from 'react-icons/si'

export default function ConnectDynatrace() {
  const router = useRouter()
  const [tenantUrl, setTenantUrl] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let cleanUrl = tenantUrl.trim()
    if (!cleanUrl.startsWith('http')) cleanUrl = `https://${cleanUrl}`
    cleanUrl = cleanUrl.replace(/\/$/, '')

    try {
      new URL(cleanUrl)
    } catch {
      setError('That doesn\'t look like a valid URL. Try something like https://abc12345.apps.dynatrace.com')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You appear to be signed out. Refresh and try again.')
      setLoading(false)
      return
    }

    const { error: upsertError } = await supabase
      .from('dynatrace_connections')
      .upsert({
        user_id: user.id,
        tenant_url: cleanUrl,
        api_token: apiToken.trim(),
        updated_at: new Date().toISOString(),
      })

    if (upsertError) {
      setError(`Could not save: ${upsertError.message}`)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-300 mb-8 inline-block"
        >
          ← Back to dashboard
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <SiDynatrace className="w-7 h-7" style={{ color: '#1496FF' }} />
          <h1 className="text-3xl font-bold">Connect Dynatrace</h1>
        </div>
        <p className="text-gray-400 mb-10">
          4AM reads error logs from your Dynatrace to detect production issues.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dynatrace URL */}
          <div>
            <label htmlFor="tenantUrl" className="block text-sm font-medium mb-2">
              Your Dynatrace URL
            </label>
            <input
              id="tenantUrl"
              type="text"
              value={tenantUrl}
              onChange={(e) => setTenantUrl(e.target.value)}
              placeholder="https://abc12345.apps.dynatrace.com"
              required
              className="w-full bg-[#0d0d0f] border border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gray-600 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              The address you see in your browser when logged into Dynatrace.
            </p>
          </div>

          {/* API Token */}
          <div>
            <label htmlFor="apiToken" className="block text-sm font-medium mb-2">
              API Token
            </label>
            <input
              id="apiToken"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="dt0c01.XXX..."
              required
              className="w-full bg-[#0d0d0f] border border-gray-800 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-gray-600 transition-colors"
            />
            <div className="text-xs text-gray-500 mt-2">
              <p>In Dynatrace, go to <span className="font-mono text-gray-400">Access Tokens → Generate new token</span>, with these scopes only:</p>
              <ul className="ml-4 mt-1 list-disc text-gray-600 font-mono text-[11px] space-y-0.5">
                <li>storage:logs:read</li>
                <li>storage:buckets:read</li>
                <li>environment:roles:viewer</li>
              </ul>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connecting...' : 'Connect Dynatrace'}
            </button>
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-300"
            >
              Cancel
            </Link>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-4">
  Don&apos;t have Dynatrace?{" "}
  <a 
    href="https://www.dynatrace.com/trial/" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-[var(--warm)] hover:underline"
  >
    Start a 15-day free trial →
  </a>
</p>
        </form>

        {/* Trust panel — what we do (and don't) with this */}
        <div className="mt-12 rounded-xl border border-gray-900 bg-[#0d0d0f] p-5 space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            What 4AM does with your credentials
          </p>
          <div className="flex gap-3 text-sm">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <p className="text-gray-300">
              Reads error logs from your Dynatrace — nothing else.
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <p className="text-gray-300">
              Encrypted at rest. Tied to your account only — no one else can read it.
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <p className="text-gray-300">
              The scopes above are <em>read-only</em>. 4AM cannot modify, delete, or disable anything in your Dynatrace.
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="text-gray-500 mt-0.5">⌀</span>
            <p className="text-gray-500">
              Revoke anytime from Dynatrace → Access Tokens.
            </p>
          </div>

          <div className="pt-3 mt-2 border-t border-gray-900">
            <p className="text-xs text-gray-500">
              4AM is open source —{' '}
              <a
                href="https://github.com/jenzylove/4am-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white underline underline-offset-2"
              >
                read the code
              </a>
              {' '}to verify exactly how your token is used.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
