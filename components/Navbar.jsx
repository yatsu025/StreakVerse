'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { signInWithGitHub, signOut } from '../utils/auth'

export default function Navbar() {
  const [user, setUser]         = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname                = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  // close mobile menu on route change
  useEffect(() => setMenuOpen(false), [pathname])

  const navLink = (href, label) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors ${
          active ? 'text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        {label}
        {active && <span className="block h-0.5 bg-green-500 rounded-full mt-0.5" />}
      </Link>
    )
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-black/80 backdrop-blur-xl h-16 flex items-center">
      <div className="container mx-auto px-6 flex items-center justify-between w-full">

        {/* Logo */}
        <Link href="/" className="text-lg font-black tracking-tighter shrink-0">
          STREAK<span className="text-green-500">VERSE</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-7">
          {navLink('/', 'Home')}
          {navLink('/leaderboard', 'Leaderboard')}
          {user && navLink('/dashboard', 'Dashboard')}
        </div>

        {/* Right side */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name}
                  className="w-8 h-8 rounded-full border-2 border-green-500/40 group-hover:border-green-500 transition-colors"
                />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors hidden md:block">
                  {user.user_metadata.user_name}
                </span>
              </Link>
              <button
                onClick={async () => { await signOut(); window.location.href = '/' }}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={signInWithGitHub}
              className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(34,197,94,0.25)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              Login
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/8 px-6 py-5 flex flex-col gap-4">
          <Link href="/"            className={`text-sm font-medium ${pathname === '/'            ? 'text-white' : 'text-gray-400'}`}>Home</Link>
          <Link href="/leaderboard" className={`text-sm font-medium ${pathname === '/leaderboard' ? 'text-white' : 'text-gray-400'}`}>Leaderboard</Link>
          {user && <Link href="/dashboard" className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-white' : 'text-gray-400'}`}>Dashboard</Link>}
          <div className="border-t border-white/8 pt-4">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full border border-green-500/40" />
                  <span className="text-sm text-gray-300">{user.user_metadata.user_name}</span>
                </div>
                <button
                  onClick={async () => { await signOut(); window.location.href = '/' }}
                  className="text-xs text-red-400"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={signInWithGitHub} className="w-full btn-primary text-sm py-3">
                Login with GitHub
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
