'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Flame, Moon, Zap, Crown, Medal, Award, Loader2, AlertTriangle, Swords, Shield, Star } from 'lucide-react'

/* ─── unchanged helpers ─── */
function level(xp) { return Math.floor((xp || 0) / 100) + 1 }
function initial(name) { return (name || '?')[0].toUpperCase() }

/* ─── rank configs ─── */
const RANKS = [
  {
    label: 'CHAMPION',
    border: '#FFD700',
    glow: '0 0 24px 4px rgba(255,215,0,0.45), 0 0 48px 8px rgba(255,160,0,0.2)',
    avatarBg: 'linear-gradient(135deg,#7a4800 0%,#ffd700 100%)',
    avatarText: '#1a0a00',
    xpColor: '#FFD700',
    barBg: 'linear-gradient(90deg,#ff8c00,#ffd700)',
    badgeBg: 'linear-gradient(135deg,#7a4800,#ffd700)',
    badgeText: '#1a0a00',
    Icon: Crown,
    scale: 'scale-105 z-10',
    headerBg: 'linear-gradient(180deg,rgba(255,180,0,0.12) 0%,transparent 100%)',
  },
  {
    label: 'ELITE',
    border: '#C0C0C0',
    glow: '0 0 18px 3px rgba(180,180,180,0.3)',
    avatarBg: 'linear-gradient(135deg,#444 0%,#c0c0c0 100%)',
    avatarText: '#111',
    xpColor: '#C0C0C0',
    barBg: 'linear-gradient(90deg,#888,#c0c0c0)',
    badgeBg: 'linear-gradient(135deg,#555,#c0c0c0)',
    badgeText: '#111',
    Icon: Medal,
    scale: '',
    headerBg: 'linear-gradient(180deg,rgba(160,160,160,0.08) 0%,transparent 100%)',
  },
  {
    label: 'WARRIOR',
    border: '#CD7F32',
    glow: '0 0 16px 2px rgba(180,100,30,0.3)',
    avatarBg: 'linear-gradient(135deg,#3d1a00 0%,#cd7f32 100%)',
    avatarText: '#1a0a00',
    xpColor: '#CD7F32',
    barBg: 'linear-gradient(90deg,#7a3a00,#cd7f32)',
    badgeBg: 'linear-gradient(135deg,#5a2900,#cd7f32)',
    badgeText: '#1a0a00',
    Icon: Award,
    scale: '',
    headerBg: 'linear-gradient(180deg,rgba(160,80,20,0.08) 0%,transparent 100%)',
  },
]

/* ─── XP Progress Bar ─── */
function XPBar({ xp, maxXP, barBg }) {
  const pct = maxXP > 0 ? Math.min(100, Math.round((xp / maxXP) * 100)) : 0
  return (
    <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 99, height: 6, width: '100%', overflow: 'hidden', marginTop: 12 }}>
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: barBg,
          borderRadius: 99,
          transition: 'width 1s cubic-bezier(.4,0,.2,1)',
          boxShadow: `0 0 8px 1px rgba(255,200,0,0.4)`,
        }}
      />
    </div>
  )
}

/* ─── Podium Card ─── */
function PodiumCard({ user, rank, maxXP }) {
  const r = RANKS[rank]
  const streak = user.current_streak ?? user.streak ?? 0
  const RIcon = r.Icon
  const lvl = level(user.xp)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), rank * 120 + 80)
    return () => clearTimeout(t)
  }, [rank])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? (rank === 0 ? 'translateY(0) scale(1.05)' : 'translateY(0) scale(1)') : 'translateY(28px) scale(0.97)',
        transition: 'opacity 0.55s ease, transform 0.55s cubic-bezier(.4,0,.2,1)',
        position: 'relative',
        borderRadius: 20,
        border: `1.5px solid ${r.border}`,
        boxShadow: r.glow,
        background: 'linear-gradient(160deg,#181820 0%,#11111a 100%)',
        padding: rank === 0 ? '36px 20px 22px' : '28px 20px 22px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        zIndex: rank === 0 ? 10 : 1,
        overflow: 'hidden',
      }}
    >
      {/* subtle header tint */}
      <div style={{ position: 'absolute', inset: 0, background: r.headerBg, pointerEvents: 'none' }} />

      {/* top badge */}
      <div style={{
        position: 'absolute',
        top: -1,
        left: '50%',
        transform: 'translateX(-50%)',
        background: r.badgeBg,
        color: r.badgeText,
        borderRadius: '0 0 12px 12px',
        padding: '3px 14px 5px',
        fontSize: 9,
        fontFamily: "'Courier New', monospace",
        fontWeight: 900,
        letterSpacing: '0.25em',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
      }}>
        <RIcon size={10} /> {r.label}
      </div>

      {/* avatar */}
      <div style={{
        width: rank === 0 ? 62 : 52,
        height: rank === 0 ? 62 : 52,
        borderRadius: '50%',
        background: r.avatarBg,
        border: `2px solid ${r.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Courier New', monospace",
        fontWeight: 900,
        fontSize: rank === 0 ? 24 : 20,
        color: r.avatarText,
        boxShadow: r.glow,
        marginBottom: 10,
        position: 'relative',
        zIndex: 1,
      }}>
        {initial(user.username)}
        {/* level pip */}
        <div style={{
          position: 'absolute',
          bottom: -4, right: -4,
          background: r.barBg,
          color: '#111',
          borderRadius: 99,
          fontSize: 8,
          fontWeight: 900,
          padding: '2px 6px',
          fontFamily: "'Courier New', monospace",
          letterSpacing: '0.05em',
          border: '1.5px solid #111',
        }}>LV{lvl}</div>
      </div>

      {/* username */}
      <p style={{
        fontFamily: "'Courier New', monospace",
        fontWeight: 900,
        fontSize: 11,
        letterSpacing: '0.2em',
        color: '#eee',
        textTransform: 'uppercase',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginBottom: 4,
      }}>{user.username || 'UNKNOWN'}</p>

      {/* XP value */}
      <p style={{
        fontFamily: "'Courier New', monospace",
        fontWeight: 900,
        fontSize: rank === 0 ? 30 : 24,
        color: r.xpColor,
        textShadow: `0 0 12px ${r.border}88`,
        margin: '6px 0 2px',
        lineHeight: 1,
      }}>{(user.xp || 0).toLocaleString()}</p>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', color: '#555', fontFamily: "'Courier New', monospace", fontWeight: 700 }}>XP</p>

      {/* streak */}
      <div style={{ marginTop: 10 }}>
        {streak > 0 ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,120,0,0.12)',
            border: '1px solid rgba(255,120,0,0.35)',
            borderRadius: 99, padding: '4px 10px',
            fontSize: 9, fontWeight: 900, color: '#ff9520',
            fontFamily: "'Courier New', monospace", letterSpacing: '0.15em',
          }}>
            <Flame size={10} /> {streak}D STREAK
          </span>
        ) : (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 99, padding: '4px 10px',
            fontSize: 9, fontWeight: 900, color: '#555',
            fontFamily: "'Courier New', monospace", letterSpacing: '0.15em',
          }}>
            <Moon size={10} /> DORMANT
          </span>
        )}
      </div>

      {/* xp bar */}
      <div style={{ width: '100%', color: r.xpColor }}>
        <XPBar xp={user.xp || 0} maxXP={maxXP} barBg={r.barBg} />
      </div>
    </div>
  )
}

/* ─── List Row ─── */
function ListRow({ user, rank, delay }) {
  const streak = user.current_streak ?? user.streak ?? 0
  const lvl = level(user.xp)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-16px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'linear-gradient(90deg,#14141e 0%,#111118 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14, padding: '12px 16px',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
      transition: 'opacity 0.4s ease, transform 0.4s ease, border-color 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.background = 'linear-gradient(90deg,#1c1c2a 0%,#14141e 100%)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'linear-gradient(90deg,#14141e 0%,#111118 100%)' }}
    >
      {/* left accent line */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'rgba(255,255,255,0.05)', borderRadius: '14px 0 0 14px' }} />

      {/* rank */}
      <span style={{
        width: 28, textAlign: 'center', flexShrink: 0,
        fontFamily: "'Courier New', monospace", fontWeight: 900,
        fontSize: 12, color: '#333',
      }}>#{rank}</span>

      {/* avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,#1e1e2e,#2a2a3e)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Courier New', monospace", fontWeight: 900,
        fontSize: 13, color: '#888',
      }}>
        {initial(user.username)}
      </div>

      {/* name + level */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Courier New', monospace", fontWeight: 900,
          fontSize: 11, letterSpacing: '0.15em', color: '#ccc',
          textTransform: 'uppercase', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{user.username || 'UNKNOWN'}</p>
        <p style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 9, color: '#444', fontWeight: 700,
          fontFamily: "'Courier New', monospace", letterSpacing: '0.2em',
          marginTop: 3, textTransform: 'uppercase',
        }}>
          <Zap size={9} /> LV.{lvl}
        </p>
      </div>

      {/* streak pill */}
      {streak > 0 ? (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'rgba(255,110,0,0.1)', border: '1px solid rgba(255,110,0,0.28)',
          borderRadius: 99, padding: '3px 9px',
          fontSize: 9, fontWeight: 900, color: '#ff8c30',
          fontFamily: "'Courier New', monospace", letterSpacing: '0.1em', flexShrink: 0,
        }}>
          <Flame size={9} /> {streak}
        </span>
      ) : (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 99, padding: '3px 9px',
          fontSize: 9, fontWeight: 900, color: '#333',
          fontFamily: "'Courier New', monospace", letterSpacing: '0.1em', flexShrink: 0,
        }}>
          <Moon size={9} /> 0
        </span>
      )}

      {/* xp */}
      <span style={{
        fontFamily: "'Courier New', monospace", fontWeight: 900,
        fontSize: 14, color: '#e0e0e0', minWidth: 60, textAlign: 'right', flexShrink: 0,
      }}>{(user.xp || 0).toLocaleString()}</span>
    </div>
  )
}

/* ─── Scanline overlay ─── */
function Scanlines() {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.08) 0px,rgba(0,0,0,0.08) 1px,transparent 1px,transparent 3px)',
      opacity: 0.6,
    }} />
  )
}

/* ─── Main Export ─── */
export default function Leaderboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* ── unchanged fetch logic ── */
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('id, username, xp, current_streak')
          .order('xp', { ascending: false })
          .limit(10)

        if (err) {
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
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 16 }}>
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '2px solid rgba(255,215,0,0.15)',
          borderTop: '2px solid #FFD700',
          animation: 'spin 0.9s linear infinite',
        }} />
      </div>
      <p style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 10, letterSpacing: '0.4em', color: '#444', textTransform: 'uppercase' }}>
        LOADING ARENA...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  /* ── Error ── */
  if (error) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', gap: 12, borderRadius: 16,
      border: '1px solid rgba(220,50,50,0.25)', background: 'rgba(180,20,20,0.06)',
    }}>
      <AlertTriangle size={28} color="#e05555" />
      <p style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 11, letterSpacing: '0.3em', color: '#e05555', textTransform: 'uppercase' }}>CONNECTION LOST</p>
      <p style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: '#884444', textAlign: 'center' }}>{error}</p>
    </div>
  )

  /* ── Empty ── */
  if (users.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: 12 }}>
      <Swords size={36} color="#2a2a3a" />
      <p style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 11, letterSpacing: '0.3em', color: '#333', textTransform: 'uppercase' }}>ARENA EMPTY</p>
      <p style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: '#2a2a3a' }}>No challengers yet.</p>
    </div>
  )

  const top3 = users.slice(0, Math.min(3, users.length))
  const rest = users.slice(3)
  const maxXP = users[0]?.xp || 1

  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3.length === 2 ? [top3[1], top3[0]] : [top3[0]]
  const podiumRankMap = top3.length === 3 ? [1, 0, 2] : top3.length === 2 ? [1, 0] : [0]

  return (
    <div style={{
      position: 'relative',
      maxWidth: 600,
      margin: '0 auto',
      padding: '0 0 40px',
      background: 'transparent',
    }}>
      <Scanlines />

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>
        {/* decorative top line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, justifyContent: 'center' }}>
          <div style={{ height: 1, width: 60, background: 'linear-gradient(90deg,transparent,#FFD70055)' }} />
          <Swords size={14} color="#FFD700" style={{ opacity: 0.7 }} />
          <div style={{ height: 1, width: 60, background: 'linear-gradient(90deg,#FFD70055,transparent)' }} />
        </div>

        <h2 style={{
          fontFamily: "'Courier New', monospace",
          fontWeight: 900,
          fontSize: 26,
          letterSpacing: '0.45em',
          color: '#ffffff',
          textTransform: 'uppercase',
          textShadow: '0 0 30px rgba(255,215,0,0.25)',
          margin: 0,
        }}>LEADERBOARD</h2>

        <p style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 9,
          letterSpacing: '0.5em',
          color: '#FFD70066',
          fontWeight: 700,
          marginTop: 6,
          textTransform: 'uppercase',
        }}>⚔ SEASON · GLOBAL RANKINGS ⚔</p>

        {/* decorative bar */}
        <div style={{
          height: 2, width: 120, background: 'linear-gradient(90deg,transparent,#FFD700,transparent)',
          margin: '16px auto 0', borderRadius: 99,
        }} />
      </div>

      {/* ── Podium ── */}
      {top3.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: top3.length === 1 ? '1fr' : top3.length === 2 ? '1fr 1fr' : '1fr 1.1fr 1fr',
          gap: 10,
          alignItems: 'end',
          marginBottom: 28,
        }}>
          {podiumOrder.map((user, i) => (
            <PodiumCard key={user.id ?? i} user={user} rank={podiumRankMap[i]} maxXP={maxXP} />
          ))}
        </div>
      )}

      {/* ── Divider ── */}
      {rest.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{
            fontFamily: "'Courier New', monospace", fontSize: 9, fontWeight: 900,
            letterSpacing: '0.35em', color: '#333', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Shield size={9} /> CHALLENGERS <Shield size={9} />
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
      )}

      {/* ── List ── */}
      {rest.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rest.map((user, i) => (
            <ListRow key={user.id ?? i} user={user} rank={i + 4} delay={i * 60 + 80} />
          ))}
        </div>
      )}

      {/* glow orb bg */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(255,180,0,0.04) 0%,transparent 70%)',
        pointerEvents: 'none', zIndex: -1,
      }} />
    </div>
  )
}