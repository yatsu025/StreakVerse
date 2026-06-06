// ─────────────────────────────────────────────────────────────────────────────
// StreakVerse — Tier / Level Logic
// ─────────────────────────────────────────────────────────────────────────────

export const LEVELS = [
  { name: 'ROOKIE',  minXP: 0,    maxXP: 100,     color: '#ffffff66' },
  { name: 'SOLDIER', minXP: 101,  maxXP: 250,     color: '#00E5FF'   },
  { name: 'VETERAN', minXP: 251,  maxXP: 500,     color: '#00FF66'   },
  { name: 'ELITE',   minXP: 501,  maxXP: 900,     color: '#B14AED'   },
  { name: 'LEGEND',  minXP: 901,  maxXP: 1500,    color: '#FF6B35'   },
  { name: 'MYTHIC',  minXP: 1501, maxXP: Infinity, color: '#FFD700'  },
] as const

export type Tier = (typeof LEVELS)[number]

/** Get tier object for a given XP value */
export function getTierFromXP(xp: number = 0): Tier {
  const safe = typeof xp === 'number' ? xp : 0
  return LEVELS.find(l => safe >= l.minXP && safe <= l.maxXP) ?? LEVELS[0]
}

/**
 * XP progress percentage within current tier (0–100).
 * Used to render XP progress bar.
 */
export function xpProgressInTier(xp: number): number {
  const tier       = getTierFromXP(xp)
  const rangeMax   = tier.maxXP === Infinity ? tier.minXP + 1000 : tier.maxXP
  const rangeMin   = tier.minXP
  const range      = rangeMax - rangeMin
  if (range <= 0) return 100
  return Math.min(100, Math.round(((xp - rangeMin) / range) * 100))
}

/** XP needed to reach next tier */
export function xpToNextTier(xp: number): number {
  const tier = getTierFromXP(xp)
  if (tier.maxXP === Infinity) return 0
  return Math.max(0, tier.maxXP - xp + 1)
}
