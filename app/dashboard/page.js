'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { signOut } from '../../utils/auth'

import DashboardCard from '../../components/DashboardCard'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
      } else {
        setUser(user)
        // Fetch profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)
      }
      setLoading(false)
    }
    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-primary animate-pulse font-display text-4xl font-black tracking-wider uppercase">
          Loading<br /><span className="text-foreground">Identity</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row items-center gap-8 glass-panel p-8 rounded-3xl border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
          <img 
            src={user.user_metadata.avatar_url} 
            alt={user.user_metadata.full_name} 
            className="w-32 h-32 rounded-3xl border-4 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
          />
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-white">
              Welcome back, <span className="text-green-500">{user.user_metadata.full_name}</span>!
            </h1>
            <p className="text-gray-400 font-medium">@{user.user_metadata.user_name}</p>
            <div className="pt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">XP: {profile?.xp || 0}</span>
              <span className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-bold border border-orange-500/20">STREAK: {profile?.current_streak || profile?.streak || 0} DAYS</span>
            </div>
          </div>
          <button 
            onClick={async () => {
              await signOut()
              window.location.href = '/'
            }}
            className="px-6 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard title="Total XP" value={profile?.xp?.toLocaleString() || '0'} />
          <DashboardCard title="Current Streak" value={`🔥 ${profile?.current_streak || profile?.streak || 0} Days`} colorClass="text-orange-500" />
          <DashboardCard title="GitHub" value={user.user_metadata.user_name} colorClass="text-green-500" />
        </div>
      </div>
    </main>
  )
}
