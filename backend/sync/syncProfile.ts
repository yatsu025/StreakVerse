// ─────────────────────────────────────────────────────────────────────────────
// StreakVerse — Core Sync Logic
// Combines streak + xp + shield + tier calculations into one profile update.
// Used by: dashboard (client-side) + webhook (server-side)
// ─────────────────────────────────────────────────────────────────────────────

import type { ProfileData, ProfileUpdate, SyncResult } from '../types'
import { calcStreakFromDates }           from '../streak/streakLogic'
import { applyShieldGain }              from '../shields/shieldLogic'
import { calcDayXP, calcExtraPushXP, calcRankScore, XP_FIRST_LOGIN } from '../xp/xpLogic'
import { countCommitsByDate }           from '../github/githubEvents'
import type { GitHubPushEvent }         from '../types'

/**
 * Main sync function — calculates new profile state from GitHub push events.
 *
 * Rules:
 * - XP carries forward (never reset)
 * - Streak recalculated fresh from GitHub event dates
 * - New dates (d > last_commit_date) earn day bonus XP
 * - Same-day additional pushes earn +5 XP each
 * - Shields protect streak on missed days
 *
 * @param existing      Current profile from Supabase (null = first-time user)
 * @param pushEvents    Raw PushEvents from GitHub API
 */
export function calcProfileUpdate(
  existing: ProfileData | null,
  pushEvents: GitHubPushEvent[]
): SyncResult {
  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

  // ── Step 1: Build commit counts per date ────────────────────────────────
  const commitCountByDate = countCommitsByDate(pushEvents)
  const commitDates       = Object.keys(commitCountByDate).sort()

  if (commitDates.length === 0) {
    // No data — return existing profile unchanged
    return {
      addedXP: 0,
      newStreak: existing?.current_streak ?? 0,
      profileUpdate: {
        xp:               existing?.xp ?? 0,
        current_streak:   existing?.current_streak ?? 0,
        longest_streak:   existing?.longest_streak ?? 0,
        streak_shields:   existing?.streak_shields ?? 0,
        last_commit_date: existing?.last_commit_date ?? null,
        last_commit_count: existing?.last_commit_count ?? 0,
        rank_score:       calcRankScore(existing?.xp ?? 0, existing?.current_streak ?? 0),
      },
    }
  }

  // ── Step 2: Recalculate streak (shield-aware) ────────────────────────────
  const { currentStreak, longestStreak, shields: updatedShields } = calcStreakFromDates(
    commitDates,
    existing?.streak_shields ?? 0,
    existing?.longest_streak ?? 0
  )

  // ── Step 3: Calculate XP to add ─────────────────────────────────────────
  const existingXP        = existing?.xp ?? 0
  const rawLastDate       = existing?.last_commit_date ?? null
  const existingLastDate  = rawLastDate ? rawLastDate.split('T')[0] : null
  const existingLastCount = existing?.last_commit_count ?? 0

  // New dates = dates strictly newer than what was last counted
  const newDates = existingLastDate
    ? commitDates.filter(d => d > existingLastDate)
    : commitDates

  let addedXP = 0

  // First-time user bonus
  if (!existing) addedXP += XP_FIRST_LOGIN

  // Day bonus + milestone bonuses for each new date
  for (const date of newDates) {
    // Calculate streak at this specific date
    let streakAtDate = 0
    let prev: string | null = null
    for (const d of commitDates) {
      if (d > date) break
      if (!prev) { streakAtDate = 1 }
      else {
        const diff = Math.round(
          (new Date(d).getTime() - new Date(prev).getTime()) / 86_400_000
        )
        if (diff === 0) { prev = d; continue }
        streakAtDate = diff === 1 ? streakAtDate + 1 : 1
      }
      prev = d
    }

    const commitsOnDate = commitCountByDate[date] ?? 1
    addedXP += calcDayXP(streakAtDate, commitsOnDate)

    // Shield gain check
    // (shields are already calculated in calcStreakFromDates above)
  }

  // Extra pushes today (+5 each beyond what was already counted)
  const totalCommitsToday = commitCountByDate[today] ?? 0
  const prevCountedToday  = existingLastDate === today ? existingLastCount : 0
  const newCommitsToday   = Math.max(0, totalCommitsToday - prevCountedToday)
  const isTodayNew        = newDates.includes(today)
  // If today is new, first commit already got day bonus — extra starts from 2nd
  const extraPushes       = isTodayNew
    ? Math.max(0, newCommitsToday - 1)
    : newCommitsToday
  addedXP += calcExtraPushXP(extraPushes)

  // ── Step 4: Build final profile update ──────────────────────────────────
  const xp        = existingXP + addedXP
  const rankScore = calcRankScore(xp, currentStreak)
  const lastDate  = commitDates[commitDates.length - 1] ?? existingLastDate

  return {
    addedXP,
    newStreak: currentStreak,
    profileUpdate: {
      xp,
      current_streak:    currentStreak,
      longest_streak:    Math.max(longestStreak, existing?.longest_streak ?? 0),
      streak_shields:    updatedShields,
      last_commit_date:  lastDate,
      last_commit_count: totalCommitsToday,
      rank_score:        rankScore,
    },
  }
}
