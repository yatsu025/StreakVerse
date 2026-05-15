import '../styles/globals.css'
import Sidebar from '../components/Sidebar'
import { Orbitron, Space_Grotesk } from 'next/font/google'

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata = {
  title: 'StreakVerse',
  description: 'Track your coding streaks and climb the leaderboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased font-body bg-black text-white min-h-screen">
        <Sidebar />
        <div className="sm:pl-80 min-h-screen transition-all duration-500">
          {children}
        </div>
      </body>
    </html>
  )
}
