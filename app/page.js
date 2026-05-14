'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { signInWithGitHub } from '../utils/auth'

const FEATURES = [
  { icon: '🔥', title: 'Streak Tracking', desc: 'Every commit extends your streak. Miss a day and it resets — stay consistent or lose it all.' },
  { icon: '🏆', title: 'Global Leaderboard', desc: 'Compete with coders worldwide. Climb the ranks and flex your longest streak.' },
  { icon: '📊', title: 'Activity Heatmap', desc: 'GitHub-style contribution grid. See your consistency at a glance.' },
  { icon: '⚡', title: 'GitHub Sync', desc: 'Login with GitHub and your commits are tracked automatically. Zero setup.' },
  { icon: '🎯', title: 'Daily Challenges', desc: 'Push yourself with daily coding goals and earn bonus streak points.' },
  { icon: '🛡️', title: 'Streak Shields', desc: 'Earn shields to protect your streak on off days. Grind to unlock them.' },
]

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'torvalds_fan', streak: 365, medal: '🥇' },
  { rank: 2, name: 'code_samurai', streak: 312, medal: '🥈' },
  { rank: 3, name: 'byte_wizard',  streak: 289, medal: '�' },
  { rank: 4, name: 'null_pointer', streak: 241, medal: null },
  { rank: 5, name: 'async_await',  streak: 198, medal: null },
]

const BADGES = [
  { days: 7,   label: 'Week Warrior',   gradient: 'from-sky-500 to-cyan-400',      icon: '⚡' },
  { days: 30,  label: 'Monthly Master', gradient: 'from-violet-500 to-fuchsia-400', icon: '💜' },
  { days: 100, label: 'Century Coder',  gradient: 'from-orange-500 to-amber-400',   icon: '🌟' },
  { days: 365, label: 'Year Legend',    gradient: 'from-green-500 to-emerald-300',  icon: '👑' },
]

const STEPS = [
  { n: '01', title: 'Connect GitHub',  desc: 'Sign in with GitHub — we sync your commits automatically, no setup needed.' },
  { n: '02', title: 'Code Daily',      desc: 'Every commit extends your streak. The longer you go, the higher you climb.' },
  { n: '03', title: 'Dominate',        desc: 'Earn badges, unlock shields, and flex your streak to the whole community.' },
]

export default function Home() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [show, setShow]       = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    const t = setTimeout(() => setShow(true), 80)
    return () => { subscription.unsubscribe(); clearTimeout(t) }
  }, [])

  const fadeClass = (delay = '') =>
    `transition-all duration-700 ${delay} ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`

  return (
    <main className="overflow-x-hidden">

      {/* ─── HERO ─── */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-green-500/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-emerald-600/8 rounded-full blur-[100px]" />
        </div>

        {/* live badge */}
        <div className={`${fadeClass()} mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/25 bg-green-500/8 text-green-400 text-sm font-medium`}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          10,000+ coders tracking streaks right now
        </div>

        {/* headline */}
        <h1 className={`${fadeClass('delay-100')} text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-6`}>
          CODE EVERY DAY.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-500">
            DOMINATE THE VERSE.
          </span>
        </h1>

        {/* sub */}
        <p className={`${fadeClass('delay-150')} text-base sm:text-lg text-gray-400 max-w-lg leading-relaxed mb-10`}>
          StreakVerse turns your GitHub commits into a competitive game. Build streaks, earn ranks, and prove you never stop shipping.
        </p>

        {/* CTAs */}
        <div className={`${fadeClass('delay-200')} flex flex-col sm:flex-row gap-3 justify-center w-full max-w-sm sm:max-w-none`}>
          {!loading && user ? (
            <Link href="/dashboard" className="btn-primary">
              Go to Dashboard →
            </Link>
          ) : (
            <button onClick={signInWithGitHub} disabled={loading} className="btn-primary flex items-center justify-center gap-2.5">
              <GithubIcon />
              Start Your Streak — Free
            </button>
          )}
          <Link href="/leaderboard" className="btn-ghost flex items-center justify-center gap-2">
            🏆 View Leaderboard
          </Link>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 text-xs select-none animate-bounce">
          <span>scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="border-y border-white/8 bg-white/[0.03] py-12">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: '10K+',  label: 'Active Coders' },
            { val: '2.4M',  label: 'Commits Tracked' },
            { val: '365d',  label: 'Max Streak' },
            { val: '100%',  label: 'Free Forever' },
          ].map(s => (
            <div key={s.label} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-green-400">{s.val}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="section-heading">Three steps to <span className="text-green-400">streak glory</span></h2>
          <div className="grid md:grid-cols-3 gap-5 mt-12">
            {STEPS.map(s => (
              <div key={s.n} className="card group relative overflow-hidden">
                <span className="absolute top-3 right-4 text-7xl font-black text-white/[0.04] group-hover:text-green-500/[0.07] transition-colors select-none leading-none">
                  {s.n}
                </span>
                <div className="text-green-400 text-xs font-bold tracking-widest mb-3">{s.n}</div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel>Features</SectionLabel>
          <h2 className="section-heading">Built for <span className="text-green-400">competitive coders</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {FEATURES.map(f => (
              <div key={f.title} className="card group hover:border-green-500/25 hover:bg-green-500/[0.04]">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-base mb-1.5 group-hover:text-green-400 transition-colors">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LEADERBOARD PREVIEW ─── */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-xl">
          <SectionLabel>Leaderboard</SectionLabel>
          <h2 className="section-heading">Who's on <span className="text-green-400">top right now?</span></h2>

          <div className="mt-12 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
            {/* header */}
            <div className="px-5 py-3.5 border-b border-white/8 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Top Streakers</span>
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
            </div>

            {/* rows */}
            <div className="divide-y divide-white/5">
              {MOCK_LEADERBOARD.map(e => (
                <div key={e.rank} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
                  <span className="w-8 text-center text-lg shrink-0">
                    {e.medal ?? <span className="text-sm font-bold text-gray-600">#{e.rank}</span>}
                  </span>
                  <span className="flex-1 font-semibold text-sm truncate">{e.name}</span>
                  <span className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full text-xs font-bold text-orange-400 shrink-0">
                    🔥 {e.streak}d
                  </span>
                </div>
              ))}
            </div>

            {/* footer */}
            <div className="px-5 py-3.5 border-t border-white/8 text-center">
              <Link href="/leaderboard" className="text-green-400 text-sm font-semibold hover:text-green-300 transition-colors">
                See full leaderboard →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BADGES ─── */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="container mx-auto max-w-3xl text-center">
          <SectionLabel>Gamified</SectionLabel>
          <h2 className="section-heading">Your streak is your <span className="text-green-400">identity</span></h2>
          <p className="text-gray-400 max-w-md mx-auto mt-4 mb-12 text-sm leading-relaxed">
            Every day you code, your flame burns brighter. Let it die and you start from zero. The pressure is real — and that's the point.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {BADGES.map(b => (
              <div key={b.days} className="card w-36 flex flex-col items-center gap-2 hover:scale-105 transition-transform cursor-default">
                <span className="text-3xl">{b.icon}</span>
                <span className={`text-2xl font-black bg-gradient-to-br ${b.gradient} bg-clip-text text-transparent`}>
                  {b.days}d
                </span>
                <span className="text-xs text-gray-400 text-center leading-tight">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-green-500/8 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto max-w-xl text-center relative z-10">
          <div className="text-5xl mb-6">🔥</div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">
            Your streak starts<br />
            <span className="text-green-400">today.</span>
          </h2>
          <p className="text-gray-400 mb-10 leading-relaxed">
            Join thousands of developers who code every single day. Don't let your streak die before it even starts.
          </p>
          {!loading && user ? (
            <Link href="/dashboard" className="btn-primary inline-flex">
              Open Dashboard →
            </Link>
          ) : (
            <button onClick={signInWithGitHub} disabled={loading} className="btn-primary inline-flex items-center gap-3">
              <GithubIcon />
              Connect GitHub & Start
            </button>
          )}
          <p className="text-gray-600 text-xs mt-5">Free forever · No credit card needed</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/8 py-8 px-6">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <span className="font-bold tracking-tighter text-white/30">
            STREAK<span className="text-green-500/50">VERSE</span>
          </span>
          <span>Built for coders who never stop shipping.</span>
          <div className="flex gap-6">
            <Link href="/leaderboard" className="hover:text-gray-400 transition-colors">Leaderboard</Link>
            <Link href="/dashboard"   className="hover:text-gray-400 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}

/* ── small reusable pieces ── */
function SectionLabel({ children }) {
  return (
    <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3 text-center">{children}</p>
  )
}

function GithubIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}
