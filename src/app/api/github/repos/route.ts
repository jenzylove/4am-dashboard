import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  // Get the user's GitHub access token from our DB
  const { data: connection } = await supabase
    .from('github_connections')
    .select('access_token')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!connection?.access_token) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 })
  }

  try {
    // Fetch repos from GitHub API
    const response = await fetch(
      'https://api.github.com/user/repos?sort=updated&per_page=50&affiliation=owner,collaborator',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${connection.access_token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${response.status}` },
        { status: response.status }
      )
    }

    const repos = await response.json()

    // Simplify the response — only fields we need
    const simplified = repos.map((r: { id: number; name: string; full_name: string; description: string | null; private: boolean; updated_at: string; language: string | null }) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      private: r.private,
      updated_at: r.updated_at,
      language: r.language,
    }))

    return NextResponse.json(simplified)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}