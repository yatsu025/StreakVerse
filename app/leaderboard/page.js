import Leaderboard from '../../components/Leaderboard'

export default function LeaderboardPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-gray-400 mt-2">Top performers in the StreakVerse</p>
        </div>

        <Leaderboard />
      </div>
    </main>
  )
}
