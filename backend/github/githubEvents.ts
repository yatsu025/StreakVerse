// ─────────────────────────────────────────────────────────────────────────────
// StreakVerse — GitHub Events Fetcher
// ─────────────────────────────────────────────────────────────────────────────

import type { GitHubPushEvent } from '../types'

/**
 * Fetch recent push events for a GitHub user.
 * Uses GITHUB_TOKEN if available (5000 req/hr vs 60 req/hr unauthenticated).
 */
export async function fetchUserPushEvents(username: string): Promise<GitHubPushEvent[]> {
  const headers: Record<string, string> = {}
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const res = await fetch(
    `https://api.github.com/users/${username}/events?per_page=100`,
    { headers }
  )

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} for user ${username}`)
  }

  const data = await res.json()
  return Array.isArray(data)
    ? data.filter((e: any) => e.type === 'PushEvent')
    : []
}

/**
 * Count commits per calendar date from push events.
 * Returns: { "2025-05-20": 3, "2025-05-19": 1, ... }
 */
export function countCommitsByDate(pushEvents: GitHubPushEvent[]): Record<string, number> {
  const result: Record<string, number> = {}

  for (const event of pushEvents) {
    if (event.type !== 'PushEvent') continue
    const date  = event.created_at.split('T')[0]
    const count = event.payload?.commits?.length ?? event.payload?.size ?? 1
    result[date] = (result[date] ?? 0) + count
  }

  return result
}

/**
 * Get sorted unique commit dates (oldest → newest) from push events.
 */
export function getCommitDates(pushEvents: GitHubPushEvent[]): string[] {
  return Object.keys(countCommitsByDate(pushEvents)).sort()
}
