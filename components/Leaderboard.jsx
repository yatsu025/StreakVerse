'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const MEDAL = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('id, username, xp, current_streak')
          .order('xp', { ascending: false })
          .limit(10)

        if (err) throw err
        setUsers(data || [])
      } catch (e) {
        // retry without current_streak
        try {
          const { data, error: e2 } = await supabase
            .from('profiles')
            .select('id, username, xp')
            .order('xp', { ascending: false })
            .limit(10)
          if (!e2) { setUsers(data || []); return }
        } catch (_) {}
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-xs uppercase tracking-widest">Loading rankings…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card border-red-500/20 text-center py-10">
        <p className="text-red-400 font-semibold">Failed to load leaderboard</p>
        <p className="text-xs text-gray-500 mt-2">{error}</p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="text-4xl mb-4">🏜️</div>
        <p className="text-gray-400 font-semibold">No data yet</p>
        <p className="text-gray-600 text-sm mt-1">Be the first to claim the top spot.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {users.map((u, i) => {
        const streak = u.current_streak ?? u.streak ?? 0
        const isTop3 = i < 3
        return (
          <div
            key={u.id ?? i}
            className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-colors
              ${isTop3
                ? 'bg-white/[0.04] border-white/10 hover:border-green-500/20'
                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
              }`}
          >
            {/* rank */}
            <span className="w-8 text-center text-lg shrink-0 leading-none">
              {MEDAL[i] ?? <span className="text-sm font-bold text-gray-600">#{i + 1}</span>}
            </span>

            {/* avatar placeholder */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
              ${isTop3 ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-400 border border-white/8'}`}>
              {(u.username || 'A')[0].toUpperCase()}
            </div>

            {/* name */}
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm truncate ${isTop3 ? 'text-white' : 'text-gray-300'}`}>
                @{u.username || 'anonymous'}
              </p>
            </div>

            {/* streak */}
            {streak > 0 && (
              <span className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full text-xs font-bold text-orange-400 shrink-0">
                🔥 {streak}d
              </span>
            )}

            {/* xp */}
            <span className={`text-sm font-black tabular-nums shrink-0 ${isTop3 ? 'text-green-400' : 'text-gray-500'}`}>
              {(u.xp || 0).toLocaleString()} <span className="text-xs font-normal opacity-60">XP</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
