'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Flame, Moon, Zap, Crown, Medal, Award, Loader2, AlertTriangle } from 'lucide-react'

const RANK_STYLES = [
  {
    card: 'border-[#BA7517]',
    avatar: 'bg-[#FAEEDA] text-[#633806] border-[#BA7517]',
    xp: 'text-[#BA7517]',
    bar: 'bg-[#BA7517]',
    icon: Crown,
    iconColor: 'text-[#BA7517]',
  },
  {
    card: 'border-[#B4B2A9]',
    avatar: 'bg-[#F1EFE8] text-[#2C2C2A] border-[#B4B2A9]',
    xp: 'text-[#888780]',
    bar: 'bg-[#B4B2A9]',
    icon: Medal,
    iconColor: 'text-[#888780]',
  },
  {
    card: 'border-[#639922]',
    avatar: 'bg-[#EAF3DE] text-[#173404] border-[#639922]',
    xp: 'text-[#639922]',
    bar: 'bg-[#639922]',
    icon: Award,
    iconColor: 'text-[#639922]',
  },
]

function level(xp) {
  return Math.floor((xp || 0) / 100) + 1
}

function initial(name) {
  return (name || '?')[0].toUpperCase()
}

function XPBar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="mt-3 h-1 w-full rounded-full bg-black/10">
      <div
        className="h-full rounded-full bg-current transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function PodiumCard({ user, rank, maxXP }) {
  const s = RANK_STYLES[rank]
  const RankIcon = s.icon
  const streak = user.current_streak ?? user.streak ?? 0

  return (
    <div
      className={`
        relative flex flex-col items-center rounded-2xl border bg-white dark:bg-zinc-900
        p-5 text-center transition-all duration-300 hover:shadow-lg
        ${s.card}
        ${rank === 0 ? 'pt-8 scale-[1.04] z-10' : ''}
      `}
    >
      {/* Crown badge for rank 1 */}
      {rank === 0 && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border border-[#BA7517] bg-white dark:bg-zinc-900 px-3 py-1">
          <RankIcon className={`w-4 h-4 ${s.iconColor}`} />
        </div>
      )}

      {/* Avatar */}
      <div
        className={`
          w-14 h-14 rounded-full border-2 flex items-center justify-center
          font-mono text-xl font-black mb-3 ${s.avatar}
        `}
      >
        {initial(user.username)}
      </div>

      {/* Name */}
      <p className="font-mono text-xs font-bold tracking-widest text-gray-900 dark:text-white truncate w-full">
        {user.username || 'UNKNOWN'}
      </p>

      {/* Level */}
      <p className="mt-1 text-[10px] font-semibold tracking-widest text-gray-400 uppercase flex items-center justify-center gap-1">
        <Zap className="w-3 h-3" />
        Lvl {level(user.xp)}
      </p>

      {/* XP */}
      <p className={`mt-3 font-mono text-2xl font-black ${s.xp}`}>
        {(user.xp || 0).toLocaleString()}
      </p>
      <p className="text-[9px] tracking-widest text-gray-400 uppercase">XP</p>

      {/* Streak */}
      <div className="mt-3">
        {streak > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[10px] font-bold text-amber-700">
            <Flame className="w-3 h-3" />
            {streak} day streak
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-3 py-1 text-[10px] font-bold text-gray-400">
            <Moon className="w-3 h-3" />
            No streak
          </span>
        )}
      </div>

      {/* XP Bar */}
      <div className={`w-full mt-4 ${s.xp}`}>
        <XPBar value={user.xp || 0} max={maxXP} />
      </div>
    </div>
  )
}

function ListRow({ user, rank }) {
  const streak = user.current_streak ?? user.streak ?? 0
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-3.5 transition-all hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800">
      {/* Rank */}
      <span className="w-7 text-center font-mono text-sm font-black text-gray-300 dark:text-zinc-600 shrink-0">
        {rank}
      </span>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center font-mono text-sm font-black text-gray-500 dark:text-zinc-400 shrink-0">
        {initial(user.username)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[11px] font-bold tracking-wider text-gray-900 dark:text-white truncate">
          {user.username || 'UNKNOWN'}
        </p>
        <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase flex items-center gap-1 mt-0.5">
          <Zap className="w-2.5 h-2.5" />
          Lvl {level(user.xp)}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 shrink-0">
        {streak > 0 ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-700">
            <Flame className="w-3 h-3" />
            {streak}
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-2.5 py-1 text-[10px] font-bold text-gray-400">
            <Moon className="w-3 h-3" />
            0
          </span>
        )}
        <span className="font-mono text-sm font-black text-gray-900 dark:text-white min-w-[56px] text-right">
          {(user.xp || 0).toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('id, username, xp, current_streak')
          .order('xp', { ascending: false })
          .limit(10)

        if (err) {
          // Fallback: try without current_streak if column missing
          const { data: data2, error: err2 } = await supabase
            .from('profiles')
            .select('id, username, xp')
            .order('xp', { ascending: false })
            .limit(10)

          if (err2) throw err2
          setUsers(data2 || [])
        } else {
          setUsers(data || [])
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-400">
          Loading Rankings...
        </p>
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20">
        <AlertTriangle className="w-7 h-7 text-red-400" />
        <p className="font-black text-sm uppercase tracking-widest text-red-500">
          Failed to load
        </p>
        <p className="text-xs text-red-400 max-w-xs text-center">{error}</p>
      </div>
    )
  }

  /* ── Empty ── */
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
        <p className="text-4xl opacity-30">🏜️</p>
        <p className="font-black text-sm uppercase tracking-widest text-gray-400">
          Arena Empty
        </p>
        <p className="text-xs text-gray-300 dark:text-zinc-600">
          No players yet.
        </p>
      </div>
    )
  }

  const top3 = users.slice(0, Math.min(3, users.length))
  const rest = users.slice(3)
  const maxXP = users[0]?.xp || 1

  // Podium display order: 2nd | 1st | 3rd
  const podiumOrder =
    top3.length === 3
      ? [top3[1], top3[0], top3[2]]
      : top3.length === 2
      ? [top3[1], top3[0]]
      : [top3[0]]

  const podiumRankMap =
    top3.length === 3
      ? [1, 0, 2]
      : top3.length === 2
      ? [1, 0]
      : [0]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="text-center">
        <h2 className="font-mono text-xl font-black tracking-[4px] uppercase text-gray-900 dark:text-white">
          Leaderboard
        </h2>
        <p className="mt-1 text-[10px] font-semibold tracking-[3px] uppercase text-gray-400">
          Season · Global Rankings
        </p>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div
          className={`grid gap-3 items-end ${
            top3.length === 1
              ? 'grid-cols-1 max-w-xs mx-auto'
              : top3.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-3'
          }`}
        >
          {podiumOrder.map((user, i) => (
            <PodiumCard
              key={user.id ?? i}
              user={user}
              rank={podiumRankMap[i]}
              maxXP={maxXP}
            />
          ))}
        </div>
      )}

      {/* Divider */}
      {rest.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100 dark:bg-zinc-800" />
          <span className="text-[10px] font-black tracking-widest uppercase text-gray-300 dark:text-zinc-600">
            Rankings
          </span>
          <div className="flex-1 h-px bg-gray-100 dark:bg-zinc-800" />
        </div>
      )}

      {/* List rows */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          {rest.map((user, i) => (
            <ListRow key={user.id ?? i} user={user} rank={i + 4} />
          ))}
        </div>
      )}
    </div>
  )
}