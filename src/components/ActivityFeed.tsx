export type Activity = {
  id: number
  repo: string
  title: string
  number: number
  url: string
  state: 'open' | 'closed'
  merged: boolean
  created_at: string
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function StatusDot({ merged, state }: { merged: boolean; state: 'open' | 'closed' }) {
  let color = 'var(--army)'
  let label = 'Open'
  if (merged) {
    color = '#a855f7'
    label = 'Merged'
  } else if (state === 'closed') {
    color = 'var(--text-faint)'
    label = 'Closed'
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-label={label} />
      <span className="text-[10px] uppercase tracking-wider" style={{ color }}>
        {label}
      </span>
    </span>
  )
}

export default function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="text-3xl mb-2">🌙</div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No activity yet. 4AM is watching — sit tight.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
          When errors fire in your watched repos, fixes will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <a
          key={activity.id}
          href={activity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border p-4 transition-colors"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <StatusDot merged={activity.merged} state={activity.state} />
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {activity.repo}
                </span>
                <span style={{ color: 'var(--text-faint)' }}>·</span>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  #{activity.number}
                </span>
              </div>
              <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                {activity.title}
              </p>
            </div>
            <div className="text-xs shrink-0 mt-1" style={{ color: 'var(--text-faint)' }}>
              {timeAgo(activity.created_at)}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}