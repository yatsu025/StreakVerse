// ─────────────────────────────────────────────────────────────────────────────
// StreakVerse — Shield Logic
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_SHIELDS         = 3
export const SHIELD_EARN_EVERY   = 7   // earn 1 shield every 7-day streak block

/**
 * Check if a new shield should be awarded after reaching a streak milestone.
 * Returns new shield count.
 *
 * @param currentStreak  Streak value AFTER today's commit is counted
 * @param currentShields Current shield count
 */
export function applyShieldGain(
  currentStreak: number,
  currentShields: number
): number {
  if (currentStreak > 0 && currentStreak % SHIELD_EARN_EVERY === 0) {
    return Math.min(MAX_SHIELDS, currentShields + 1)
  }
  return currentShields
}

/**
 * Apply shields to bridge a streak gap.
 * Returns updated shield count and whether the streak survived.
 *
 * @param shields      Current shield count
 * @param missedDays   How many days user didn't commit (gap - 1)
 */
export function applyShieldDecay(
  shields: number,
  missedDays: number
): { shields: number; streakSaved: boolean } {
  if (missedDays <= 0) {
    return { shields, streakSaved: true }
  }

  if (shields >= missedDays) {
    return {
      shields: shields - missedDays,
      streakSaved: true,
    }
  }

  // Not enough shields — streak breaks
  return { shields: 0, streakSaved: false }
}

/**
 * How many days until the next shield is earned.
 */
export function daysUntilNextShield(currentStreak: number): number {
  return SHIELD_EARN_EVERY - (currentStreak % SHIELD_EARN_EVERY)
}
