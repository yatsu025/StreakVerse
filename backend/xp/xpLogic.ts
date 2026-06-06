// ─────────────────────────────────────────────────────────────────────────────
// StreakVerse — XP Logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * XP Rules:
 *  - First push of the day   → +10 XP (day bonus)
 *  - 2nd, 3rd... push same day → +5 XP each
 *  - 5-day streak milestone  → +10 XP (once)
 *  - 10-day streak milestone → +20 XP (once)
 *  - 30-day streak milestone → +50 XP (once)
 *  - First login ever        → +25 XP
 */

export const XP_DAY_BONUS        = 10
export const XP_EXTRA_PUSH       = 5
export const XP_MILESTONE_5D     = 10
export const XP_MILESTONE_10D    = 20
export const XP_MILESTONE_30D    = 50
export const XP_FIRST_LOGIN      = 25

/**
 * Calculate XP earned for a single new commit day.
 * @param streakAtThisDay  The streak value AFTER this day is counted
 * @param commitsThisDay   Total commits made on this day
 * @param isFirstEver      True if this is the user's very first commit day
 */
export function calcDayXP(
  streakAtThisDay: number,
  commitsThisDay: number,
  isFirstEver = false
): number {
  let xp = XP_DAY_BONUS

  // Extra commits on same day
  if (commitsThisDay > 1) {
    xp += (commitsThisDay - 1) * XP_EXTRA_PUSH
  }

  // Streak milestone bonuses
  if (streakAtThisDay === 5)  xp += XP_MILESTONE_5D
  if (streakAtThisDay === 10) xp += XP_MILESTONE_10D
  if (streakAtThisDay === 30) xp += XP_MILESTONE_30D

  return xp
}

/**
 * XP for additional pushes on a day already counted (same day re-sync).
 * @param newCommits  Number of NEW commits since last sync today
 */
export function calcExtraPushXP(newCommits: number): number {
  return Math.max(0, newCommits) * XP_EXTRA_PUSH
}

/**
 * Calculate rank score from XP + streak.
 * Formula: xp + (currentStreak × 5)
 */
export function calcRankScore(xp: number, currentStreak: number): number {
  return xp + currentStreak * 5
}
