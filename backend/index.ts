// ─────────────────────────────────────────────────────────────────────────────
// StreakVerse Backend — Central Export
// Import everything from here instead of individual files.
// ─────────────────────────────────────────────────────────────────────────────

// Types
export type { ProfileData, GitHubPushEvent, GitHubCommitDetail, ProfileUpdate, SyncResult } from './types'

// Database
export { getSupabaseClient, getSupabaseAdmin } from './db/supabaseClient'

// Auth
export { signInWithGitHub, signOut } from './auth/githubAuth'

// Streak
export { calcStreakFromDates, applyShieldGain as streakShieldGain } from './streak/streakLogic'

// Shields
export { applyShieldGain, applyShieldDecay, daysUntilNextShield, MAX_SHIELDS, SHIELD_EARN_EVERY } from './shields/shieldLogic'

// XP
export { calcDayXP, calcExtraPushXP, calcRankScore, XP_DAY_BONUS, XP_EXTRA_PUSH, XP_FIRST_LOGIN } from './xp/xpLogic'

// Tiers
export { getTierFromXP, xpProgressInTier, xpToNextTier, LEVELS } from './tiers/tierLogic'
export type { Tier } from './tiers/tierLogic'

// GitHub
export { fetchUserPushEvents, countCommitsByDate, getCommitDates } from './github/githubEvents'

// Sync (main calculation)
export { calcProfileUpdate } from './sync/syncProfile'
