'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Leaderboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, username, xp, current_streak')
          .order('xp', { ascending: false })
          .limit(10)

        if (fetchError) throw fetchError
        setUsers(data || [])
      } catch (err) {
        console.error('Error fetching leaderboard:', err.message)
        // If current_streak also doesn't exist, try just id, username, xp
        try {
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('id, username, xp')
            .order('xp', { ascending: false })
            .limit(10)
          if (!retryError) {
            setUsers(retryData || [])
            setError(null)
            return
          }
        } catch (e) {
          // ignore retry error
        }
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-mono text-sm tracking-widest">FETCHING DATA...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center border border-red-500/20">
        <p className="text-red-400">Failed to load leaderboard</p>
        <p className="text-xs text-gray-500 mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
      <table className="w-full text-left">
        <thead className="bg-white/5 text-xs uppercase tracking-widest text-gray-400">
          <tr>
            <th className="px-6 py-4">Rank</th>
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4 text-right">XP</th>
            <th className="px-6 py-4 text-right">Streak</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr key={user.id || index} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-mono text-gray-500">{index + 1}</td>
                <td className="px-6 py-4 font-bold">@{user.username || 'anonymous'}</td>
                <td className="px-6 py-4 text-right text-green-500 font-mono">{(user.xp || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-bold text-orange-500">🔥 {user.current_streak || user.streak || 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                No data available in the StreakVerse yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
