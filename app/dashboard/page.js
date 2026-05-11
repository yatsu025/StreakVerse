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
        // STEP 1: Dashboard me user object print kar
        console.log("Supabase User:", user)
        setUser(user)

        // STEP 2: username nikal
        const username = user?.user_metadata?.user_name
        console.log("GitHub Username:", username)

        if (username) {
          // STEP 4: function ko call kar
          fetchGitHubEvents(user)
        }

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

  // Function to calculate and save profile data
  const updateProfileInDatabase = async (user, pushEvents) => {
    try {
      const username = user?.user_metadata?.user_name
      const avatar_url = user?.user_metadata?.avatar_url
      
      // Calculate XP (total commits * 10)
      const xp = pushEvents.length * 10
      
      // Calculate Streak
      // 1. Get unique dates from pushEvents
      const commitDates = [...new Set(pushEvents.map(event => event.created_at.split('T')[0]))].sort()
      
      let currentStreak = 0
      if (commitDates.length > 0) {
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        
        // Check if user committed today or yesterday to continue the streak
        const lastCommitDate = commitDates[commitDates.length - 1]
        
        if (lastCommitDate === today || lastCommitDate === yesterday) {
          currentStreak = 1
          // Count backwards to find the streak length
          for (let i = commitDates.length - 1; i > 0; i--) {
            const current = new Date(commitDates[i])
            const previous = new Date(commitDates[i-1])
            const diffTime = Math.abs(current - previous)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            
            if (diffDays === 1) {
              currentStreak++
            } else {
              break
            }
          }
        }
      }

      // Upsert into Supabase
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username || user.user_metadata.full_name || 'anonymous',
          avatar_url: avatar_url,
          xp: xp,
          current_streak: currentStreak
        })
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      console.log("Database updated successfully:", data)
    } catch (error) {
      console.error("Error updating database:", error.message)
    }
  }

  // STEP 3: create a function to fetch GitHub events using username
  const fetchGitHubEvents = async (user) => {
    try {
      const username = user?.user_metadata?.user_name
      const response = await fetch(`https://api.github.com/users/${username}/events`)
      const data = await response.json()

      // STEP 4: console.log(data)
      console.log("GitHub Events Data:", data)

      // STEP 5: filter only PushEvent commits
      const pushEvents = data.filter(event => event.type === 'PushEvent')
      console.log("Filtered PushEvents (Commits):", pushEvents)

      // Save to database
      await updateProfileInDatabase(user, pushEvents)

    } catch (error) {
      console.error("Error fetching GitHub events:", error)
    }
  }

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
