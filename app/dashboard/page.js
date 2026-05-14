'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { signOut } from '../../utils/auth'
import DashboardCard from '../../components/DashboardCard'

export default function Dashboard() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router                = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
      } else {
        setUser(user)
        const username = user?.user_metadata?.user_name
        if (username) fetchGitHubEvents(user)

        // fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)
      }
      setLoading(false)
    }
    checkUser()
  }, [router])

  const updateProfileInDatabase = async (user, pushEvents) => {
    try {
      const username   = user?.user_metadata?.user_name
      const avatar_url = user?.user_metadata?.avatar_url
      const xp         = pushEvents.length * 10

      // calculate streak
      const commitDates = [...new Set(pushEvents.map(e => e.created_at.split('T')[0]))].sort()
      let currentStreak = 0
      if (commitDates.length > 0) {
        const today     = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const lastCommit = commitDates[commitDates.length - 1]

        if (lastCommit === today || lastCommit === yesterday) {
          currentStreak = 1
          for (let i = commitDates.length - 1; i > 0; i--) {
            const curr = new Date(commitDates[i])
            const prev = new Date(commitDates[i - 1])
            const diff = Math.ceil(Math.abs(curr - prev) / (1000 * 60 * 60 * 24))
            if (diff === 1) currentStreak++
            else break
          }
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username || user.user_metadata.full_name || 'anonymous',
          avatar_url,
          xp,
          current_streak: currentStreak,
        })
        .select()
        .single()

      if (error) throw error
      setProfile(data)
    } catch (e) {
      console.error('Error updating database:', e.message)
    }
  }

  const fetchGitHubEvents = async (user) => {
    try {
      const username = user?.user_metadata?.user_name
      const res      = await fetch(`https://api.github.com/users/${username}/events`)
      const data     = await res.json()
      const pushEvents = data.filter(e => e.type === 'PushEvent')
      await updateProfileInDatabase(user, pushEvents)
    } catch (e) {
      console.error('Error fetching GitHub events:', e)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-xs uppercase tracking-widest">Loading your stats…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const streak = profile?.current_streak ?? profile?.streak ?? 0
  const xp     = profile?.xp ?? 0

  return (
    <main className="container mx-auto px-6 py-12 max-w-4xl">
      {/* Profile header */}
      <div className="card p-8 mb-8 flex flex-col md:flex-row items-center gap-6 border-green-500/15 bg-gradient-to-br from-green-500/5 to-transparent">
        <img
          src={user.user_metadata.avatar_url}
          alt={user.user_metadata.full_name}
          className="w-24 h-24 rounded-2xl border-4 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
        />
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-black tracking-tight">
            Welcome back, <span className="text-green-400">{user.user_metadata.full_name?.split(' ')[0] || 'Coder'}</span>!
          </h1>
          <p className="text-gray-400 font-medium">@{user.user_metadata.user_name}</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
            <span className="badge badge-green">{xp.toLocaleString()} XP</span>
            <span className="badge badge-orange">🔥 {streak} day streak</span>
          </div>
        </div>
        <button
          onClick={async () => { await signOut(); window.location.href = '/' }}
          className="px-5 py-2.5 bg-red-500/10 text-red-400 font-semibold rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-sm"
        >
          Logout
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <DashboardCard title="Total XP"       value={xp.toLocaleString()}  icon="⚡" />
        <DashboardCard title="Current Streak" value={`${streak} Days`}     icon="🔥" color="orange" />
        <DashboardCard title="GitHub"         value={user.user_metadata.user_name} icon="🐙" color="green" />
      </div>

      {/* Activity placeholder */}
      <div className="card p-8 mt-8 text-center">
        <p className="text-gray-500 text-sm">📊 Activity heatmap coming soon</p>
      </div>
    </main>
  )
}
