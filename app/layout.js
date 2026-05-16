import '../styles/globals.css'
import Navbar from '../components/Navbar'
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
        <Navbar />
        <div className="min-h-screen pt-20 transition-all duration-500">
          {children}
        </div>
      </body>
    </html>
  )
}
