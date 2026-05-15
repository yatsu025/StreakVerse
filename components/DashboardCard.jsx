'use client'

import { Flame, Zap, Github, Shield, Star, Trophy } from 'lucide-react'

export default function DashboardCard({ title, value, icon, color = 'default' }) {
  const colors = {
    default: {
      text: 'text-white',
      glow: 'group-hover:text-white',
      bg: 'bg-white/5',
      border: 'border-white/10',
      icon: 'text-gray-400'
    },
    green: {
      text: 'text-neon-green',
      glow: 'group-hover:text-neon-green',
      bg: 'bg-neon-green/10',
      border: 'border-neon-green/20',
      icon: 'text-neon-green'
    },
    orange: {
      text: 'text-neon-orange',
      glow: 'group-hover:text-neon-orange',
      bg: 'bg-neon-orange/10',
      border: 'border-neon-orange/20',
      icon: 'text-neon-orange'
    },
    cyan: {
      text: 'text-neon-cyan',
      glow: 'group-hover:text-neon-cyan',
      bg: 'bg-neon-cyan/10',
      border: 'border-neon-cyan/20',
      icon: 'text-neon-cyan'
    },
    purple: {
      text: 'text-neon-purple',
      glow: 'group-hover:text-neon-purple',
      bg: 'bg-neon-purple/10',
      border: 'border-neon-purple/20',
      icon: 'text-neon-purple'
    }
  }[color]

  return (
    <div className={`neo-card group p-8 flex flex-col gap-6 relative overflow-hidden transition-all duration-500 hover:scale-[1.02]`}>
      {/* Background Glow */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${colors.bg}`} />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{title}</span>
          <div className={`text-3xl font-display font-black tracking-tight ${colors.text} transition-all duration-500 group-hover:drop-shadow-[0_0_10px_currentColor]`}>
            {value}
          </div>
        </div>
        
        <div className={`w-14 h-14 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center transition-all duration-500 group-hover:scale-110`}>
          <div className={colors.icon}>
            {icon}
          </div>
        </div>
      </div>

      {/* Progress Bar Mockup for Gamification */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000`} />
        <div className={`h-full w-2/3 rounded-full opacity-50 ${colors.bg.replace('10', '40')}`} />
      </div>
    </div>
  )
}
