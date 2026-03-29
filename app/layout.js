import '../styles/globals.css'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'StreakVerse',
  description: 'Track your coding streaks and climb the leaderboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
