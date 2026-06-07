import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SiDynatrace, SiGithub } from 'react-icons/si'
import { createClient } from '@/utils/supabase/server'
import RepoPicker from '@/components/RepoPicker'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: dynatraceConnection } = await supabase
    .from('dynatrace_connections')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: githubConnection } = await supabase
    .from('github_connections')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: watchedRepos } = await supabase
    .from('watched_repos')
    .select('*')
    .eq('user_id', user.id)

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--glow) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-4xl mx-auto px-6 py-12 relative">
        <div className="flex items-center justify-between mb-14">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-mono font-bold">4AM</div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium border"
              style={{
                background: 'color-mix(in srgb, var(--army) 12%, transparent)',
                color: 'var(--army)',
                borderColor: 'color-mix(in srgb, var(--army) 35%, transparent)',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--army)' }} />
              Live
            </span>
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
          Welcome to 4AM<span style={{ color: 'var(--warm)' }}>.</span>
        </h1>
        <p className="mb-12" style={{ color: 'var(--text-muted)' }}>
          Connect your services to start watching production.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <ConnectionCard
            name="Dynatrace"
            description="Where your production errors live"
            Icon={SiDynatrace}
            iconColor="#1496FF"
            connected={!!dynatraceConnection}
            details={dynatraceConnection ? new URL(dynatraceConnection.tenant_url).hostname : null}
            connectHref="/dashboard/connect/dynatrace"
          />

          <ConnectionCard
            name="GitHub"
            description="Where 4AM files PRs"
            Icon={SiGithub}
            iconColor="var(--foreground)"
            connected={!!githubConnection}
            details={githubConnection?.github_username ? `@${githubConnection.github_username}` : null}
            connectHref="/dashboard/connect/github"
          />
        </div>

        {dynatraceConnection && githubConnection && (
          <div className="mt-12">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Repos to watch<span style={{ color: 'var(--warm)' }}>.</span>
              </h2>
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                Toggle the ones 4AM should monitor
              </span>
            </div>
            <RepoPicker initialWatched={watchedRepos || []} />
          </div>
        )}
      </div>
    </main>
  )
}

function ConnectionCard({
  name, description, Icon, iconColor, connected, details, connectHref, comingSoon = false,
}: {
  name: string
  description: string
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  iconColor: string
  connected: boolean
  details: string | null
  connectHref: string
  comingSoon?: boolean
}) {
  return (
    <div
      className="rounded-xl border p-6 transition-colors"
      style={{
        borderColor: connected ? 'color-mix(in srgb, var(--army) 35%, transparent)' : 'var(--border)',
        background: 'var(--surface)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-7 h-7" style={{ color: iconColor }} />
        {connected ? (
          <span
            className="text-xs font-medium px-2 py-1 rounded-md"
            style={{
              background: 'color-mix(in srgb, var(--army) 15%, transparent)',
              color: 'var(--army)',
            }}
          >
            ✓ Connected
          </span>
        ) : comingSoon ? (
          <span
            className="text-xs font-medium px-2 py-1 rounded-md"
            style={{
              background: 'color-mix(in srgb, var(--warm) 15%, transparent)',
              color: 'var(--warm)',
            }}
          >
            Soon
          </span>
        ) : (
          <span
            className="text-xs font-medium px-2 py-1 rounded-md"
            style={{
              background: 'color-mix(in srgb, var(--text-faint) 20%, transparent)',
              color: 'var(--text-muted)',
            }}
          >
            Not connected
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-1">{name}</h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{description}</p>
      {connected && details && (
        <div className="text-xs font-mono mb-4" style={{ color: 'var(--text-muted)' }}>{details}</div>
      )}
      {comingSoon ? (
        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
          style={{ background: 'var(--border)', color: 'var(--text-faint)' }}
        >
          Connect
        </button>
      ) : (
        <Link
          href={connectHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={
            connected
              ? { background: 'var(--border)', color: 'var(--text-muted)' }
              : { background: 'var(--foreground)', color: 'var(--background)' }
          }
        >
          {connected ? 'Reconnect' : 'Connect'}
        </Link>
      )}
    </div>
  )
}