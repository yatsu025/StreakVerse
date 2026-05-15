'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Flame, Trophy, Zap, Medal as MedalIcon, Target, Loader2 } from 'lucide-react'

const MEDAL_COLORS = [
  'text-neon-orange drop-shadow-[0_0_8px_rgba(255,138,0,0.5)]',
  'text-gray-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]',
  'text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.3)]'
]

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
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <Loader2 className="w-10 h-10 text-neon-green animate-spin" />
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Synchronizing Rankings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="neo-card border-neon-red/20 text-center py-16">
        <p className="text-neon-red font-black uppercase tracking-widest mb-4">Transmission Error</p>
        <p className="text-xs text-white/40">{error}</p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="neo-card text-center py-24">
        <div className="text-6xl mb-8 opacity-20">🏜️</div>
        <p className="text-white/40 font-black uppercase tracking-widest">Arena Empty</p>
        <p className="text-white/20 text-xs mt-2">Initialize your core to claim the top spot.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {users.map((u, i) => {
        const streak = u.current_streak ?? u.streak ?? 0
        const isTop3 = i < 3
        return (
          <div
            key={u.id ?? i}
            className={`
              flex items-center gap-6 px-8 py-6 rounded-[2rem] transition-all duration-500 group relative overflow-hidden
              ${isTop3 
                ? 'glass border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.02)] scale-[1.02]' 
                : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]'}
            `}
          >
            {/* Background Glow for Top 3 */}
            {isTop3 && (
              <div className={`absolute inset-0 bg-gradient-to-r ${i === 0 ? 'from-neon-orange/5' : i === 1 ? 'from-white/5' : 'from-amber-600/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
            )}

            {/* rank */}
            <span className={`w-12 text-center text-3xl font-display font-black italic shrink-0 leading-none ${isTop3 ? MEDAL_COLORS[i] : 'text-white/10'}`}>
              {i + 1}
            </span>

            {/* avatar */}
            <div className={`
              relative w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-display font-black shrink-0 transition-all duration-500
              ${isTop3 
                ? 'bg-white/10 border-2 border-white/20 group-hover:border-neon-green shadow-xl' 
                : 'bg-white/5 text-white/20 border border-white/5'}
            `}>
              {(u.username || 'A')[0].toUpperCase()}
              {isTop3 && (
                <div className="absolute -top-1 -right-1">
                  <MedalIcon className={`w-5 h-5 ${MEDAL_COLORS[i]}`} />
                </div>
              )}
            </div>

            {/* name & level */}
            <div className="flex-1 min-w-0">
              <p className={`font-display font-black text-xl truncate tracking-tight transition-colors ${isTop3 ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                {u.username || 'ANONYMOUS_UNIT'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="w-3 h-3 text-neon-cyan fill-neon-cyan/20" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">LVL {Math.floor((u.xp || 0) / 100) + 1}</span>
              </div>
            </div>

            {/* stats container */}
            <div className="flex items-center gap-8">
              {/* streak */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Streak</span>
                <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-2xl group-hover:border-neon-orange/30 transition-all">
                  <Flame className={`w-4 h-4 ${streak > 0 ? 'text-neon-orange fill-neon-orange/20' : 'text-white/10'}`} />
                  <span className={`text-lg font-display font-black ${streak > 0 ? 'text-neon-orange' : 'text-white/10'}`}>{streak}</span>
                </div>
              </div>

              {/* xp */}
              <div className="flex flex-col items-end gap-1 min-w-[100px]">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Total XP</span>
                <div className="text-2xl font-display font-black tabular-nums transition-colors group-hover:text-neon-green">
                  {(u.xp || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
