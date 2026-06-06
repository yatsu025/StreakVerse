// ─────────────────────────────────────────────────────────────────────────────
// StreakVerse — Streak Logic
// ─────────────────────────────────────────────────────────────────────────────

export interface StreakState {
  currentStreak: number
  longestStreak: number
  shields: number
}

/**
 * Recalculate streak from a sorted list of commit dates.
 * Shield-aware: if the user missed days but has shields, streak is preserved.
 *
 * @param commitDates  Sorted array of "YYYY-MM-DD" strings (oldest → newest)
 * @param existingShields  How many shields the user currently has
 * @param existingLongest  Previous longest streak (preserved if new is smaller)
 */
export function calcStreakFromDates(
  commitDates: string[],
  existingShields: number = 0,
  existingLongest: number = 0
): StreakState {
  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

  let currentStreak = 0
  let longestStreak = existingLongest
  let lastDate: string | null = null

  for (const date of [...commitDates].sort()) {
    if (!lastDate) {
      currentStreak = 1
    } else {
      const daysDiff = Math.round(
        (new Date(date).getTime() - new Date(lastDate).getTime()) / 86_400_000
      )
      if (daysDiff === 0) continue        // same day — skip
      else if (daysDiff === 1) currentStreak++  // consecutive
      else currentStreak = 1             // gap — reset
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak
    lastDate = date
  }

  // Streak decay — check shields before resetting
  let shields = existingShields
  if (lastDate && lastDate !== today && lastDate !== yesterday) {
    const missedDays = Math.round(
      (new Date(today).getTime() - new Date(lastDate).getTime()) / 86_400_000
    ) - 1

    if (missedDays > 0) {
      if (shields >= missedDays) {
        shields -= missedDays
        console.log(`[Streak] Shields saved streak! Used ${missedDays}, remaining: ${shields}`)
      } else {
        console.log(`[Streak] Streak broken. Missed: ${missedDays}, shields: ${shields}`)
        currentStreak = 0
        shields = 0
      }
    }
  }

  return { currentStreak, longestStreak, shields }
}

/**
 * Check if a shield should be awarded (every 7-day streak block, max 3).
 * Returns updated shield count.
 */
export function applyShieldGain(currentStreak: number, currentShields: number): number {
  if (currentStreak > 0 && currentStreak % 7 === 0) {
    return Math.min(3, currentShields + 1)
  }
  return currentShields
}
