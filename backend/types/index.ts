// ─────────────────────────────────────────────────────────────────────────────
// StreakVerse — Shared Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileData {
  id: string
  username: string
  avatar_url: string
  xp: number
  current_streak: number
  longest_streak: number
  streak_shields: number
  rank_score: number
  last_commit_date: string | null
  last_commit_count: number
  created_at?: string
}

/** One push event from GitHub Events API */
export interface GitHubPushEvent {
  type: 'PushEvent'
  created_at: string
  repo: { name: string }   // "owner/repo"
  payload: {
    commits?: Array<{ sha: string }>
    size?: number
    distinct_size?: number
  }
}

/** Result of commit detail fetch from GitHub */
export interface GitHubCommitDetail {
  sha: string
  stats: {
    additions: number
    deletions: number
    total: number
  }
}

/** What gets upserted to Supabase after a sync */
export interface ProfileUpdate {
  xp: number
  current_streak: number
  longest_streak: number
  streak_shields: number
  last_commit_date: string | null
  last_commit_count: number
  rank_score: number
}

/** Result of a full sync run */
export interface SyncResult {
  profileUpdate: ProfileUpdate
  addedXP: number
  newStreak: number
}
