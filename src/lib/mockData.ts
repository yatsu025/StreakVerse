export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  xp: number;
  current_streak: number;
  longest_streak: number;
  last_commit_date: string;
}

export interface CommitDay {
  date: string;
  commit_count: number;
}

export function getLevel(xp: number): { name: string; color: string; min: number; max: number } {
  if (xp >= 700) return { name: "Legend", color: "neon-orange", min: 700, max: 1000 };
  if (xp >= 300) return { name: "Hacker", color: "neon-purple", min: 300, max: 700 };
  if (xp >= 100) return { name: "Coder", color: "neon-cyan", min: 100, max: 300 };
  return { name: "Beginner", color: "neon-green", min: 0, max: 100 };
}

export function getXpProgress(xp: number): number {
  const level = getLevel(xp);
  return Math.min(((xp - level.min) / (level.max - level.min)) * 100, 100);
}

export const currentUser: User = {
  id: "1",
  username: "devninja42",
  email: "devninja42@github.com",
  avatar_url: "https://api.dicebear.com/9.x/pixel-art/svg?seed=devninja42",
  xp: 450,
  current_streak: 12,
  longest_streak: 34,
  last_commit_date: "2026-03-27",
};

export const recentCommits: CommitDay[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i);
  return {
    date: d.toISOString().split("T")[0],
    commit_count: Math.floor(Math.random() * 8) + (i < 12 ? 1 : 0),
  };
}).reverse();

export const leaderboardUsers: User[] = [
  { id: "10", username: "streakqueen", email: "", avatar_url: "https://api.dicebear.com/9.x/pixel-art/svg?seed=streakqueen", xp: 920, current_streak: 45, longest_streak: 45, last_commit_date: "2026-03-27" },
  { id: "11", username: "codesamurai", email: "", avatar_url: "https://api.dicebear.com/9.x/pixel-art/svg?seed=codesamurai", xp: 780, current_streak: 30, longest_streak: 52, last_commit_date: "2026-03-27" },
  { id: "12", username: "bytemaster", email: "", avatar_url: "https://api.dicebear.com/9.x/pixel-art/svg?seed=bytemaster", xp: 650, current_streak: 22, longest_streak: 38, last_commit_date: "2026-03-26" },
  { id: "1", username: "devninja42", email: "", avatar_url: "https://api.dicebear.com/9.x/pixel-art/svg?seed=devninja42", xp: 450, current_streak: 12, longest_streak: 34, last_commit_date: "2026-03-27" },
  { id: "13", username: "rustacean", email: "", avatar_url: "https://api.dicebear.com/9.x/pixel-art/svg?seed=rustacean", xp: 380, current_streak: 8, longest_streak: 20, last_commit_date: "2026-03-27" },
  { id: "14", username: "gitguru", email: "", avatar_url: "https://api.dicebear.com/9.x/pixel-art/svg?seed=gitguru", xp: 310, current_streak: 15, longest_streak: 15, last_commit_date: "2026-03-25" },
  { id: "15", username: "pixelpusher", email: "", avatar_url: "https://api.dicebear.com/9.x/pixel-art/svg?seed=pixelpusher", xp: 240, current_streak: 5, longest_streak: 18, last_commit_date: "2026-03-27" },
  { id: "16", username: "nullpointer", email: "", avatar_url: "https://api.dicebear.com/9.x/pixel-art/svg?seed=nullpointer", xp: 180, current_streak: 3, longest_streak: 12, last_commit_date: "2026-03-24" },
  { id: "17", username: "asyncawait", email: "", avatar_url: "https://api.dicebear.com/9.x/pixel-art/svg?seed=asyncawait", xp: 120, current_streak: 7, longest_streak: 10, last_commit_date: "2026-03-27" },
  { id: "18", username: "newbiecoder", email: "", avatar_url: "https://api.dicebear.com/9.x/pixel-art/svg?seed=newbiecoder", xp: 50, current_streak: 2, longest_streak: 5, last_commit_date: "2026-03-26" },
];
