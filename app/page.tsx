'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { signInWithGitHub } from '../utils/auth'
import { 
  Flame, 
  Trophy, 
  LayoutDashboard, 
  Zap, 
  Target, 
  ShieldCheck, 
  ChevronRight,
  Github,
  Award,
  Gamepad2,
  Sword,
  Shield,
  Star,
  Skull,
  Crosshair,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Heart,
  Wifi,
  Battery,
  Clock
} from 'lucide-react'

/* ─── DATA ────────────────────────────────────────────────── */

const FEATURES = [
  { icon: <Flame className="w-7 h-7" />, title: 'STREAK SYSTEM', desc: 'Sync your GitHub commits. Miss a day, and your flame dies. Stay consistent or reset to zero.', color: '#FF6B35', xp: '+500 XP' },
  { icon: <Trophy className="w-7 h-7" />, title: 'GLOBAL ARENA', desc: 'Compete with top-tier developers. Climb the rankings and claim your legendary status.', color: '#00FF66', xp: '+750 XP' },
  { icon: <LayoutDashboard className="w-7 h-7" />, title: 'ACTIVITY HUB', desc: 'Visualize your grind with high-fidelity heatmaps and real-time contribution tracking.', color: '#00E5FF', xp: '+300 XP' },
  { icon: <Zap className="w-7 h-7" />, title: 'INSTANT SYNC', desc: 'Zero-latency GitHub integration. Your commits are tracked and logged the second you push.', color: '#B14AED', xp: '+200 XP' },
  { icon: <Target className="w-7 h-7" />, title: 'ELITE MISSIONS', desc: 'Take on daily coding challenges. Complete objectives to earn massive XP multipliers.', color: '#FF2D55', xp: '+1000 XP' },
  { icon: <ShieldCheck className="w-7 h-7" />, title: 'STREAK SHIELDS', desc: 'Forge shields through consistent performance. Protect your progress on critical off-days.', color: '#00E5FF', xp: '+400 XP' },
]

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Cyber_Dev',    streak: 452, level: 99, xp: 98450, medal: '👑', class: 'MYTHIC',  hp: 100 },
  { rank: 2, name: 'Zero_One',     streak: 389, level: 85, xp: 72100, medal: '⚡', class: 'LEGEND',  hp: 88 },
  { rank: 3, name: 'Pixel_Knight', streak: 312, level: 72, xp: 58900, medal: '🔥', class: 'ELITE',   hp: 74 },
  { rank: 4, name: 'Byte_Shifter', streak: 284, level: 65, xp: 44200, medal: '⚔️', class: 'VETERAN', hp: 62 },
  { rank: 5, name: 'Null_Ptr',     streak: 198, level: 48, xp: 31500, medal: '🛡️', class: 'SOLDIER', hp: 48 },
]

const BADGES = [
  { days: 7,   label: 'INITIATE',  rarity: 'COMMON',    color: '#00E5FF', glow: 'rgba(0,229,255,0.4)',   icon: <Star className="w-10 h-10" />,   desc: 'First blood achieved.' },
  { days: 30,  label: 'VETERAN',   rarity: 'RARE',      color: '#B14AED', glow: 'rgba(177,74,237,0.4)',  icon: <Zap className="w-10 h-10" />,    desc: 'A month of pure grind.' },
  { days: 100, label: 'ELITE',     rarity: 'EPIC',      color: '#FF6B35', glow: 'rgba(255,107,53,0.4)',  icon: <Shield className="w-10 h-10" />, desc: 'Triple digits. Respect.' },
  { days: 365, label: 'LEGEND',    rarity: 'LEGENDARY', color: '#FFD700', glow: 'rgba(255,215,0,0.5)',   icon: <Trophy className="w-10 h-10" />, desc: 'A full year. Unmatchable.' },
]

const CLASS_COLORS: Record<string, string> = {
  MYTHIC: '#FFD700', LEGEND: '#FF6B35', ELITE: '#B14AED', VETERAN: '#00FF66', SOLDIER: '#00E5FF'
}

/* ─── HELPERS ─────────────────────────────────────────────── */

function XPBar({ value, max, color, height = 8 }: { value: number; max: number; color: string; height?: number }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="relative w-full rounded-sm overflow-hidden" style={{ height, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div
        className="h-full rounded-sm transition-all duration-1000 relative overflow-hidden"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
      >
        <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', backgroundSize: '200% 100%' }} />
      </div>
    </div>
  )
}

function PixelBorder({ children, color = '#00FF66', className = '' }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{
      background: 'rgba(0,0,0,0.7)',
      border: `1px solid ${color}33`,
      boxShadow: `0 0 0 1px ${color}11, inset 0 0 30px ${color}05`,
      clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
    }}>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3" style={{ borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div className="absolute top-0 right-0 w-3 h-3" style={{ borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
      <div className="absolute bottom-0 left-0 w-3 h-3" style={{ borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div className="absolute bottom-0 right-0 w-3 h-3" style={{ borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
      {children}
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center px-5 py-3 rounded" style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${color}33` }}>
      <span className="text-[9px] font-mono tracking-widest uppercase mb-1" style={{ color: `${color}99` }}>{label}</span>
      <span className="text-xl font-black font-mono" style={{ color }}>{value}</span>
    </div>
  )
}

function FloatingXP({ show, xp }: { show: boolean; xp: string }) {
  return (
    <div className={`absolute -top-4 right-4 font-mono font-black text-sm transition-all duration-700 pointer-events-none z-20 ${show ? 'opacity-100 -translate-y-4' : 'opacity-0 translate-y-0'}`} style={{ color: '#FFD700', textShadow: '0 0 10px #FFD700' }}>
      {xp}
    </div>
  )
}

/* ─── MAIN ────────────────────────────────────────────────── */

export default function Home() {
  const [user, setUser]           = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [show, setShow]           = useState(false)
  const [muted, setMuted]         = useState(true)
  const [xpPop, setXpPop]         = useState<number | null>(null)
  const [totalXP, setTotalXP]     = useState(2450)
  const [playerLevel, setPlayer]  = useState(12)
  const [scanline, setScanline]   = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { setUser(user); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    const t = setTimeout(() => setShow(true), 100)
    return () => { subscription.unsubscribe(); clearTimeout(t) }
  }, [])

  const handleFeatureHover = (i: number) => {
    setXpPop(i)
    setTotalXP(p => p + 5)
    setTimeout(() => setXpPop(null), 800)
  }

  const fade = (delay = '') =>
    `transition-all duration-1000 ease-out ${delay} ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`

  return (
    <main className="min-h-screen relative overflow-x-hidden" style={{ background: '#030508', fontFamily: "'Share Tech Mono', monospace" }}>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        .font-orbitron { font-family: 'Orbitron', monospace; }
        .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
        .font-mono-sv  { font-family: 'Share Tech Mono', monospace; }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0%,19%,21%,23%,25%,54%,56%,100% { opacity: 1; }
          20%,24%,55% { opacity: 0.6; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px currentColor; }
          50%       { box-shadow: 0 0 20px currentColor, 0 0 40px currentColor; }
        }
        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes float-up {
          0%   { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-30px); }
        }
        @keyframes matrix-rain {
          0%   { transform: translateY(-100%); opacity: 1; }
          80%  { opacity: 0.5; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes hp-drain {
          0%   { width: 100%; }
          100% { width: var(--hp-pct); }
        }
        @keyframes rotate-border {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes glitch {
          0%,100% { transform: translate(0); clip-path: none; }
          20%     { transform: translate(-2px, 2px); clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%); }
          40%     { transform: translate(2px, -2px); clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); }
          60%     { transform: translate(-1px, 1px); }
          80%     { transform: translate(1px); }
        }
        .animate-scanline   { animation: scanline 8s linear infinite; }
        .animate-flicker    { animation: flicker 3s infinite; }
        .animate-shimmer    { animation: shimmer 2s linear infinite; background-size: 200% 100%; }
        .animate-blink      { animation: blink 1s step-end infinite; }
        .animate-glitch     { animation: glitch 4s infinite; }
        .hover-lift         { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover   { transform: translateY(-4px) scale(1.01); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track  { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb  { background: #00FF6655; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #00FF66; }
      `}</style>

      {/* ── SCANLINE OVERLAY ── */}
      {scanline && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="animate-scanline absolute inset-x-0 h-32" style={{ background: 'linear-gradient(transparent, rgba(0,255,102,0.03), transparent)', top: 0 }} />
          <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)', pointerEvents: 'none' }} />
        </div>
      )}

      {/* ── BG EFFECTS ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,255,102,0.04) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(177,74,237,0.04) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,255,102,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Matrix columns */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute top-0 w-px opacity-10" style={{ left: `${10 + i * 12}%`, height: '100%', background: `linear-gradient(180deg, transparent, #00FF66, transparent)`, animation: `matrix-rain ${4 + i * 0.7}s linear ${i * 0.5}s infinite` }} />
        ))}
      </div>

      <div className="relative z-10">

        {/* ══════════════════════════════════════════ */}
        {/* ──────────────  HERO  ─────────────────── */}
        {/* ══════════════════════════════════════════ */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative pt-12">

          {/* PLAYER STATUS CARD */}
          <div className={`${fade()} mb-12`}>
            <PixelBorder color="#00FF66" className="inline-flex items-center gap-6 px-8 py-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full opacity-75" style={{ background: '#00FF66' }} />
                  <span className="relative rounded-full h-2 w-2" style={{ background: '#00FF66' }} />
                </span>
                <span className="text-[9px] font-mono-sv tracking-[0.4em]" style={{ color: '#00FF66' }}>SERVER: ONLINE</span>
              </div>
              <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-[9px] font-mono-sv tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.4)' }}>10,241 PLAYERS IN ARENA</span>
              <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-[9px] font-mono-sv tracking-[0.3em]" style={{ color: '#FFD700' }}>SEASON 04 ACTIVE</span>
            </PixelBorder>
          </div>

          {/* HERO TITLE */}
          <div className={`${fade('delay-100')} mb-6 max-w-5xl`}>
            <div className="text-[9px] font-mono-sv tracking-[0.6em] mb-6" style={{ color: 'rgba(0,229,255,0.6)' }}>
              ▶ INITIALIZE SEQUENCE: DEVELOPER_PROTOCOL_v4.0
            </div>
            <h1 className="font-orbitron font-black leading-none mb-4" style={{ fontSize: 'clamp(48px, 10vw, 120px)', letterSpacing: '-0.02em' }}>
              <span className="block" style={{ color: '#fff', textShadow: '0 0 60px rgba(255,255,255,0.1)' }}>COMMIT OR</span>
              <span className="block animate-glitch" style={{ color: '#FF2D55', textShadow: '0 0 40px rgba(255,45,85,0.6), 0 0 80px rgba(255,45,85,0.3)' }}>PERISH.</span>
            </h1>
            <div className="font-orbitron font-black leading-none" style={{ fontSize: 'clamp(32px, 6vw, 72px)' }}>
              <span style={{ background: 'linear-gradient(90deg, #00FF66, #00E5FF, #B14AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                CONQUER THE VERSE.
              </span>
            </div>
          </div>

          {/* SUB TEXT */}
          <p className={`${fade('delay-200')} text-lg md:text-xl max-w-2xl leading-relaxed mb-14 font-rajdhani font-medium`} style={{ color: 'rgba(255,255,255,0.4)' }}>
            StreakVerse is the ultimate proving ground for developers. Sync your GitHub, build lethal streaks, and climb the global ranks of the elite.
          </p>

          {/* PLAYER STATS MINI HUD */}
          <div className={`${fade('delay-250')} flex flex-wrap justify-center gap-4 mb-12`}>
            {(!user ? [
              { label: 'CURRENT STREAK', value: '0 DAYS', color: '#FF6B35' },
              { label: 'GLOBAL RANK',    value: '#—',      color: '#B14AED' },
              { label: 'TOTAL XP',       value: '0',       color: '#FFD700' },
              { label: 'TIER',           value: 'ROOKIE',  color: '#00E5FF' },
            ] : [
              { label: 'CURRENT STREAK', value: `${user?.user_metadata?.streak || 0} DAYS`, color: '#FF6B35' },
              { label: 'GLOBAL RANK',    value: `#${user?.user_metadata?.rank || '—'}`,      color: '#B14AED' },
              { label: 'TOTAL XP',       value: user?.user_metadata?.total_xp || '0',       color: '#FFD700' },
              { label: 'TIER',           value: user?.user_metadata?.tier || 'ROOKIE',       color: '#00E5FF' },
            ]).map((s, i) => (
              <StatChip key={i} label={s.label} value={s.value} color={s.color} />
            ))}
          </div>

          {/* CTA BUTTONS */}
          <div className={`${fade('delay-300')} flex flex-col sm:flex-row gap-5 justify-center w-full max-w-xl px-4`}>
            {!loading && user ? (
              <Link href="/dashboard" className="group relative flex items-center justify-center gap-3 px-8 py-4 font-orbitron font-black text-sm tracking-widest hover-lift overflow-hidden" style={{ background: 'linear-gradient(135deg, #00FF66, #00cc52)', color: '#000', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #00ff8855, #00FF66)' }} />
                <Gamepad2 className="w-5 h-5 relative z-10" />
                <span className="relative z-10">ENTER ARSENAL</span>
                <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button onClick={signInWithGitHub} disabled={loading} className="group relative flex items-center justify-center gap-3 px-8 py-4 font-orbitron font-black text-sm tracking-widest hover-lift overflow-hidden" style={{ background: 'linear-gradient(135deg, #00FF66, #00cc52)', color: '#000', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))', opacity: loading ? 0.6 : 1 }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '#00ff8855' }} />
                <Github className="w-5 h-5 relative z-10" />
                <span className="relative z-10">INITIALIZE CORE</span>
                <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            <Link href="/leaderboard" className="group flex items-center justify-center gap-3 px-8 py-4 font-orbitron font-black text-sm tracking-widest hover-lift" style={{ border: '1px solid rgba(255,107,53,0.4)', color: '#FF6B35', background: 'rgba(255,107,53,0.05)', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
              <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>GLOBAL RANKINGS</span>
            </Link>
          </div>

          {/* SCROLL CUE */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
            <span className="text-[9px] font-mono-sv tracking-[0.5em]">SCROLL</span>
            <ChevronDown className="w-4 h-4 animate-bounce" style={{ color: '#00FF66' }} />
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* ─────────────  STATS BAR  ──────────────── */}
        {/* ══════════════════════════════════════════ */}
        

        {/* ══════════════════════════════════════════ */}
        {/* ──────────────  MISSIONS  ──────────────── */}
        {/* ══════════════════════════════════════════ */}
        <section className="py-40 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <GameSectionLabel color="#00E5FF" tag="CORE_MISSIONS_v1">HOW TO SURVIVE</GameSectionLabel>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              {[
                { n: '01', title: 'CONNECT CORE',  icon: <Zap className="w-7 h-7" />,       color: '#00FF66', desc: 'Link your GitHub identity. Our system monitors your activity in real-time across all repositories.', reward: '500 XP', difficulty: 'EASY' },
                { n: '02', title: 'DAILY GRIND',   icon: <Crosshair className="w-7 h-7" />, color: '#FF6B35', desc: 'Push code daily. Each commit strengthens your streak. Let the flame die, and lose your rank.', reward: '150 XP/day', difficulty: 'MEDIUM' },
                { n: '03', title: 'RANK UP',        icon: <Award className="w-7 h-7" />,     color: '#B14AED', desc: 'Climb the global arena. Earn elite badges, unlock shields, and establish your legacy.', reward: '2000 XP', difficulty: 'HARD' },
              ].map((m, idx) => (
                <PixelBorder key={idx} color={m.color} className="group cursor-default hover-lift p-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 50%, ${m.color}08, transparent 70%)` }} />
                  {/* Mission header */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-5xl font-orbitron font-black" style={{ color: `${m.color}15` }}>{m.n}</span>
                    <div className="flex items-center gap-2 px-3 py-1 rounded" style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${m.color}33` }}>
                      <span className="text-[8px] font-mono-sv tracking-widest" style={{ color: `${m.color}88` }}>DIFF:</span>
                      <span className="text-[8px] font-mono-sv font-black tracking-widest" style={{ color: m.color }}>{m.difficulty}</span>
                    </div>
                  </div>
                  {/* Icon */}
                  <div className="w-14 h-14 rounded flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110" style={{ background: `${m.color}15`, border: `1px solid ${m.color}33`, color: m.color }}>
                    {m.icon}
                  </div>
                  <h3 className="font-orbitron font-black text-xl mb-4 tracking-tight group-hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.85)' }}>{m.title}</h3>
                  <p className="font-rajdhani text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>{m.desc}</p>
                  {/* Reward bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5" style={{ color: '#FFD700' }} />
                      <span className="text-[9px] font-mono-sv tracking-widest" style={{ color: '#FFD700' }}>REWARD: {m.reward}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: m.color }} />
                  </div>
                </PixelBorder>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* ─────────────  ARSENAL  ────────────────── */}
        {/* ══════════════════════════════════════════ */}
        <section className="py-40 px-6 lg:px-12 relative" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(177,74,237,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(177,74,237,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="max-w-6xl mx-auto relative z-10">
            <GameSectionLabel color="#B14AED" tag="ARSENAL_LOADOUT_v2">ELITE UTILITIES</GameSectionLabel>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="group relative p-7 cursor-default hover-lift overflow-hidden"
                  style={{ background: 'rgba(5,8,12,0.8)', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.3s ease' }}
                  onMouseEnter={() => handleFeatureHover(i)}
                >
                  <FloatingXP show={xpPop === i} xp={f.xp} />
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 30% 30%, ${f.color}08, transparent 60%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${f.color}66, transparent)` }} />
                  {/* Icon */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-13 h-13 w-14 h-14 rounded flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: `${f.color}15`, border: `1px solid ${f.color}30`, color: f.color }}>
                      {f.icon}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[7px] font-mono-sv tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>UNLOCK XP</span>
                      <span className="text-xs font-orbitron font-black" style={{ color: '#FFD700' }}>{f.xp}</span>
                    </div>
                  </div>
                  <h3 className="font-orbitron font-black text-sm tracking-wider mb-3 transition-colors" style={{ color: 'rgba(255,255,255,0.85)' }}>{f.title}</h3>
                  <p className="font-rajdhani text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>{f.desc}</p>
                  {/* Locked indicator */}
                  <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3" style={{ color: `${f.color}66` }} />
                    <span className="text-[8px] font-mono-sv tracking-widest" style={{ color: `${f.color}66` }}>UNLOCK AFTER LOGIN</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════ */}
        {/* ─────────────  BADGES  ─────────────────── */}
        {/* ══════════════════════════════════════════ */}
        <section className="py-40 px-6 lg:px-12" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="max-w-6xl mx-auto">
            <GameSectionLabel color="#B14AED" tag="RANK_REWARDS_SYSTEM">FORGE YOUR LEGACY</GameSectionLabel>
            <p className="text-center font-rajdhani text-lg mb-20 mt-6 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Unlock high-tier cosmetic badges and profile prestige as you maintain your streaks. From Initiate to Legend, every day counts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {BADGES.map((b, i) => (
                <div key={i} className="group relative cursor-default hover-lift flex flex-col items-center gap-7 p-8" style={{ background: 'rgba(3,5,8,0.9)', border: `1px solid ${b.color}22` }}>
                  {/* Rarity glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(circle at 50% 30%, ${b.color}10, transparent 60%)` }} />
                  {/* Rarity tag */}
                  <div className="self-end text-[7px] font-mono-sv tracking-widest px-2 py-1 rounded" style={{ background: `${b.color}15`, border: `1px solid ${b.color}33`, color: b.color }}>
                    ◆ {b.rarity}
                  </div>
                  {/* Badge icon */}
                  <div className="relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110" style={{ background: `radial-gradient(circle, ${b.color}15, transparent)`, border: `2px solid ${b.color}33`, boxShadow: `0 0 0 4px ${b.color}11` }}>
                    {/* Spinning border */}
                    <div className="absolute inset-[-4px] rounded-full border border-dashed opacity-20 group-hover:opacity-50 transition-opacity" style={{ borderColor: b.color, animation: 'rotate-border 8s linear infinite' }} />
                    <div style={{ color: b.color }}>{b.icon}</div>
                  </div>
                  {/* Days count */}
                  <div className="font-orbitron font-black text-4xl" style={{ color: b.color, textShadow: `0 0 20px ${b.glow}` }}>{b.days}<span className="text-xl">D</span></div>
                  {/* Label */}
                  <div className="text-center space-y-2">
                    <div className="font-orbitron font-black text-sm tracking-widest" style={{ color: 'rgba(255,255,255,0.8)' }}>{b.label}</div>
                    <div className="text-[9px] font-mono-sv" style={{ color: 'rgba(255,255,255,0.3)' }}>{b.desc}</div>
                  </div>
                  {/* XP reward */}
                  <div className="w-full">
                    <XPBar value={i + 1} max={4} color={b.color} height={3} />
                    <div className="flex justify-between mt-1">
                      <span className="text-[7px] font-mono-sv" style={{ color: 'rgba(255,255,255,0.2)' }}>POWER LEVEL</span>
                      <span className="text-[7px] font-mono-sv" style={{ color: b.color }}>{'★'.repeat(i + 1)}{'☆'.repeat(3 - i)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* ──────────────  FINAL CTA  ─────────────── */}
        {/* ══════════════════════════════════════════ */}
        <section className="py-48 px-6 relative overflow-hidden" style={{ borderTop: '1px solid rgba(0,255,102,0.08)' }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(0,255,102,0.04) 0%, transparent 70%)' }} />
          {/* Animated grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="absolute inset-x-0 h-px" style={{ top: `${30 + i * 20}%`, background: `linear-gradient(90deg, transparent, rgba(0,255,102,${0.05 - i * 0.01}), transparent)` }} />
            ))}
          </div>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            {/* Terminal prompt */}
            <div className="inline-flex items-center gap-3 mb-10 px-6 py-3 rounded" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,102,0.2)', fontFamily: 'Share Tech Mono' }}>
              <span style={{ color: '#00FF66' }}>$</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>streakverse --initialize --player=YOU</span>
              <span className="animate-blink" style={{ color: '#00FF66' }}>█</span>
            </div>

            <h2 className="font-orbitron font-black mb-8 leading-none" style={{ fontSize: 'clamp(40px, 8vw, 80px)' }}>
              YOUR TIME IS{' '}
              <span style={{ color: '#00FF66', textShadow: '0 0 40px rgba(0,255,102,0.6)' }}>NOW.</span>
            </h2>

            <p className="font-rajdhani text-xl mb-14 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Don't let another day slip by. Connect your core, initialize your streak, and join the ranks of the elite.
            </p>

            <div className="flex flex-col items-center gap-8">
              {!loading && user ? (
                <Link href="/dashboard" className="group relative flex items-center gap-4 px-12 py-5 font-orbitron font-black text-base tracking-widest transition-all hover:scale-105 overflow-hidden" style={{ background: 'linear-gradient(135deg, #00FF66, #00cc52)', color: '#000', clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}>
                  ACCESS ARSENAL <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              ) : (
                <button onClick={signInWithGitHub} disabled={loading} className="group relative flex items-center gap-4 px-12 py-5 font-orbitron font-black text-base tracking-widest transition-all hover:scale-105 overflow-hidden" style={{ background: 'linear-gradient(135deg, #00FF66, #00cc52)', color: '#000', clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))', opacity: loading ? 0.6 : 1 }}>
                  INITIALIZE CORE <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              )}
              <div className="flex flex-wrap justify-center items-center gap-6 text-[9px] font-mono-sv tracking-[0.4em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <span className="flex items-center gap-2"><Unlock className="w-3 h-3" /> PERMANENT LICENSE</span>
                <span>◆</span>
                <span>ZERO COST</span>
                <span>◆</span>
                <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> VERIFIED CORE</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* ───────────────  FOOTER  ───────────────── */}
        {/* ══════════════════════════════════════════ */}
        <footer className="py-20 px-6 lg:px-12 relative" style={{ background: 'rgba(0,0,0,0.8)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start justify-between gap-16">
              {/* Brand */}
              <div className="flex flex-col gap-5">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded" style={{ background: 'rgba(0,255,102,0.1)', border: '1px solid rgba(0,255,102,0.3)' }}>
                    <Skull className="w-4 h-4" style={{ color: '#00FF66' }} />
                  </div>
                  <span className="font-orbitron font-black text-xl tracking-wider" style={{ color: '#00FF66' }}>STREAK<span style={{ color: '#fff' }}>VERSE</span></span>
                </Link>
                <p className="font-rajdhani text-sm max-w-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  The ultimate competitive layer for the global developer collective. Track consistency, earn prestige, dominate the verse.
                </p>
                <div className="text-[9px] font-mono-sv tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>
                  BUILD v4.0.1 · ENGINE: NEXT.JS
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-20">
                <div className="flex flex-col gap-5">
                  <span className="text-[9px] font-mono-sv tracking-[0.5em] pb-2" style={{ color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>SUBSYSTEMS</span>
                  {[['RANKINGS', '/leaderboard'], ['ARSENAL', '/dashboard']].map(([label, href]) => (
                    <Link key={label} href={href} className="text-[10px] font-mono-sv tracking-widest transition-all hover:translate-x-1" style={{ color: 'rgba(255,255,255,0.3)' }}
                      onMouseEnter={el => { (el.currentTarget as HTMLElement).style.color = '#00FF66' }}
                      onMouseLeave={el => { (el.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)' }}
                    >▶ {label}</Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-[8px] font-mono-sv tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.15)' }}>© 2026 STREAKVERSE OS. ALL RIGHTS RESERVED.</span>
            </div>
          </div>
        </footer>

      </div>
    </main>
  )
}

/* ─── REUSABLE SECTION LABEL ────────────────────────────── */
function GameSectionLabel({ children, color = '#00FF66', tag = '' }: { children: React.ReactNode; color?: string; tag?: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-4 mb-5">
        <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(90deg, transparent, ${color}44)` }} />
        <span className="text-[8px] font-mono-sv tracking-[0.6em]" style={{ color: `${color}88` }}>// {tag}</span>
        <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
      </div>
      <h2 className="font-orbitron font-black leading-tight" style={{ fontSize: 'clamp(28px, 5vw, 56px)', color: '#fff', letterSpacing: '-0.02em' }}>{children}</h2>
    </div>
  )
}