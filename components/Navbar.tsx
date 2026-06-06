'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../backend/db/supabaseClient'
import { signInWithGitHub, signOut } from '../backend/auth/githubAuth'
import {
  Home,
  Trophy,
  Sword,
  LogOut,
  Github,
  Menu,
  X,
  Flame,
  Zap,
  Gamepad2,
  ChevronRight,
  Skull,
  Shield,
  Wifi,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   NAV ITEMS — same as original
───────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: '/',            label: 'HOME',     icon: Home,    color: '#00FF66', authRequired: false },
  { href: '/leaderboard', label: 'RANKINGS', icon: Trophy,  color: '#FF6B35', authRequired: false },
  { href: '/dashboard',   label: 'ARSENAL',  icon: Sword,   color: '#00E5FF', authRequired: true  },
]

export default function Navbar() {
  /* ── STATE — identical to original ── */
  const [user, setUser]           = useState<any>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname                  = usePathname()

  /* ── EFFECTS — identical to original ── */
  useEffect(() => {
    let mounted = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
      }
    })
    
    const onScroll = () => {
      if (mounted) setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll)
    
    return () => { 
      mounted = false
      subscription.unsubscribe()
      window.removeEventListener('scroll', onScroll) 
    }
  }, [])

  /* Close mobile menu on route change */
  useEffect(() => { setMobileOpen(false) }, [pathname])

  /* Derived */
  const username  = user?.user_metadata?.user_name || ''
  const avatarUrl = user?.user_metadata?.avatar_url || ''

  return (
    <>
      {/* ── KEYFRAMES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap');
        .nb-orbitron { font-family: 'Orbitron', monospace; }
        .nb-mono     { font-family: 'Share Tech Mono', monospace; }
        @keyframes nb-slide-down { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nb-slide-up   { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes nb-pulse-dot  { 0%,100%{box-shadow:0 0 4px #00FF66} 50%{box-shadow:0 0 10px #00FF66,0 0 20px #00FF66} }
        @keyframes nb-spin-logo  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes nb-fade-in    { from{opacity:0} to{opacity:1} }
        .nb-nav    { animation: nb-slide-down 0.4s ease both; }
        .nb-mobile { animation: nb-fade-in 0.2s ease both; }
        .nb-mitem  { animation: nb-slide-up 0.3s ease both; }
        .nb-link-hover { transition: all 0.18s ease; }
        .nb-link-hover:hover { transform: translateY(-1px); }
      `}</style>

      {/* ══════════════════════════════════════════
          MAIN NAVBAR
      ══════════════════════════════════════════ */}
      <nav
        className="nb-nav"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: isScrolled ? '10px 24px' : '16px 24px',
          background: isScrolled ? 'rgba(3,5,8,0.97)' : 'rgba(3,5,8,0.7)',
          borderBottom: `1px solid ${isScrolled ? 'rgba(0,255,102,0.12)' : 'rgba(255,255,255,0.04)'}`,
          backdropFilter: 'blur(20px)',
          transition: 'all 0.4s ease',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* ── LOGO ── */}
          <Link
            href="/"
            className="nb-link-hover"
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}
          >
            {/* Icon box */}
            <div
              style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,255,102,0.08)', border: '1px solid rgba(0,255,102,0.25)',
                clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))',
                flexShrink: 0,
              }}
            >
              <Skull style={{ width: 16, height: 16, color: '#00FF66' }} />
            </div>
            {/* Text */}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span className="nb-orbitron" style={{ fontSize: 17, fontWeight: 900, letterSpacing: '-0.02em', color: '#fff' }}>
                STREAK<span style={{ color: '#00FF66', textShadow: '0 0 16px rgba(0,255,102,0.5)' }}>VERSE</span>
              </span>
              <span className="nb-mono" style={{ fontSize: 7, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginTop: 2 }}>
                ARENA PROTOCOL
              </span>
            </div>
          </Link>

          {/* ── DESKTOP NAV LINKS ── */}
          <div
            className="hidden md:flex"
            style={{
              alignItems: 'center', gap: 4, padding: '5px 6px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
            }}
          >
            {NAV_ITEMS.map((item) => {
              if (item.authRequired && !user) return null
              const active = pathname === item.href
              const Icon   = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nb-link-hover"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 16px', textDecoration: 'none',
                    background: active ? `${item.color}12` : 'transparent',
                    border: `1px solid ${active ? `${item.color}33` : 'transparent'}`,
                    clipPath: 'polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))',
                    position: 'relative',
                  }}
                >
                  <Icon style={{ width: 13, height: 13, color: active ? item.color : 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
                  <span className="nb-mono" style={{ fontSize: 9, letterSpacing: '0.3em', color: active ? item.color : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {item.label}
                  </span>
                  {/* Active dot */}
                  {active && (
                    <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                  )}
                </Link>
              )
            })}
          </div>

          {/* ── RIGHT SECTION ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

            {/* Online indicator — desktop only */}
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00FF66', animation: 'nb-pulse-dot 2s ease-in-out infinite', boxShadow: '0 0 6px #00FF66' }} />
              <span className="nb-mono" style={{ fontSize: 7, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>ONLINE</span>
            </div>

            {user ? (
              /* ── LOGGED IN ── */
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Avatar chip */}
                <Link
                  href="/dashboard"
                  className="nb-link-hover"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 12px 5px 5px',
                    background: 'rgba(0,255,102,0.04)', border: '1px solid rgba(0,255,102,0.18)',
                    clipPath: 'polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px))',
                    textDecoration: 'none',
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={username} style={{ width: 28, height: 28, display: 'block', objectFit: 'cover', clipPath: 'polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))' }} />
                    ) : (
                      <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,102,0.15)', color: '#00FF66' }}>
                        <span className="nb-orbitron" style={{ fontSize: 12, fontWeight: 900 }}>{username[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    {/* Online dot */}
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: '#00FF66', border: '1.5px solid #030508', boxShadow: '0 0 5px #00FF66' }} />
                  </div>
                  {/* Name — hidden on small screens */}
                  <div className="hidden sm:flex" style={{ flexDirection: 'column' }}>
                    <span className="nb-mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {username}
                    </span>
                    <span className="nb-mono" style={{ fontSize: 7, color: '#FF6B35', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                      ▶ ACTIVE
                    </span>
                  </div>
                </Link>

                {/* Sign out */}
                <button
                  onClick={async () => { await signOut(); window.location.href = '/' }}
                  title="Terminate Session"
                  style={{
                    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,45,85,0.04)', border: '1px solid rgba(255,45,85,0.15)',
                    cursor: 'pointer', transition: 'all 0.18s ease',
                    clipPath: 'polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,45,85,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,85,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,45,85,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,85,0.15)' }}
                >
                  <LogOut style={{ width: 13, height: 13, color: 'rgba(255,45,85,0.6)' }} />
                </button>
              </div>
            ) : (
              /* ── LOGGED OUT ── */
              <button
                onClick={signInWithGitHub}
                className="nb-link-hover"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 16px', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #00FF66, #00cc52)',
                  border: 'none', color: '#000',
                  clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
                }}
              >
                <Github style={{ width: 13, height: 13 }} />
                <span className="nb-mono" style={{ fontSize: 9, fontWeight: 'bold', letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>INITIALIZE</span>
              </button>
            )}

            {/* ── MOBILE HAMBURGER ── */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden"
              style={{
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: mobileOpen ? 'rgba(0,255,102,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${mobileOpen ? 'rgba(0,255,102,0.3)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer', transition: 'all 0.18s ease',
                clipPath: 'polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))',
              }}
              aria-label="Toggle menu"
            >
              {mobileOpen
                ? <X     style={{ width: 14, height: 14, color: '#00FF66' }} />
                : <Menu  style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.5)' }} />
              }
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          MOBILE MENU OVERLAY
      ══════════════════════════════════════════ */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="nb-mobile md:hidden"
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          />

          {/* Panel */}
          <div
            className="nb-mobile md:hidden"
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 99,
              width: 'min(300px, 85vw)',
              background: 'rgba(3,5,8,0.98)',
              borderLeft: '1px solid rgba(0,255,102,0.15)',
              display: 'flex', flexDirection: 'column',
              paddingTop: 72,
            }}
          >
            {/* Grid bg */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(0,255,102,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,0.025) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Close strip */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="nb-mono" style={{ fontSize: 8, letterSpacing: '0.5em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>// NAVIGATION</span>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
              >
                <X style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.4)' }} />
              </button>
            </div>

            {/* Nav links */}
            <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', zIndex: 1, overflowY: 'auto' }}>
              {NAV_ITEMS.map((item, idx) => {
                if (item.authRequired && !user) return null
                const active = pathname === item.href
                const Icon   = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nb-mitem"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', textDecoration: 'none',
                      background: active ? `${item.color}0e` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${active ? `${item.color}30` : 'rgba(255,255,255,0.05)'}`,
                      clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
                      animationDelay: `${idx * 0.06}s`,
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${item.color}10`, border: `1px solid ${item.color}25`, flexShrink: 0 }}>
                      <Icon style={{ width: 15, height: 15, color: active ? item.color : `${item.color}77` }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="nb-orbitron" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: active ? item.color : 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>
                        {item.label}
                      </div>
                      {active && (
                        <div className="nb-mono" style={{ fontSize: 8, letterSpacing: '0.3em', color: `${item.color}77`, marginTop: 2 }}>CURRENT PAGE</div>
                      )}
                    </div>
                    <ChevronRight style={{ width: 12, height: 12, color: active ? item.color : 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                  </Link>
                )
              })}
            </div>

            {/* Mobile bottom: user info or login */}
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
              {user ? (
                /* Logged in bottom strip */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Profile row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(0,255,102,0.04)', border: '1px solid rgba(0,255,102,0.15)' }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={username} style={{ width: 32, height: 32, flexShrink: 0, clipPath: 'polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))' }} />
                    ) : (
                      <div style={{ width: 32, height: 32, flexShrink: 0, background: 'rgba(0,255,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="nb-orbitron" style={{ fontSize: 13, fontWeight: 900, color: '#00FF66' }}>{username[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="nb-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</div>
                      <div className="nb-mono" style={{ fontSize: 7, color: '#00FF6677', letterSpacing: '0.4em', textTransform: 'uppercase', marginTop: 2 }}>VERIFIED PLAYER</div>
                    </div>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00FF66', flexShrink: 0, boxShadow: '0 0 8px #00FF66', animation: 'nb-pulse-dot 2s ease-in-out infinite' }} />
                  </div>

                  {/* Sign out button */}
                  <button
                    onClick={async () => { await signOut(); window.location.href = '/'; setMobileOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '11px', cursor: 'pointer',
                      background: 'rgba(255,45,85,0.05)', border: '1px solid rgba(255,45,85,0.2)',
                      transition: 'all 0.18s ease',
                      clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,45,85,0.12)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,45,85,0.05)'}
                  >
                    <LogOut style={{ width: 13, height: 13, color: 'rgba(255,45,85,0.7)' }} />
                    <span className="nb-mono" style={{ fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,45,85,0.7)', textTransform: 'uppercase' }}>TERMINATE SESSION</span>
                  </button>
                </div>
              ) : (
                /* Login button */
                <button
                  onClick={() => { signInWithGitHub(); setMobileOpen(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '13px', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #00FF66, #00cc52)', border: 'none',
                    clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
                  }}
                >
                  <Github style={{ width: 15, height: 15, color: '#000' }} />
                  <span className="nb-orbitron" style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', color: '#000', textTransform: 'uppercase' }}>INITIALIZE CORE</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}