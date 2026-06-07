'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../backend/db/supabaseClient'
import { getTierFromXP } from '../../../backend/tiers/tierLogic'
import { ArrowLeft, Flame, Zap, Trophy, GitCommit, Calendar } from 'lucide-react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────
interface DayRecord {
  date: string          // "2025-05-20"
  commits: number       // total commits that day
  xpEarned: number      // XP gained that day
  streakAfter: number   // streak value after that day
  rankScore: number     // rank score after that day
  xpAfter: number       // cumulative XP after that day
  tier: string          // tier name after that day
  tierColor: string
  isToday: boolean
  isYesterday: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function CornerCard({
  children, color = '#00FF66', className = '',
}: {
  children: React.ReactNode; color?: string; className?: string
}) {
  return (
    <div className={`relative ${className}`} style={{
      background: 'rgba(3,5,8,0.92)',
      border: `1px solid ${color}22`,
      clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
    }}>
      <span className="absolute top-0 left-0 w-3 h-3" style={{ borderTop: `2px solid ${color}88`, borderLeft: `2px solid ${color}88` }} />
      <span className="absolute bottom-0 right-0 w-3 h-3" style={{ borderBottom: `2px solid ${color}88`, borderRight: `2px solid ${color}88` }} />
      {children}
    </div>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ActivityPage() {
  const [user, setUser]           = useState<any>(null)
  const [records, setRecords]     = useState<DayRecord[]>([])
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [show, setShow]           = useState(false)
  const router                = useRouter()

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) { router.push('/'); return }

        const u = session.user
        setUser(u)

        const username = u.user_metadata?.user_name
        if (!username) { setError('GitHub username not found'); return }

        // Fetch GitHub push events
        const res = await fetch(
          `https://api.github.com/users/${username}/events?per_page=100`
        )
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)

        const events = await res.json()
        const pushEvents = Array.isArray(events)
          ? events.filter((e: any) => e.type === 'PushEvent')
          : []

        if (pushEvents.length === 0) {
          setError('No public push events found.')
          return
        }

        // Build commitCountByDate
        const commitCountByDate: Record<string, number> = {}
        for (const ev of pushEvents) {
          const date  = ev.created_at.split('T')[0]
          const count = ev.payload?.commits?.length ?? ev.payload?.size ?? 1
          commitCountByDate[date] = (commitCountByDate[date] ?? 0) + count
        }

        const sortedDates = Object.keys(commitCountByDate).sort() // oldest → newest
        const today     = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

        // Fetch existing profile — use actual saved values as source of truth
        const { data: profileData } = await supabase
          .from('profiles')
          .select('xp, current_streak, longest_streak, rank_score, last_commit_date')
          .eq('id', u.id)
          .maybeSingle()

        setProfileData(profileData)

        // The profile already has the correct final state from last sync.
        // We reconstruct per-day XP earned within the GitHub events window.
        // For the LAST date in the window, xpAfter = profileData.xp (actual DB value).
        // We work BACKWARDS from that to show per-day breakdown.

        // Step 1: Calculate per-day XP earned for each date in window
        const perDayXP: Record<string, number> = {}
        const perDayStreak: Record<string, number> = {}
        let tempStreak = 0
        let tempLast: string | null = null

        for (const date of sortedDates) {
          const commits = commitCountByDate[date]

          if (!tempLast) {
            tempStreak = 1
          } else {
            const diff = Math.round(
              (new Date(date).getTime() - new Date(tempLast).getTime()) / 86_400_000
            )
            if (diff === 0) continue
            else if (diff === 1) tempStreak++
            else tempStreak = 1
          }

          let xpEarned = 10
          if (tempStreak === 5)  xpEarned += 10
          if (tempStreak === 10) xpEarned += 20
          if (tempStreak === 30) xpEarned += 50
          if (commits > 1) xpEarned += (commits - 1) * 5

          perDayXP[date]    = xpEarned
          perDayStreak[date] = tempStreak
          tempLast = date
        }

        // Step 2: Total XP earned in this window
        const windowXP = Object.values(perDayXP).reduce((s, v) => s + v, 0)

        // Step 3: Use actual DB xp as the final cumulative value.
        // Work backwards: last day's xpAfter = actualXP (from DB).
        // Each earlier day = actualXP minus XP earned on later days.
        const actualXP       = profileData?.xp ?? windowXP
        const actualStreak   = profileData?.current_streak ?? 0
        const actualRankScore = profileData?.rank_score ?? (actualXP + actualStreak * 5)

        // Build cumulative XP per date by working forward from baseXP
        // baseXP = what XP was BEFORE the first date in this window
        const baseXP = Math.max(0, actualXP - windowXP)

        // Step 4: Build records with correct cumulative XP
        let cumulativeXP  = baseXP
        let currentStreak = 0
        let longestStreak = profileData?.longest_streak ?? 0
        let lastDate: string | null = null
        const dayRecords: DayRecord[] = []
        const windowDates = Object.keys(perDayXP).sort() // only dates with XP
        for (const date of sortedDates) {
          // Skip dates not in perDayXP (same-day duplicates already filtered)
          if (!(date in perDayXP)) continue

          const commits    = commitCountByDate[date]
          const xpEarned   = perDayXP[date]
          currentStreak    = perDayStreak[date]

          if (currentStreak > longestStreak) longestStreak = currentStreak

          cumulativeXP += xpEarned

          const isLastDate = date === windowDates[windowDates.length - 1]

          // For the most recent date, use actual DB values so it matches dashboard exactly
          const finalXP        = isLastDate ? actualXP        : cumulativeXP
          const finalStreak    = isLastDate ? actualStreak     : currentStreak
          const finalRankScore = isLastDate ? actualRankScore  : (finalXP + finalStreak * 5)

          const tierInfo = getTierFromXP(finalXP)

          dayRecords.push({
            date,
            commits,
            xpEarned,
            streakAfter: finalStreak,
            rankScore:   finalRankScore,
            xpAfter:     finalXP,
            tier:        tierInfo.name,
            tierColor:   tierInfo.color,
            isToday:     date === today,
            isYesterday: date === yesterday,
          })
        }

        // Reverse so newest is first
        setRecords(dayRecords.reverse())
        setTimeout(() => setShow(true), 80)

      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [router])

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#030508', fontFamily: "'Share Tech Mono', monospace" }}>
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-[#00FF6622] rounded-full" />
          <div className="absolute inset-0 border-t-2 border-[#00FF66] rounded-full animate-spin" />
        </div>
        <p className="text-[10px] tracking-[0.5em] text-[#00FF66] animate-pulse">LOADING ACTIVITY LOG...</p>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#030508', fontFamily: "'Share Tech Mono', monospace" }}>
        <p className="text-red-400 text-sm font-mono">{error}</p>
        <Link href="/dashboard" className="text-[#00FF66] text-xs hover:underline">← Back to Dashboard</Link>
      </div>
    )
  }

  const totalXP      = profileData?.xp ?? (records[0]?.xpAfter ?? 0)
  const totalCommits = records.reduce((s, r) => s + r.commits, 0)
  const maxStreak    = profileData?.longest_streak ?? records.reduce((m, r) => Math.max(m, r.streakAfter), 0)

  return (
    <main className="min-h-screen py-20 px-5 lg:px-10"
      style={{ background: '#030508', fontFamily: "'Share Tech Mono', monospace" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
        .font-orbitron { font-family: 'Orbitron', monospace; }
        .font-mono-sv  { font-family: 'Share Tech Mono', monospace; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
      `}</style>

      {/* BG grid */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: 'linear-gradient(rgba(0,255,102,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className={`mb-10 transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 text-[9px] font-mono-sv tracking-widest mb-6 hover:text-[#00FF66] transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            <ArrowLeft className="w-3 h-3" /> BACK TO DASHBOARD
          </Link>

          <div className="text-[9px] font-mono-sv tracking-[0.6em] mb-2" style={{ color: 'rgba(0,255,102,0.5)' }}>
            // ACTIVITY_LOG — COMMIT HISTORY
          </div>
          <h1 className="font-orbitron font-black text-3xl md:text-4xl tracking-tight mb-1">
            ACTIVITY <span style={{ color: '#00FF66' }}>VISUALIZER</span>
          </h1>
          <p className="text-[9px] font-mono-sv" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {user?.user_metadata?.user_name} · LAST {records.length} ACTIVE DAYS · PUBLIC REPOS ONLY
          </p>
        </div>

        {/* ── Summary Stats ── */}
        <div className={`grid grid-cols-3 gap-4 mb-10 transition-all duration-700 delay-100 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { label: 'TOTAL COMMITS', value: totalCommits, icon: <GitCommit className="w-4 h-4" />, color: '#00FF66' },
            { label: 'XP THIS WINDOW', value: totalXP,     icon: <Zap className="w-4 h-4" />,       color: '#B14AED' },
            { label: 'BEST STREAK',    value: `${maxStreak}D`, icon: <Flame className="w-4 h-4" />, color: '#FF6B35' },
          ].map(s => (
            <CornerCard key={s.label} color={s.color} className="p-5">
              <div className="flex items-center gap-2 mb-3" style={{ color: s.color }}>
                {s.icon}
                <span className="text-[8px] font-mono-sv tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
              </div>
              <div className="font-orbitron font-black text-2xl" style={{ color: s.color }}>
                {s.value}
              </div>
            </CornerCard>
          ))}
        </div>

        {/* ── Table Header ── */}
        <div className={`transition-all duration-700 delay-150 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="grid grid-cols-6 gap-2 px-4 py-2 mb-2 text-[8px] font-mono-sv tracking-widest"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            <span className="col-span-2">DATE</span>
            <span className="text-center">COMMITS</span>
            <span className="text-center">XP EARNED</span>
            <span className="text-center">STREAK</span>
            <span className="text-center">RANK SCORE</span>
          </div>

          {/* ── Rows ── */}
          <div className="space-y-2">
            {records.map((r, i) => (
              <div
                key={r.date}
                className="grid grid-cols-6 gap-2 px-4 py-4 rounded transition-all duration-200 hover:scale-[1.005] cursor-default"
                style={{
                  background: r.isToday
                    ? 'rgba(0,255,102,0.06)'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${r.isToday ? 'rgba(0,255,102,0.2)' : 'rgba(255,255,255,0.05)'}`,
                  animationDelay: `${i * 30}ms`,
                  opacity: show ? 1 : 0,
                  transform: show ? 'translateY(0)' : 'translateY(8px)',
                  transition: `all 0.4s ease ${150 + i * 25}ms`,
                }}
              >
                {/* Date */}
                <div className="col-span-2 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    {r.isToday && (
                      <span className="text-[7px] font-mono-sv px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(0,255,102,0.15)', color: '#00FF66', border: '1px solid rgba(0,255,102,0.3)' }}>
                        TODAY
                      </span>
                    )}
                    {r.isYesterday && (
                      <span className="text-[7px] font-mono-sv px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.2)' }}>
                        YESTERDAY
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono-sv mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {formatDate(r.date)}
                  </span>
                  <span className="text-[8px] font-mono-sv" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {r.date}
                  </span>
                </div>

                {/* Commits */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1">
                    <GitCommit className="w-3 h-3" style={{ color: '#00FF66' }} />
                    <span className="font-orbitron font-black text-sm" style={{ color: '#00FF66' }}>
                      {r.commits}
                    </span>
                  </div>
                  <span className="text-[7px] font-mono-sv" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {r.commits === 1 ? 'COMMIT' : 'COMMITS'}
                  </span>
                </div>

                {/* XP Earned */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" style={{ color: '#B14AED' }} />
                    <span className="font-orbitron font-black text-sm" style={{ color: '#B14AED' }}>
                      +{r.xpEarned}
                    </span>
                  </div>
                  <span className="text-[7px] font-mono-sv" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    TOTAL: {r.xpAfter}
                  </span>
                </div>

                {/* Streak */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3" style={{ color: '#FF6B35' }} />
                    <span className="font-orbitron font-black text-sm" style={{ color: '#FF6B35' }}>
                      {r.streakAfter}D
                    </span>
                  </div>
                  <span className="text-[7px] font-mono-sv" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    STREAK
                  </span>
                </div>

                {/* Rank Score */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" style={{ color: r.tierColor }} />
                    <span className="font-orbitron font-black text-sm" style={{ color: r.tierColor }}>
                      {r.rankScore}
                    </span>
                  </div>
                  <span className="text-[7px] font-mono-sv" style={{ color: r.tierColor + '88' }}>
                    {r.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {records.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="w-10 h-10 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
              <p className="text-[10px] font-mono-sv tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
                NO ACTIVITY FOUND
              </p>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-6 text-center">
            <p className="text-[8px] font-mono-sv" style={{ color: 'rgba(255,255,255,0.15)' }}>
              ⚠ SHOWING LAST ~90 EVENTS FROM GITHUB API · PRIVATE REPOS NOT INCLUDED
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
