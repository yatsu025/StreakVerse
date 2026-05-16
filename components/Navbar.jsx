'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { signInWithGitHub, signOut } from '../utils/auth'
import { 
  Home, 
  Trophy, 
  LayoutDashboard, 
  LogOut, 
  Github, 
  Menu, 
  X, 
  Flame, 
  Zap,
  Gamepad2,
  Sword,
  User
} from 'lucide-react'

export default function Navbar() {
  const [user, setUser]         = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname                = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const navItems = [
    { href: '/', label: 'Home', icon: Home, color: 'text-neon-green' },
    { href: '/leaderboard', label: 'Rankings', icon: Trophy, color: 'text-neon-orange' },
    { href: '/dashboard', label: 'Arsenal', icon: Sword, authRequired: true, color: 'text-neon-cyan' },
  ]

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4
      ${isScrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent'}
    `}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-10 h-10 bg-neon-green/10 rounded-xl flex items-center justify-center border border-neon-green/20 group-hover:rotate-[360deg] transition-all duration-1000 shadow-[0_0_15px_rgba(0,255,102,0.1)]">
            <Gamepad2 className="w-5 h-5 text-neon-green" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-display font-black tracking-tighter leading-none">
              STREAK<span className="text-neon-green text-glow">VERSE</span>
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30">Arena Protocol</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-2 glass-dark p-1.5 rounded-2xl border-white/5">
          {navItems.map((item) => {
            if (item.authRequired && !user) return null
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all duration-500 group relative overflow-hidden
                  ${active 
                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.02)]' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'}
                `}
              >
                <Icon className={`w-4 h-4 transition-all duration-500 ${active ? item.color : 'group-hover:text-white'}`} />
                <span className="text-xs tracking-[0.1em] uppercase font-black">{item.label}</span>
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-neon-green rounded-full shadow-[0_0_10px_rgba(0,255,102,1)]" />
                )}
              </Link>
            )
          })}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-3 glass p-1.5 pr-4 rounded-2xl border-white/10 hover:border-neon-green/30 transition-all group">
                <div className="relative">
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="" 
                    className="w-8 h-8 rounded-lg border border-white/10 group-hover:border-neon-green transition-colors object-cover" 
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-neon-green rounded-full border border-black shadow-[0_0_5px_rgba(0,255,102,1)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[80px]">{user.user_metadata.user_name}</span>
                  <div className="flex items-center gap-1">
                    <Zap className="w-2 h-2 text-neon-orange fill-neon-orange/20" />
                    <span className="text-[7px] text-neon-orange font-black uppercase tracking-widest">Master III</span>
                  </div>
                </div>
              </Link>
              <button
                onClick={async () => { await signOut(); window.location.href = '/' }}
                className="p-2.5 glass-dark rounded-xl text-white/20 hover:text-neon-red hover:bg-neon-red/10 transition-all"
                title="Terminate Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGitHub}
              className="neo-btn-primary py-2.5 px-6 rounded-xl text-[10px] flex items-center gap-3"
            >
              <Github className="w-4 h-4" />
              <span>Initialize</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
