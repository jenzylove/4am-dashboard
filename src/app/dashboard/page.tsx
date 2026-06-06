import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div className="text-2xl font-mono font-bold">4AM</div>
          <div className="text-sm text-gray-500">
            {user.email}
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">
          Welcome to 4AM.
        </h1>
        <p className="text-gray-400 mb-12">
          You&apos;re in. Next: connect your Dynatrace tenant and GitHub repos.
        </p>

        <div className="rounded-xl border border-gray-800 p-8 bg-[#0d0d0f]">
          <p className="text-gray-500 text-sm font-mono">
            🚧 dashboard build in progress
            <br />
            next session: dynatrace + github oauth flows.
          </p>
        </div>
      </div>
    </main>
  )
}