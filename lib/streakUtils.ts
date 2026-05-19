/**
 * StreakVerse Core Logic Utils
 * Handles XP, Streaks, Shields, Levels, and Ranking calculations.
 */

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

export const LEVELS = [
  { name: 'ROOKIE', minXP: 0, maxXP: 100, color: '#ffffff66' },
  { name: 'SOLDIER', minXP: 101, maxXP: 250, color: '#00E5FF' },
  { name: 'VETERAN', minXP: 251, maxXP: 500, color: '#00FF66' },
  { name: 'ELITE', minXP: 501, maxXP: 900, color: '#B14AED' },
  { name: 'LEGEND', minXP: 901, maxXP: 1500, color: '#FF6B35' },
  { name: 'MYTHIC', minXP: 1501, maxXP: Infinity, color: '#FFD700' },
];

export function getTierFromXP(xp: number = 0) {
  const safeXP = typeof xp === 'number' ? xp : 0;
  return LEVELS.find(l => safeXP >= l.minXP && safeXP <= l.maxXP) || LEVELS[0];
}

/**
 * Calculates the new profile state based on GitHub PushEvents
 */
export function calculateProgress(
  currentProfile: ProfileData | null,
  pushEvents: any[]
): Partial<ProfileData> {
  // 1. Group commits by date (PushEvents only)
  const commitsByDate: Record<string, number> = {};
  
  pushEvents.forEach(event => {
    if (event.type === 'PushEvent') {
      const date = event.created_at.split('T')[0];
      // Some PushEvents might report 0 size in certain API responses, 
      // but the existence of a PushEvent itself is valid activity.
      const commitCount = Math.max(1, event.payload?.size || event.payload?.distinct_size || 0);
      commitsByDate[date] = (commitsByDate[date] || 0) + commitCount;
    }
  });

  // 2. Identify valid coding days (>= 1 commit)
  const validDates = Object.keys(commitsByDate)
    .filter(date => commitsByDate[date] >= 1)
    .sort();

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let xp = currentProfile?.xp || 0;
  let currentStreak = currentProfile?.current_streak || 0;
  let longestStreak = currentProfile?.longest_streak || 0;
  let shields = currentProfile?.streak_shields || 0;
  let lastCommitDate = currentProfile?.last_commit_date || null;

  // Initial login bonus
  if (!currentProfile) {
    xp += 25; // First GitHub login
  }

  // 3. Process each valid date to update streak and XP
  // We only process dates AFTER the last_commit_date to avoid double counting XP
  const newValidDates = lastCommitDate 
    ? validDates.filter(d => d > lastCommitDate!)
    : validDates;

  newValidDates.forEach(date => {
    // First valid commit day bonus
    if (!lastCommitDate) {
      xp += 10;
    }

    xp += 10; // 1 valid coding day = +10 XP
    
    // Streak logic
    if (lastCommitDate) {
      const prevDate = new Date(lastCommitDate);
      const currDate = new Date(date);
      const diffDays = Math.round(Math.abs(currDate.getTime() - prevDate.getTime()) / 86400000);
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        // Gap occurred. Use shields if available.
        // For simplicity in this logic, we assume shields are consumed during the gap.
        // In a real periodic sync, this might be more complex.
        const gap = diffDays - 1;
        const shieldsToUse = Math.min(gap, shields);
        
        if (shieldsToUse >= gap) {
          shields -= gap;
          currentStreak++; // Streak continues
        } else {
          shields = 0;
          currentStreak = 1; // Streak resets to 1 for the new day
        }
      }
    } else {
      currentStreak = 1;
    }

    // Streak bonuses
    if (currentStreak === 5) xp += 10;
    if (currentStreak === 10) xp += 20;
    if (currentStreak === 30) xp += 50;

    // Shield generation (Every 7 consecutive valid days gives 1 shield)
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      shields = Math.min(3, shields + 1);
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    lastCommitDate = date;
  });

  // 4. Check for streak decay if they haven't committed today/yesterday
  if (lastCommitDate && lastCommitDate !== today && lastCommitDate !== yesterday) {
    const lastDate = new Date(lastCommitDate);
    const todayDate = new Date(today);
    const diffDays = Math.round(Math.abs(todayDate.getTime() - lastDate.getTime()) / 86400000);
    
    // If they missed days, consume shields or reset
    const gap = diffDays - 1; // days since last valid commit that should have been active
    if (gap > 0) {
      if (shields >= gap) {
        // Streak is still "active" because shields protected it
        shields -= gap;
      } else {
        // STREAK BREAK! 
        // Penalty: Reset streak and deduct 50 XP if streak was active
        if (currentStreak > 0 || (currentProfile?.current_streak || 0) > 0) {
          xp = Math.max(0, xp - 50);
        }
        shields = 0;
        currentStreak = 0;
      }
    }
  }

  // 5. Rank Score Formula: xp + (current_streak * 5)
  const rankScore = xp + (currentStreak * 5);

  return {
    xp,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    streak_shields: shields,
    last_commit_date: lastCommitDate,
    rank_score: rankScore,
  };
}