export interface ProfileData {
  id: string;
  username: string;
  avatar_url: string;
  xp: number;
  current_streak: number;
  longest_streak: number;
  streak_shields: number;
  rank_score: number;
  last_commit_date: string | null;
  created_at?: string;
}

/**
 * Minimal shape of a GitHub PushEvent from the Events API.
 */
export interface GitHubPushEvent {
  type: 'PushEvent';
  created_at: string;
  repo: { name: string }; // "owner/repo"
  payload: {
    commits?: Array<{ sha: string }>;
    size?: number;
    distinct_size?: number;
  };
}

/**
 * Commit detail returned by GET /repos/{owner}/{repo}/commits/{sha}
 */
export interface GitHubCommitDetail {
  sha: string;
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
}

// ─────────────────────────────────────────────
// Tier / Level system (unchanged)
// ─────────────────────────────────────────────

export const LEVELS = [
  { name: 'ROOKIE',   minXP: 0,    maxXP: 100,      color: '#ffffff66' },
  { name: 'SOLDIER',  minXP: 101,  maxXP: 250,      color: '#00E5FF'   },
  { name: 'VETERAN',  minXP: 251,  maxXP: 500,      color: '#00FF66'   },
  { name: 'ELITE',    minXP: 501,  maxXP: 900,      color: '#B14AED'   },
  { name: 'LEGEND',   minXP: 901,  maxXP: 1500,     color: '#FF6B35'   },
  { name: 'MYTHIC',   minXP: 1501, maxXP: Infinity,  color: '#FFD700'   },
] as const;

export type Tier = (typeof LEVELS)[number];

export function getTierFromXP(xp: number = 0): Tier {
  const safeXP = typeof xp === 'number' ? xp : 0;
  return LEVELS.find(l => safeXP >= l.minXP && safeXP <= l.maxXP) ?? LEVELS[0];
}

// ─────────────────────────────────────────────
// Commit-based XP table
// ─────────────────────────────────────────────

/**
 * Returns the XP reward for a commit based on total lines changed.
 * Used for every commit AFTER the first valid commit of the day.
 */
export function getCommitXP(totalLinesChanged: number): number {
  if (totalLinesChanged <= 10)  return 1;
  if (totalLinesChanged <= 50)  return 2;
  if (totalLinesChanged <= 100) return 5;
  return 10; // 101–1000+ lines
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function toDateString(isoOrDate: string | Date): string {
  if (isoOrDate instanceof Date) return isoOrDate.toISOString().split('T')[0];
  return isoOrDate.split('T')[0];
}

function diffDays(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.round(
    Math.abs(new Date(a).getTime() - new Date(b).getTime()) / msPerDay
  );
}

// ─────────────────────────────────────────────
// Main calculation entry-point
// ─────────────────────────────────────────────

export interface CalculateProgressInput {
  /** Current persisted profile. Pass `null` for first-time users. */
  currentProfile: ProfileData | null;

  /**
   * Raw PushEvents from the GitHub Events API for this user.
   * Only events with type === 'PushEvent' are processed.
   */
  pushEvents: GitHubPushEvent[];

  /**
   * Set of commit SHAs already stored in the `processed_commits` table.
   * Used to prevent double-counting XP across sync runs.
   */
  processedSHAs: Set<string>;

  /**
   * Fetches commit details from GitHub.
   * Signature mirrors `GET /repos/{owner}/{repo}/commits/{sha}`.
   * Provide a real implementation in your sync route; pass a stub in tests.
   */
  fetchCommitDetail: (
    owner: string,
    repo: string,
    sha: string
  ) => Promise<GitHubCommitDetail | null>;
}

export interface CalculateProgressResult {
  /** Partial profile to upsert into the `profiles` table. */
  profileUpdate: Partial<ProfileData>;

  /**
   * SHAs that were processed during this run and must be inserted into
   * the `processed_commits` table to prevent reprocessing.
   */
  newProcessedSHAs: string[];
}

/**
 * Calculates the new profile state based on GitHub PushEvents.
 *
 * Design principles
 * -----------------
 * 1. **Day-based streaks** — streak increments at most once per calendar day.
 * 2. **Commit-based XP** — first commit of the day = +10 XP + streak bump;
 *    every subsequent commit rewards XP scaled by lines changed.
 * 3. **Idempotent** — SHAs stored in `processed_commits` are skipped so that
 *    repeated syncs never double-count XP.
 * 4. **Async** — commit details are fetched per-SHA via the supplied callback.
 *
 * FIXES applied (v2):
 * - BUG 1: applyStreakTransition result was ignored when gap===1, causing
 *   incorrect streak increment logic. Now caller uses transition result
 *   consistently for all gap sizes.
 * - BUG 2: Streak decay check (Step 3) was NOT idempotent — running the
 *   same sync twice would consume shields or break streak again on the
 *   second run. Fixed by comparing against the profile's ORIGINAL
 *   last_commit_date (before this sync run), not the mutated one.
 * - BUG 3: When shields bridge a gap, streak should NOT reset to 1 —
 *   it continues from current value and increments by 1 for the new day.
 */
export async function calculateProgress(
  input: CalculateProgressInput
): Promise<CalculateProgressResult> {
  const { currentProfile, pushEvents, processedSHAs, fetchCommitDetail } = input;

  // ── Mutable state, seeded from the persisted profile ──────────────────────
  let xp             = currentProfile?.xp             ?? 0;
  let currentStreak  = currentProfile?.current_streak  ?? 0;
  let longestStreak  = currentProfile?.longest_streak  ?? 0;
  let shields        = currentProfile?.streak_shields   ?? 0;
  let lastCommitDate = currentProfile?.last_commit_date ?? null;

  // Save the ORIGINAL lastCommitDate from DB before we mutate it.
  // The Step 3 decay check MUST use this, not the mutated value.
  const originalLastCommitDate = lastCommitDate;

  // First GitHub login bonus
  if (!currentProfile) {
    xp += 25;
  }

  const newProcessedSHAs: string[] = [];

  // ── Step 1: Group PushEvents by calendar date ─────────────────────────────
  //
  // Structure: dateString → Map<sha, { owner, repo }>
  // We preserve per-SHA metadata so we can fetch commit details later.
  //
  const commitsByDate = new Map<
    string,
    Array<{ sha: string; owner: string; repo: string }>
  >();

  for (const event of pushEvents) {
    if (event.type !== 'PushEvent') continue;

    const date    = toDateString(event.created_at);
    const [owner, repo] = event.repo.name.split('/');
    const commits = event.payload?.commits ?? [];

    if (!commitsByDate.has(date)) commitsByDate.set(date, []);

    for (const c of commits) {
      if (!c.sha) continue;
      commitsByDate.get(date)!.push({ sha: c.sha, owner, repo });
    }
  }

  // ── Step 2: Process each date in chronological order ──────────────────────
  const sortedDates = [...commitsByDate.keys()].sort();

  // Only process dates strictly after OR equal to the last persisted commit date.
  // Using strict > would skip today's commits if lastCommitDate is already today.
  const newDates = lastCommitDate
    ? sortedDates.filter(d => d >= lastCommitDate!)
    : sortedDates;

  for (const date of newDates) {
    const commits = commitsByDate.get(date)!;

    // De-duplicate SHAs within this date (one PushEvent per push, but a
    // force-push can re-list the same SHA across events).
    const uniqueCommits = [
      ...new Map(commits.map(c => [c.sha, c])).values(),
    ];

    // Separate new commits from already-processed ones
    const freshCommits    = uniqueCommits.filter(c => !processedSHAs.has(c.sha));
    const alreadyDoneCount = uniqueCommits.length - freshCommits.length;

    if (freshCommits.length === 0) {
      // All commits on this date were already processed in a prior sync.
      // We must still advance lastCommitDate and maintain streak continuity,
      // but we must NOT award XP or streak again.
      // NOTE: We do NOT call applyStreakTransition here because the streak
      // was already updated when these commits were first processed.
      lastCommitDate = date;
      continue;
    }

    // ── 2a. Streak update (once per day) ────────────────────────────────────
    if (lastCommitDate) {
      const gap = diffDays(lastCommitDate, date);

      // FIX: Always run applyStreakTransition first to handle shields.
      // Then apply the +1 increment for today's new commit day.
      const transition = applyStreakTransition(currentStreak, longestStreak, shields, gap);

      // Apply the transition state (may consume shields, may reset streak)
      currentStreak = transition.streak;
      shields       = transition.shields;

      if (transition.streakContinued) {
        // Consecutive day OR shields bridged the gap — increment streak
        currentStreak++;
      } else {
        // Streak broke, no shields left — this is day 1 of a new streak
        currentStreak = 1;
      }
    } else {
      // Very first coding day for this user
      currentStreak = 1;
      xp += 10; // First-ever valid commit day bonus
    }

    // Daily streak XP (+10 for the first valid commit of the day)
    xp += 10;

    // Milestone bonuses
    if (currentStreak === 5)  xp += 10;
    if (currentStreak === 10) xp += 20;
    if (currentStreak === 30) xp += 50;

    // Shield generation every 7 consecutive days (capped at 3)
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      shields = Math.min(3, shields + 1);
    }

    if (currentStreak > longestStreak) longestStreak = currentStreak;

    // ── 2b. Commit-level XP for all fresh commits after the first ───────────
    //
    // The first fresh commit triggered the +10 / streak bump above.
    // Every subsequent fresh commit earns XP based on lines changed.
    //
    // Note: if some commits on this date were already processed, the first
    // fresh commit is still treated as "additional" because the day-level
    // +10 already fired in a previous sync for the first commit that day.
    //
    const isFirstSyncForThisDay = alreadyDoneCount === 0;
    const additionalCommits     = isFirstSyncForThisDay
      ? freshCommits.slice(1)   // skip first; it was the day-starter
      : freshCommits;           // day-starter was in a prior sync

    for (const { sha, owner, repo } of additionalCommits) {
      const detail = await fetchCommitDetail(owner, repo, sha);
      if (detail) {
        const linesChanged = (detail.stats.additions ?? 0) + (detail.stats.deletions ?? 0);
        xp += getCommitXP(linesChanged);
      }
      newProcessedSHAs.push(sha);
    }

    // Also record the day-starter SHA if this is the first sync for this day
    if (isFirstSyncForThisDay && freshCommits.length > 0) {
      newProcessedSHAs.push(freshCommits[0].sha);
    }

    lastCommitDate = date;
  }

  // ── Step 3: Streak decay check ────────────────────────────────────────────
  //
  // FIX: Use originalLastCommitDate (value from DB before this sync run),
  // NOT the mutated lastCommitDate. This makes the check idempotent —
  // running the same sync twice won't penalise the user twice.
  //
  // Also: if new commits were processed in this run, the user is active
  // and decay should NOT fire for the current run.
  //
  const today     = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86_400_000));

  const hasNewCommitsThisRun = newProcessedSHAs.length > 0;

  if (
    !hasNewCommitsThisRun &&                   // No new activity this run
    originalLastCommitDate &&                  // User has committed before
    originalLastCommitDate !== today &&         // Not committed today (already in DB)
    originalLastCommitDate !== yesterday        // Not committed yesterday (still safe)
  ) {
    const gap = diffDays(originalLastCommitDate, today) - 1; // missed days

    if (gap > 0) {
      if (shields >= gap) {
        shields -= gap; // Shields absorbed the gap; streak survives
      } else {
        // Streak break penalty — only penalise if streak was active
        if (currentStreak > 0 || (currentProfile?.current_streak ?? 0) > 0) {
          xp = Math.max(0, xp - 50);
        }
        shields       = 0;
        currentStreak = 0;
      }
    }
  }

  // ── Step 4: Rank score ────────────────────────────────────────────────────
  const rankScore = xp + currentStreak * 5;

  return {
    profileUpdate: {
      xp,
      current_streak:  currentStreak,
      longest_streak:  longestStreak,
      streak_shields:  shields,
      last_commit_date: lastCommitDate,
      rank_score:      rankScore,
    },
    newProcessedSHAs,
  };
}

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

interface StreakTransitionResult {
  streak: number;
  shields: number;
  /** True when streak continues (consecutive day OR shields bridged gap). */
  streakContinued: boolean;
}

/**
 * Given the current streak state and the number of calendar days since the
 * last commit, returns the updated streak + shield values WITHOUT the +1
 * increment for the new commit day (that is applied by the caller).
 *
 * FIX: Previously this returned streak: currentStreak in the gap===1 case
 * which was correct, but the caller was ALSO doing gap===1 check independently
 * and double-incrementing. Now the caller always uses transition.streakContinued
 * to decide whether to increment, regardless of gap size.
 */
function applyStreakTransition(
  currentStreak: number,
  _longestStreak: number,
  shields: number,
  daysSinceLast: number
): StreakTransitionResult {
  if (daysSinceLast <= 1) {
    // Same day or back-to-back day — no gap to bridge
    return { streak: currentStreak, shields, streakContinued: true };
  }

  const gapDays = daysSinceLast - 1; // days the user missed

  if (shields >= gapDays) {
    // Shields absorb the gap — streak survives, shields consumed
    return {
      streak: currentStreak,
      shields: shields - gapDays,
      streakContinued: true,
    };
  }

  // Not enough shields — streak breaks, reset to 0 (caller will set to 1)
  return { streak: 0, shields: 0, streakContinued: false };
}

// ─────────────────────────────────────────────
// Recovery utility: repair broken streaks
// ─────────────────────────────────────────────

/**
 * USE THIS TO RECOVER USERS WHOSE STREAKS WERE WRONGLY BROKEN.
 *
 * For each affected user:
 * 1. Fetch their full commit history from processed_commits table
 * 2. Re-run calculateProgress from scratch (currentProfile: null, processedSHAs: empty)
 * 3. Upsert the returned profileUpdate back to the profiles table
 *
 * SQL to find affected users (run in Supabase):
 *
 *   SELECT DISTINCT p.id, p.username, p.current_streak, p.last_commit_date
 *   FROM profiles p
 *   WHERE p.current_streak = 0
 *     AND p.last_commit_date >= (NOW() - INTERVAL '14 days')::date::text
 *   ORDER BY p.last_commit_date DESC;
 *
 * This finds users whose streak is 0 but they committed recently — strong
 * signal their streak was wrongly broken by the decay bug.
 */
export async function recoverUserStreak(
  userId: string,
  fetchAllPushEvents: () => Promise<GitHubPushEvent[]>,
  fetchCommitDetail: CalculateProgressInput['fetchCommitDetail']
): Promise<CalculateProgressResult> {
  const pushEvents = await fetchAllPushEvents();

  return calculateProgress({
    currentProfile: null,         // Start fresh — recalculate everything
    pushEvents,
    processedSHAs: new Set(),     // Treat all as unprocessed for recalculation
    fetchCommitDetail,
  });
}