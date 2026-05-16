import Leaderboard from '../../components/Leaderboard'
import { Trophy } from 'lucide-react'

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-cyber-grid py-24 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          
          
          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase mb-8">
            ELITE <span className="text-neon-orange text-glow">RANKINGS</span>
          </h1>
          
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            The top-tier developers of StreakVerse. Ranked by total XP and streak endurance. Climb the ladder and secure your position in history.
          </p>
        </div>

        <div className="relative">
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-neon-orange/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <Leaderboard />
          </div>
        </div>
      </div>
    </main>
  )
}
