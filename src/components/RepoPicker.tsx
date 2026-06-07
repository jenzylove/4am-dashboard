'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Repo = {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  updated_at: string
  language: string | null
}

type WatchedRepo = {
  id: string
  repo_owner: string
  repo_name: string
}

export default function RepoPicker({ initialWatched }: { initialWatched: WatchedRepo[] }) {
  const router = useRouter()
  const [repos, setRepos] = useState<Repo[]>([])
  const [watched, setWatched] = useState<Set<string>>(
    new Set(initialWatched.map(w => `${w.repo_owner}/${w.repo_name}`))
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/github/repos')
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json()
          throw new Error(data.error || 'Failed to fetch repos')
        }
        return r.json()
      })
      .then((data) => {
        setRepos(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const toggleRepo = async (repo: Repo) => {
    const key = repo.full_name
    setSaving(key)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(null)
      return
    }

    const [repo_owner, repo_name] = repo.full_name.split('/')

    if (watched.has(key)) {
      // Remove
      await supabase
        .from('watched_repos')
        .delete()
        .eq('user_id', user.id)
        .eq('repo_owner', repo_owner)
        .eq('repo_name', repo_name)

      const newWatched = new Set(watched)
      newWatched.delete(key)
      setWatched(newWatched)
    } else {
      // Add
      await supabase
        .from('watched_repos')
        .insert({
          user_id: user.id,
          repo_owner,
          repo_name,
        })

      const newWatched = new Set(watched)
      newWatched.add(key)
      setWatched(newWatched)
    }

    setSaving(null)
    router.refresh()
  }

  const filtered = repos.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
        Loading your repos...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg p-4 text-sm" style={{ background: 'color-mix(in srgb, #ef4444 10%, transparent)', color: '#fca5a5' }}>
        Could not load repos: {error}
      </div>
    )
  }

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        placeholder="Search your repos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none transition-colors"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        }}
      />

      {/* Count */}
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Watching <span style={{ color: 'var(--army)' }}>{watched.size}</span> of {repos.length} repos
      </p>

      {/* List */}
      <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-2">
        {filtered.map((repo) => {
          const key = repo.full_name
          const isWatched = watched.has(key)
          const isSaving = saving === key

          return (
            <button
              key={repo.id}
              onClick={() => toggleRepo(repo)}
              disabled={isSaving}
              className="w-full text-left rounded-lg px-4 py-3 transition-colors flex items-center justify-between gap-4 group"
              style={{
                background: isWatched ? 'color-mix(in srgb, var(--army) 10%, transparent)' : 'var(--surface)',
                border: `1px solid ${isWatched ? 'color-mix(in srgb, var(--army) 30%, transparent)' : 'var(--border)'}`,
                opacity: isSaving ? 0.5 : 1,
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {repo.full_name}
                  </div>
                  {repo.private && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                      private
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                    {repo.description}
                  </p>
                )}
              </div>
              <div
                className="text-xs font-medium px-2.5 py-1 rounded-md shrink-0"
                style={{
                  background: isWatched ? 'color-mix(in srgb, var(--army) 20%, transparent)' : 'var(--border)',
                  color: isWatched ? 'var(--army)' : 'var(--text-muted)',
                }}
              >
                {isSaving ? '...' : isWatched ? '✓ Watching' : 'Watch'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}