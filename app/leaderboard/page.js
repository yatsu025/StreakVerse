import Leaderboard from '../../components/Leaderboard'

export default function LeaderboardPage() {
  return (
    <main className="container mx-auto px-6 py-16 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">Global Rankings</p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
          🏆 Leaderboard
        </h1>
        <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
          The top coders in StreakVerse, ranked by XP and streak length. Can you make the list?
        </p>
      </div>

      <Leaderboard />
    </main>
  )
}
