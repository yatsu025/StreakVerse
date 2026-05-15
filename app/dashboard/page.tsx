'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { signOut } from '../../utils/auth'
import {
  Zap,
  Flame,
  Github,
  Shield,
  Trophy,
  Star,
  Target,
  Loader2,
  ChevronRight,
  LayoutDashboard,
  Skull,
  LogOut,
  Wifi,
  Clock,
  TrendingUp,
  Award,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   TYPE DEFINITIONS
───────────────────────────────────────────── */
interface UserProfile {
  id: string
  username: string
  avatar_url: string
  xp: number
  current_streak: number
  // streak field as fallback in case column name differs
  streak?: number
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/**
 * Level tier thresholds — XP / 100 + 1 is base level,
 * but we also derive a named TIER for display.
 */
function getTierFromLevel(level: number): { tier: string; color: string; nextLevel: number } {
  if (level >= 50) return { tier: 'MYTHIC',   color: '#FFD700', nextLevel: 100 }
  if (level >= 30) return { tier: 'LEGEND',   color: '#FF6B35', nextLevel: 50  }
  if (level >= 20) return { tier: 'ELITE',    color: '#B14AED', nextLevel: 30  }
  if (level >= 10) return { tier: 'VETERAN',  color: '#00FF66', nextLevel: 20  }
  if (level >= 5)  return { tier: 'SOLDIER',  color: '#00E5FF', nextLevel: 10  }
  return             { tier: 'ROOKIE',    color: '#ffffff66', nextLevel: 5   }
}

/** XP needed for a given level */
const xpForLevel = (l: number) => (l - 1) * 100

/** Progress percentage inside current level (0–100) */
function xpProgress(xp: number, level: number) {
  const currentLevelXP = xpForLevel(level)
  const nextLevelXP    = xpForLevel(level + 1)
  return Math.min(100, ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)
}

/** Streak-based shield count (1 shield per 7-day block, max 5) */
const shieldsFromStreak = (streak: number) => Math.min(5, Math.floor(streak / 7))

/* ─────────────────────────────────────────────
   SMALL UI COMPONENTS
───────────────────────────────────────────── */

function XPBar({ value, max, color, height = 6 }: { value: number; max: number; color: string; height?: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="relative w-full rounded-sm overflow-hidden"
      style={{ height, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="h-full rounded-sm relative overflow-hidden transition-all duration-1000"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}>
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        }} />
      </div>
    </div>
  )
}

function CornerCard({
  children, color = '#00FF66', className = '', glow = false
}: {
  children: React.ReactNode; color?: string; className?: string; glow?: boolean
}) {
  return (
    <div className={`relative ${className}`} style={{
      background: 'rgba(3,5,8,0.92)',
      border: `1px solid ${color}22`,
      boxShadow: glow ? `0 0 30px ${color}18` : 'none',
      clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
    }}>
      <span className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: `2px solid ${color}88`, borderLeft: `2px solid ${color}88` }} />
      <span className="absolute top-0 right-5 w-4 h-4" style={{ borderTop: `2px solid ${color}44` }} />
      <span className="absolute bottom-5 left-0 w-4 h-4" style={{ borderLeft: `2px solid ${color}44` }} />
      <span className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: `2px solid ${color}88`, borderRight: `2px solid ${color}88` }} />
      {children}
    </div>
  )
}

function StatCard({
  label, value, sub, icon, color
}: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string
}) {
  return (
    <CornerCard color={color} className="p-6 group cursor-default hover:-translate-y-1 transition-transform duration-200">
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ background: `${color}12`, border: `1px solid ${color}33`, color }}>
          {icon}
        </div>
        <div className="w-1.5 h-1.5 rounded-full animate-pulse mt-1" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
      <div className="font-orbitron font-black mb-1 transition-all duration-300"
        style={{ fontSize: 'clamp(22px, 3vw, 32px)', color, textShadow: `0 0 20px ${color}44` }}>
        {value}
      </div>
      <div className="text-[9px] font-mono-sv tracking-[0.4em] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</div>
      {sub && <div className="text-[8px] font-mono-sv tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>{sub}</div>}
      <div className="mt-4 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
    </CornerCard>
  )
}

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────── */
export default function Dashboard() {
  const [user, setUser]         = useState<any>(null)
  const [profile, setProfile]   = useState<UserProfile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [syncing, setSyncing]   = useState(false)
  const [syncMsg, setSyncMsg]   = useState('')
  const [show, setShow]         = useState(false)
  const router                  = useRouter()

  /* ── AUTH CHECK ── */
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)

      // Load existing profile from Supabase first (fast render)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) setProfile(profileData)

      // Then sync fresh GitHub data in background
      if (user?.user_metadata?.user_name) {
        fetchAndSyncGitHub(user)
      }

      setLoading(false)
      setTimeout(() => setShow(true), 80)
    }
    checkUser()
  }, [router])

  /* ── GITHUB SYNC ── */
  const fetchAndSyncGitHub = async (u: any) => {
    setSyncing(true)
    setSyncMsg('SYNCING GITHUB...')
    try {
      const username = u?.user_metadata?.user_name
      const res      = await fetch(`https://api.github.com/users/${username}/events?per_page=100`)

      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)

      const data       = await res.json()
      const pushEvents = Array.isArray(data) ? data.filter((e: any) => e.type === 'PushEvent') : []

      await updateProfile(u, pushEvents)
      setSyncMsg('SYNCED ✓')
    } catch (e: any) {
      console.error('GitHub sync error:', e.message)
      setSyncMsg('SYNC FAILED')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(''), 3000)
    }
  }

  /* ── PROFILE UPDATE ── */
  const updateProfile = async (u: any, pushEvents: any[]) => {
    try {
      const username   = u?.user_metadata?.user_name || u?.user_metadata?.full_name || 'anonymous'
      const avatar_url = u?.user_metadata?.avatar_url || ''
      // XP = 10 per push event (each event can contain multiple commits)
      const xp         = pushEvents.length * 10

      // Build sorted unique commit dates (YYYY-MM-DD)
      const commitDates = [
        ...new Set(pushEvents.map((e: any) => e.created_at?.split('T')[0]).filter(Boolean))
      ].sort() as string[]

      // Calculate streak
      let currentStreak = 0
      if (commitDates.length > 0) {
        const today     = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const lastDate  = commitDates[commitDates.length - 1]

        // Streak is valid only if last commit was today or yesterday
        if (lastDate === today || lastDate === yesterday) {
          currentStreak = 1
          for (let i = commitDates.length - 1; i > 0; i--) {
            const curr = new Date(commitDates[i])
            const prev = new Date(commitDates[i - 1])
            const diffDays = Math.round(Math.abs(curr.getTime() - prev.getTime()) / 86400000)
            if (diffDays === 1) currentStreak++
            else break
          }
        }
        // else streak = 0 because they missed days
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: u.id,
          username,
          avatar_url,
          xp,
          current_streak: currentStreak,
        })
        .select()
        .single()

      if (error) throw error
      setProfile(data)          // update UI with fresh data from DB
    } catch (e: any) {
      console.error('Profile update error:', e.message)
    }
  }

  /* ── LOADING SCREEN ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030508', fontFamily: "'Share Tech Mono', monospace" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap'); .font-orbitron{font-family:'Orbitron',monospace;} .font-mono-sv{font-family:'Share Tech Mono',monospace;}`}</style>
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded flex items-center justify-center" style={{ border: '1px solid rgba(0,255,102,0.3)', background: 'rgba(0,255,102,0.05)' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00FF66' }} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="font-orbitron font-black text-sm tracking-widest" style={{ color: '#00FF66' }}>LOADING ARSENAL</span>
            <span className="text-[9px] font-mono-sv tracking-[0.5em]" style={{ color: 'rgba(255,255,255,0.2)' }}>CALIBRATING SYSTEMS...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  /* ── DERIVED VALUES (all from Supabase profile or fallback 0) ── */
  const streak  = profile?.current_streak ?? profile?.streak ?? 0
  const xp      = profile?.xp ?? 0
  const level   = Math.floor(xp / 100) + 1
  const { tier, color: tierColor, nextLevel } = getTierFromLevel(level)
  const xpPct   = xpProgress(xp, level)
  const shields = shieldsFromStreak(streak)
  const displayName = user.user_metadata?.full_name?.split(' ')[0] || profile?.username || 'RECRUIT'
  const githubName  = user.user_metadata?.user_name || profile?.username || 'unknown'
  const avatarUrl   = user.user_metadata?.avatar_url || profile?.avatar_url || ''

  /* ── BADGE UNLOCKS based on streak ── */
  const badges = [
    { label: 'INITIATE', days: 7,   color: '#00E5FF', unlocked: streak >= 7   },
    { label: 'VETERAN',  days: 30,  color: '#B14AED', unlocked: streak >= 30  },
    { label: 'ELITE',    days: 100, color: '#FF6B35', unlocked: streak >= 100 },
    { label: 'LEGEND',   days: 365, color: '#FFD700', unlocked: streak >= 365 },
  ]

  const fade = (d = 0) => ({
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(16px)',
    transition: `all 0.7s cubic-bezier(0.23,1,0.32,1) ${d}ms`,
  })

  return (
    <main className="min-h-screen py-24 px-5 lg:px-10" style={{ background: '#030508', fontFamily: "'Share Tech Mono', monospace" }}>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');
        .font-orbitron { font-family: 'Orbitron', monospace; }
        .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
        .font-mono-sv  { font-family: 'Share Tech Mono', monospace; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .animate-blink     { animation: blink 1s step-end infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #00FF6633; border-radius: 2px; }
      `}</style>

      {/* ── BG ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,255,102,0.04) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(177,74,237,0.04) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,255,102,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">

        {/* ══════════════════════════════════
            PROFILE HEADER CARD
        ══════════════════════════════════ */}
        <div style={fade(0)}>
          <CornerCard color="#00FF66" glow className="p-8 relative overflow-hidden">
            {/* Hover gradient */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(0,255,102,0.04), transparent 60%)' }} />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">

              {/* AVATAR */}
              <div className="relative shrink-0">
                <div className="relative w-28 h-28 rounded overflow-hidden" style={{ border: '2px solid rgba(0,255,102,0.3)' }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center font-orbitron font-black text-3xl" style={{ background: 'rgba(0,255,102,0.1)', color: '#00FF66' }}>{displayName[0]}</div>
                  }
                </div>
                {/* Level badge */}
                <div className="absolute -bottom-3 -right-3 flex items-center gap-1 px-2.5 py-1 rounded" style={{ background: '#030508', border: `1px solid ${tierColor}55`, boxShadow: `0 0 12px ${tierColor}33` }}>
                  <span className="text-[8px] font-mono-sv tracking-widest" style={{ color: `${tierColor}88` }}>LVL</span>
                  <span className="text-sm font-orbitron font-black" style={{ color: tierColor }}>{level}</span>
                </div>
              </div>

              {/* NAME + XP BAR */}
              <div className="flex-1 text-center md:text-left space-y-4 w-full">
                <div>
                  <div className="text-[9px] font-mono-sv tracking-[0.6em] mb-2" style={{ color: 'rgba(0,229,255,0.5)' }}>
                    ▶ PLAYER_IDENTITY_VERIFIED
                  </div>
                  <h1 className="font-orbitron font-black leading-none" style={{ fontSize: 'clamp(26px, 5vw, 48px)', letterSpacing: '-0.02em' }}>
                    WELCOME,{' '}
                    <span style={{ color: '#00FF66', textShadow: '0 0 30px rgba(0,255,102,0.5)' }}>
                      {displayName.toUpperCase()}
                    </span>
                  </h1>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="flex items-center gap-1.5 text-[9px] font-mono-sv tracking-widest px-3 py-1.5 rounded" style={{ background: `${tierColor}12`, border: `1px solid ${tierColor}33`, color: tierColor }}>
                    ◆ TIER: {tier}
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] font-mono-sv tracking-widest px-3 py-1.5 rounded" style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF' }}>
                    <Github className="w-3 h-3" /> @{githubName}
                  </span>
                  {syncMsg && (
                    <span className="flex items-center gap-1.5 text-[9px] font-mono-sv tracking-widest px-3 py-1.5 rounded" style={{ background: syncing ? 'rgba(255,215,0,0.08)' : syncMsg.includes('✓') ? 'rgba(0,255,102,0.08)' : 'rgba(255,45,85,0.08)', border: `1px solid ${syncing ? '#FFD70033' : syncMsg.includes('✓') ? '#00FF6633' : '#FF2D5533'}`, color: syncing ? '#FFD700' : syncMsg.includes('✓') ? '#00FF66' : '#FF2D55' }}>
                      {syncing && <RefreshCw className="w-3 h-3 animate-spin" />}
                      {syncMsg}
                    </span>
                  )}
                </div>

                {/* XP Progress Bar */}
                <div className="space-y-2 max-w-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono-sv tracking-widest" style={{ color: 'rgba(255,215,0,0.6)' }}>XP PROGRESS → LVL {level + 1}</span>
                    <span className="text-[8px] font-mono-sv" style={{ color: '#FFD700' }}>{xp} / {xpForLevel(level + 1)} XP</span>
                  </div>
                  <XPBar value={xp - xpForLevel(level)} max={xpForLevel(level + 1) - xpForLevel(level)} color="#FFD700" height={7} />
                  <div className="text-[8px] font-mono-sv" style={{ color: 'rgba(255,255,255,0.2)' }}>{Math.round(xpPct)}% TO NEXT LEVEL</div>
                </div>
              </div>

              {/* SIGN OUT */}
              <button
                onClick={async () => { await signOut(); window.location.href = '/' }}
                className="flex items-center gap-2 px-5 py-3 text-[9px] font-mono-sv tracking-widest shrink-0 transition-all hover:scale-105"
                style={{ border: '1px solid rgba(255,45,85,0.2)', color: 'rgba(255,45,85,0.5)', background: 'rgba(255,45,85,0.04)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF2D55'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,85,0.5)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,45,85,0.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,85,0.2)' }}
              >
                <LogOut className="w-3.5 h-3.5" />
                TERMINATE
              </button>
            </div>
          </CornerCard>
        </div>

        {/* ══════════════════════════════════
            STATS GRID  (3 cards)
        ══════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={fade(100)}>
          <StatCard
            label="EXPERIENCE POINTS"
            value={xp.toLocaleString()}
            sub={`NEXT LVL: ${xpForLevel(level + 1) - xp} XP AWAY`}
            icon={<Zap className="w-5 h-5" />}
            color="#B14AED"
          />
          <StatCard
            label="CURRENT STREAK"
            value={`${streak}D`}
            sub={streak === 0 ? 'NO ACTIVE STREAK — COMMIT TODAY' : streak === 1 ? 'STREAK JUST STARTED' : `${shieldsFromStreak(streak)} SHIELDS FORGED`}
            icon={<Flame className="w-5 h-5" />}
            color="#FF6B35"
          />
          <StatCard
            label="PLAYER LEVEL"
            value={`LVL ${level}`}
            sub={`TIER: ${tier}`}
            icon={<Trophy className="w-5 h-5" />}
            color={tierColor}
          />
        </div>

        {/* ══════════════════════════════════
            SHIELDS ROW
        ══════════════════════════════════ */}
        <div style={fade(180)}>
          <CornerCard color="#00E5FF" className="px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="text-[9px] font-mono-sv tracking-[0.5em] mb-2" style={{ color: 'rgba(0,229,255,0.5)' }}>// STREAK_SHIELD_SYSTEM</div>
                <div className="font-orbitron font-black text-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>STREAK SHIELDS</div>
                <div className="text-[9px] font-mono-sv mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  1 SHIELD PER 7-DAY BLOCK · {7 - (streak % 7)} DAYS TO NEXT SHIELD
                </div>
              </div>
              <div className="flex items-center gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded flex items-center justify-center transition-all duration-300"
                      style={{
                        background: i < shields ? 'rgba(0,229,255,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${i < shields ? 'rgba(0,229,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                        boxShadow: i < shields ? '0 0 12px rgba(0,229,255,0.2)' : 'none',
                      }}>
                      <Shield className="w-5 h-5" style={{ color: i < shields ? '#00E5FF' : 'rgba(255,255,255,0.1)' }} />
                    </div>
                    <span className="text-[7px] font-mono-sv" style={{ color: i < shields ? '#00E5FF66' : 'rgba(255,255,255,0.1)' }}>
                      {(i + 1) * 7}D
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <XPBar value={streak % 7} max={7} color="#00E5FF" height={4} />
              <div className="flex justify-between mt-1.5">
                <span className="text-[7px] font-mono-sv" style={{ color: 'rgba(255,255,255,0.2)' }}>CURRENT 7-DAY BLOCK</span>
                <span className="text-[7px] font-mono-sv" style={{ color: 'rgba(0,229,255,0.5)' }}>{streak % 7}/7 DAYS</span>
              </div>
            </div>
          </CornerCard>
        </div>

        {/* ══════════════════════════════════
            BADGE UNLOCKS
        ══════════════════════════════════ */}
        <div style={fade(240)}>
          <div className="text-[9px] font-mono-sv tracking-[0.5em] mb-5" style={{ color: 'rgba(255,255,255,0.2)' }}>
            // ACHIEVEMENT_BADGES — STREAK MILESTONES
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {badges.map((b, i) => (
              <div key={i} className="relative p-5 flex flex-col items-center gap-4 cursor-default transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: b.unlocked ? `${b.color}08` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${b.unlocked ? `${b.color}33` : 'rgba(255,255,255,0.06)'}`,
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}>
                {/* Icon */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: b.unlocked ? `${b.color}15` : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${b.unlocked ? `${b.color}44` : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: b.unlocked ? `0 0 20px ${b.color}30` : 'none',
                    color: b.unlocked ? b.color : 'rgba(255,255,255,0.15)',
                  }}>
                  {b.unlocked ? <Star className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
                </div>
                {/* Days */}
                <div className="font-orbitron font-black text-2xl" style={{ color: b.unlocked ? b.color : 'rgba(255,255,255,0.15)' }}>
                  {b.days}<span className="text-sm">D</span>
                </div>
                {/* Label */}
                <div className="text-[9px] font-mono-sv tracking-widest text-center" style={{ color: b.unlocked ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}>
                  {b.label}
                </div>
                {/* Status */}
                <div className="flex items-center gap-1.5 text-[7px] font-mono-sv tracking-widest"
                  style={{ color: b.unlocked ? `${b.color}88` : 'rgba(255,255,255,0.15)' }}>
                  {b.unlocked
                    ? <><CheckCircle2 className="w-3 h-3" /> UNLOCKED</>
                    : <><Lock className="w-2.5 h-2.5" /> {b.days - streak > 0 ? `${b.days - streak} DAYS LEFT` : 'LOCKED'}</>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════
            ACTIVITY GRID (2 locked panels)
        ══════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={fade(300)}>
          {/* Activity Visualizer */}
          <CornerCard color="#00FF66" className="p-10 flex flex-col items-center justify-center text-center gap-7 min-h-[320px] relative overflow-hidden group">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,255,102,0.04), transparent 60%)' }} />
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,255,102,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="w-16 h-16 rounded flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-110"
              style={{ background: 'rgba(0,255,102,0.05)', border: '1px solid rgba(0,255,102,0.15)' }}>
              <LayoutDashboard className="w-8 h-8" style={{ color: 'rgba(0,255,102,0.4)' }} />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="font-orbitron font-black text-xl tracking-tight" style={{ color: 'rgba(255,255,255,0.7)' }}>ACTIVITY VISUALIZER</div>
              <p className="font-rajdhani text-sm leading-relaxed max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Neural contribution heatmap. Real-time commit tracking across all repositories.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded relative z-10" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)' }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#FFD70088' }} />
              <span className="text-[8px] font-mono-sv tracking-widest" style={{ color: '#FFD70088' }}>DEPLOYING SOON</span>
            </div>
          </CornerCard>

          {/* Mission Hub */}
          <CornerCard color="#B14AED" className="p-10 flex flex-col items-center justify-center text-center gap-7 min-h-[320px] relative overflow-hidden group">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(177,74,237,0.04), transparent 60%)' }} />
            <div className="w-16 h-16 rounded flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-110"
              style={{ background: 'rgba(177,74,237,0.05)', border: '1px solid rgba(177,74,237,0.15)' }}>
              <Target className="w-8 h-8" style={{ color: 'rgba(177,74,237,0.5)' }} />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="font-orbitron font-black text-xl tracking-tight" style={{ color: 'rgba(255,255,255,0.7)' }}>MISSION HUB</div>
              <p className="font-rajdhani text-sm leading-relaxed max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Daily objectives and high-stakes coding missions. Complete to earn massive XP multipliers.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded relative z-10" style={{ background: 'rgba(255,45,85,0.06)', border: '1px solid rgba(255,45,85,0.15)' }}>
              <Lock className="w-3.5 h-3.5" style={{ color: 'rgba(255,45,85,0.5)' }} />
              <span className="text-[8px] font-mono-sv tracking-widest" style={{ color: 'rgba(255,45,85,0.5)' }}>ENCRYPTED — COMING SOON</span>
            </div>
          </CornerCard>
        </div>

        {/* ══════════════════════════════════
            QUICK SYNC BUTTON
        ══════════════════════════════════ */}
        <div className="flex justify-center pb-8" style={fade(360)}>
          <button
            onClick={() => user && fetchAndSyncGitHub(user)}
            disabled={syncing}
            className="flex items-center gap-3 px-8 py-4 font-orbitron font-black text-sm tracking-widest transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(0,255,102,0.06)',
              border: '1px solid rgba(0,255,102,0.25)',
              color: '#00FF66',
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            }}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'SYNCING...' : 'RESYNC GITHUB'}
          </button>
        </div>

      </div>
    </main>
  )
}