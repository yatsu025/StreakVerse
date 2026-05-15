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
  Sword
} from 'lucide-react'

export default function Sidebar() {
  const [user, setUser]         = useState(null)
  const [isOpen, setIsOpen]     = useState(false)
  const pathname                = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => setIsOpen(false), [pathname])

  const navItems = [
    { href: '/', label: 'Home', icon: Home, color: 'text-neon-green' },
    { href: '/leaderboard', label: 'Rankings', icon: Trophy, color: 'text-neon-orange' },
    { href: '/dashboard', label: 'Arsenal', icon: Sword, authRequired: true, color: 'text-neon-cyan' },
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-[60] p-4 glass text-neon-green rounded-2xl sm:hidden shadow-[0_0_20px_rgba(0,255,102,0.2)] active:scale-95"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[50] sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-[55] w-80 glass-dark border-r border-white/5 
        transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          
          {/* Logo Section */}
          <div className="p-10 mb-6">
            <Link href="/" className="group block relative">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-neon-green/20 rounded-2xl flex items-center justify-center border border-neon-green/30 group-hover:rotate-[360deg] transition-all duration-1000">
                    <Gamepad2 className="w-6 h-6 text-neon-green" />
                  </div>
                  <div className="absolute -inset-2 bg-neon-green/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-black tracking-tighter leading-none">
                    STREAK<span className="text-neon-green text-glow">VERSE</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Level Up Your Code</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 space-y-3">
            {navItems.map((item) => {
              if (item.authRequired && !user) return null
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all duration-500 group relative overflow-hidden
                    ${active 
                      ? 'bg-white/[0.05] border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.02)]' 
                      : 'text-white/40 hover:text-white hover:bg-white/[0.03]'}
                  `}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-neon-green rounded-r-full shadow-[4px_0_15px_rgba(0,255,102,0.5)]" />
                  )}
                  <div className={`p-2.5 rounded-xl transition-colors ${active ? 'bg-white/10' : 'group-hover:bg-white/5'}`}>
                    <Icon className={`w-5 h-5 ${active ? item.color : 'text-current'} transition-colors`} />
                  </div>
                  <span className="text-sm tracking-[0.1em] uppercase font-black">{item.label}</span>
                  
                  {/* Subtle hover glow */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000`} />
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-8 mt-auto border-t border-white/5 bg-black/20">
            {user ? (
              <div className="space-y-6">
                <div className="relative group">
                  <div className="flex items-center gap-4 p-4 rounded-3xl glass-dark border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="relative">
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="" 
                        className="w-14 h-14 rounded-2xl border-2 border-neon-green/30 group-hover:border-neon-green transition-colors object-cover" 
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center border border-white/10">
                        <div className="w-2.5 h-2.5 bg-neon-green rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,102,1)]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black truncate text-white uppercase tracking-tight">{user.user_metadata.user_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Zap className="w-3 h-3 text-neon-orange fill-neon-orange" />
                        <span className="text-[10px] text-neon-orange font-black uppercase tracking-widest">Master III</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => { await signOut(); window.location.href = '/' }}
                  className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl text-white/30 hover:text-neon-red hover:bg-neon-red/5 transition-all duration-300 group border border-transparent hover:border-neon-red/20"
                >
                  <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Terminate Session</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center text-white/20 mb-4">Unauthorized Entry</p>
                <button
                  onClick={signInWithGitHub}
                  className="w-full relative group overflow-hidden bg-white text-black font-black py-5 rounded-2xl transition-all duration-500 hover:bg-neon-green hover:shadow-[0_0_40px_rgba(0,255,102,0.3)] active:scale-95"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                    <Github className="w-5 h-5" />
                    <span>Initialize Core</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
