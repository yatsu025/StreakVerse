'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { signInWithGitHub, signOut } from '../utils/auth'

export default function Navbar() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 h-16 flex items-center">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          STREAK<span className="text-green-500">VERSE</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link>
          <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors">Leaderboard</Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={user.user_metadata.full_name} 
                  className="w-8 h-8 rounded-full border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                />
              </Link>
              <button 
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGitHub}
              className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
