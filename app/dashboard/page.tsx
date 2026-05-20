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

import { getTierFromXP, LEVELS, ProfileData } from '../../lib/streakUtils'

/* ─────────────────────────────────────────────
   TYPE DEFINITIONS
───────────────────────────────────────────── */
interface UserProfile extends ProfileData {
  streak?: number // fallback
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/** Progress percentage inside current level (0–100) */
function xpProgress(xp: number, level: any) {
  const currentLevelXP = level.minXP
  const nextLevelXP    = level.maxXP === Infinity ? level.minXP + 1000 : level.maxXP
  return Math.min(100, ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)
}

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
    let mounted = true
    let authSub: any = null

    const initialize = async () => {
      try {
        // 1. Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (!session?.user) {
          router.push('/')
          return
        }

        const user = session.user
        setUser(user)

        // 2. Load existing profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (mounted && profileData) {
          setProfile(profileData)
        }

        // 3. Background Sync
        if (user?.user_metadata?.user_name) {
          fetchAndSyncGitHub(user, profileData)
        }

        // 4. Listen for changes (only after initial load)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
          if (!mounted) return
          if (event === 'SIGNED_OUT') {
            router.push('/')
            return
          }
          if (s?.user) setUser(s.user)
        })
        authSub = subscription

      } catch (err) {
        console.error('Initialization error:', err)
      } finally {
        if (mounted) {
          setLoading(false)
          setTimeout(() => { if (mounted) setShow(true) }, 80)
        }
      }
    }

    initialize()

    return () => { 
      mounted = false 
      if (authSub) authSub.unsubscribe()
    }
  }, [router])

  /* ── GITHUB SYNC ── */
  const fetchAndSyncGitHub = async (u: any, currentProfile?: any) => {
    if (syncing) return
    setSyncing(true)
    setSyncMsg('CONNECTING TO GITHUB...')
    try {
      const username = u?.user_metadata?.user_name
      const res = await fetch(
        `https://api.github.com/users/${username}/events?per_page=100`
      )

      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)

      const data = await res.json()
      const pushEvents = Array.isArray(data)
        ? data.filter((e: any) => e.type === 'PushEvent')
        : []

      console.log('[Sync] Total events:', data.length, '| PushEvents:', pushEvents.length)

      if (pushEvents.length === 0) {
        setSyncMsg('NO PUBLIC PUSH EVENTS FOUND — PRIVATE REPOS NOT TRACKED')
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const todayPushes = pushEvents.filter(
        (e: any) => e.created_at.split('T')[0] === today
      )

      console.log('[Sync] Today pushes:', todayPushes.length)

      await updateProfile(u, pushEvents, currentProfile || profile)

      setSyncMsg(
        todayPushes.length > 0
          ? `SYNCED ✓ — ${todayPushes.length} PUSH EVENT(S) TODAY`
          : 'SYNCED ✓ — NO PUSHES TODAY (STREAK MAINTAINED)'
      )
    } catch (e: any) {
      console.error('GitHub sync error:', e.message)
      setSyncMsg('SYNC_FAILED: ' + e.message)
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(''), 6000)
    }
  }

  /* ── PROFILE UPDATE ── */
  const updateProfile = async (u: any, pushEvents: any[], currentProfile?: any) => {
    try {
      const username   = u?.user_metadata?.user_name || u?.user_metadata?.full_name || 'anonymous'
      const avatar_url = u?.user_metadata?.avatar_url || ''
      const existing   = currentProfile || profile  // existing DB profile

      // ── Step 1: Get all unique commit dates, sorted oldest → newest ───────
      const commitDates: string[] = [
        ...new Set(
          pushEvents
            .filter((e: any) => e.type === 'PushEvent')
            .map((e: any) => e.created_at.split('T')[0])
        ),
      ].sort()

      if (commitDates.length === 0) {
        console.log('[Sync] No commit dates found in push events')
        return
      }

      console.log('[Sync] Commit dates from GitHub:', commitDates)
      console.log('[Sync] Existing profile:', existing)

      // ── Step 2: Seed state from existing profile ──────────────────────────
      // XP carries over — we only ADD xp for dates not yet counted.
      // Streak is recalculated fresh from GitHub dates (always accurate).
      const existingXP          = existing?.xp            ?? 0
      const existingLastDate    = existing?.last_commit_date ?? null

      // Dates that are strictly newer than what we've already processed
      const newDates = existingLastDate
        ? commitDates.filter((d: string) => d > existingLastDate)
        : commitDates

      console.log('[Sync] New dates to add XP for:', newDates)

      // ── Step 3: Recalculate streak from ALL dates (always fresh) ──────────
      let currentStreak = 0
      let longestStreak = existing?.longest_streak ?? 0
      let shields       = existing?.streak_shields  ?? 0
      let lastDate: string | null = null

      for (const date of commitDates) {
        if (!lastDate) {
          currentStreak = 1
        } else {
          const daysDiff = Math.round(
            (new Date(date).getTime() - new Date(lastDate).getTime()) / 86_400_000
          )
          if (daysDiff === 0) continue          // same day, skip
          else if (daysDiff === 1) currentStreak++ // consecutive
          else currentStreak = 1                // gap — reset
        }

        if (currentStreak > longestStreak) longestStreak = currentStreak
        lastDate = date
      }

      // Streak decay — if last commit wasn't today or yesterday
      const today     = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
      if (lastDate && lastDate !== today && lastDate !== yesterday) {
        currentStreak = 0
      }

      // ── Step 4: Add XP only for NEW dates ────────────────────────────────
      let addedXP = 0

      // First-time user bonus
      if (!existing) addedXP += 25

      for (const date of newDates) {
        addedXP += 10  // +10 XP per new commit day

        // We need streak value at this date for milestone bonuses
        // Recalculate streak up to this date
        let streakAtDate = 0
        let prev: string | null = null
        for (const d of commitDates) {
          if (d > date) break
          if (!prev) { streakAtDate = 1 }
          else {
            const diff = Math.round(
              (new Date(d).getTime() - new Date(prev).getTime()) / 86_400_000
            )
            if (diff === 0) { prev = d; continue }
            else if (diff === 1) streakAtDate++
            else streakAtDate = 1
          }
          prev = d
        }

        if (streakAtDate === 5)  addedXP += 10
        if (streakAtDate === 10) addedXP += 20
        if (streakAtDate === 30) addedXP += 50

        // Shield every 7 days (max 3) — only for new dates
        if (streakAtDate > 0 && streakAtDate % 7 === 0) {
          shields = Math.min(3, shields + 1)
        }
      }

      const xp        = existingXP + addedXP
      const rankScore = xp + currentStreak * 5

      console.log('[Sync] Result:', {
        existingXP,
        addedXP,
        xp,
        currentStreak,
        longestStreak,
        shields,
        lastDate,
        rankScore,
      })

      // ── Step 5: Upsert to Supabase ────────────────────────────────────────
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: u.id,
          username,
          avatar_url,
          xp,
          current_streak:   currentStreak,
          longest_streak:   longestStreak,
          streak_shields:   shields,
          last_commit_date: lastDate,
          rank_score:       rankScore,
        })
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      console.log('[Sync] Saved to DB:', data)

    } catch (e: any) {
      console.error('Profile update error:', e.message)
    }
  }

  /* ── LOADING SCREEN ── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#030508', fontFamily: "'Share Tech Mono', monospace" }}>
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-2 border-[#00FF6622] rounded-full" />
          <div className="absolute inset-0 border-t-2 border-[#00FF66] rounded-full animate-spin" />
          <div className="absolute inset-4 border-2 border-[#00E5FF22] rounded-full" />
          <div className="absolute inset-4 border-b-2 border-[#00E5FF] rounded-full animate-spin-slow" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="text-[10px] tracking-[0.6em] text-[#00FF66] animate-pulse">INITIALIZING ARSENAL...</div>
          <div className="text-[8px] tracking-[0.3em] text-white/20">ACCESSING_ENCRYPTED_DATABASE</div>
        </div>
        
        {/* Force entry button if stuck */}
        <button 
          onClick={() => setLoading(false)}
          className="mt-8 px-4 py-2 text-[8px] font-mono-sv tracking-widest text-white/30 hover:text-white/60 transition-colors border border-white/10 rounded"
        >
          FORCE_INITIALIZATION [DEBUG]
        </button>
      </div>
    )
  }

  if (!user) return null

  /* ── DERIVED VALUES ── */
  const streak  = profile?.current_streak ?? 0
  const longest = profile?.longest_streak ?? 0
  const xp      = profile?.xp ?? 0
  const tierInfo = getTierFromXP(xp)
  const tierColor = tierInfo.color
  const xpPct   = xpProgress(xp, tierInfo)
  const shields = profile?.streak_shields ?? 0
  const rankScore = profile?.rank_score ?? 0
  const lastSync = profile?.last_commit_date ? new Date(profile.last_commit_date).toLocaleDateString() : 'NEVER'
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
                  <span className="text-[8px] font-mono-sv tracking-widest" style={{ color: `${tierColor}88` }}>TIER</span>
                  <span className="text-sm font-orbitron font-black" style={{ color: tierColor }}>{tierInfo.name}</span>
                </div>
              </div>

              {/* NAME + XP BAR */}
              <div className="flex-1 text-center md:text-left space-y-4 w-full">
                <div>
                  <div className="text-[9px] font-mono-sv tracking-[0.6em] mb-2" style={{ color: 'rgba(0,229,255,0.5)' }}>
                    ▶ PLAYER_IDENTITY_VERIFIED | LAST_SYNC: {lastSync}
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
                    ◆ RANK_SCORE: {rankScore}
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] font-mono-sv tracking-widest px-3 py-1.5 rounded" style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF' }}>
                    <Github className="w-3 h-3" /> @{githubName}
                  </span>
                  <div className="w-full md:w-auto text-[8px] font-mono-sv text-white/20 mt-1 md:mt-0 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> ONLY PUBLIC COMMITS ARE TRACKED CURRENTLY
                  </div>
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
                    <span className="text-[8px] font-mono-sv tracking-widest" style={{ color: 'rgba(255,215,0,0.6)' }}>XP PROGRESS → NEXT TIER</span>
                    <span className="text-[8px] font-mono-sv" style={{ color: '#FFD700' }}>{xp} XP</span>
                  </div>
                  <XPBar value={xp - tierInfo.minXP} max={tierInfo.maxXP === Infinity ? 1000 : tierInfo.maxXP - tierInfo.minXP} color="#FFD700" height={7} />
                  <div className="text-[8px] font-mono-sv" style={{ color: 'rgba(255,255,255,0.2)' }}>{Math.round(xpPct)}% TO NEXT TIER</div>
                </div>
              </div>

              {/* MANUAL SYNC BUTTON */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => user && fetchAndSyncGitHub(user)}
                  disabled={syncing}
                  className="flex items-center gap-2 px-5 py-3 text-[9px] font-mono-sv tracking-widest shrink-0 transition-all hover:scale-105"
                  style={{ border: '1px solid rgba(0,255,102,0.2)', color: syncing ? '#00FF66' : 'rgba(0,255,102,0.5)', background: 'rgba(0,255,102,0.04)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'SYNCING...' : 'MANUAL_SYNC'}
                </button>

                <button
                  onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
                  className="flex items-center gap-2 px-5 py-3 text-[9px] font-mono-sv tracking-widest shrink-0 transition-all hover:scale-105"
                  style={{ border: '1px solid rgba(255,45,85,0.2)', color: 'rgba(255,45,85,0.5)', background: 'rgba(255,45,85,0.04)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  TERMINATE
                </button>
              </div>
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
            sub={`RANK_SCORE: ${rankScore}`}
            icon={<Zap className="w-5 h-5" />}
            color="#B14AED"
          />
          <StatCard
            label="CURRENT STREAK"
            value={`${streak}D`}
            sub={`LONGEST: ${longest}D`}
            icon={<Flame className="w-5 h-5" />}
            color="#FF6B35"
          />
          <StatCard
            label="PLAYER TIER"
            value={tierInfo.name}
            sub={`${shields} SHIELDS ACTIVE`}
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