# StreakVerse 🚀

> Gamified GitHub consistency platform that motivates developers to code consistently using streaks, XP, levels, and competition.

---

## 📌 Project Overview

**StreakVerse** connects with GitHub and transforms your commit activity into a competitive game — streaks, XP, tiers, shields, and a global leaderboard.

---

## ✅ What's Complete

### Core Infrastructure
- Next.js 15 App Router + React 19 + Tailwind CSS
- GitHub OAuth via Supabase Auth
- Supabase PostgreSQL database


### Authentication
- GitHub OAuth login
- Auto profile creation on first login
- Session management with Supabase

### Streak System
- Day-based streaks — 1 commit per day = +1 streak
- Streak resets if no commit today or yesterday
- Longest streak tracked
- **Streak Shields** — 1 shield earned every 7 consecutive days (max 3)

### XP System
- **+10 XP** per new commit day (day bonus)
- **+5 XP** per additional push on the same day (2nd, 3rd push etc.)
- **Milestone bonuses**: 5-day streak (+10), 10-day (+20), 30-day (+50)
- XP carries forward — never resets on sync
- `last_commit_count` tracks same-day pushes to avoid double-counting

### Rank & Tier System
- **Rank Score** = `xp + (current_streak × 5)`
- **Tiers**:
  | Tier | XP Range |
  |------|----------|
  | ROOKIE | 0 – 100 |
  | SOLDIER | 101 – 250 |
  | VETERAN | 251 – 500 |
  | ELITE | 501 – 900 |
  | LEGEND | 901 – 1500 |
  | MYTHIC | 1501+ |

### Sync System
- **Auto-poll** — silent background sync every 5 minutes when dashboard is open
- **Manual sync** — MANUAL_SYNC button on dashboard
- **GitHub Webhook** — real-time sync on every push via `/api/github/webhook`
- Webhook verifies GitHub signature for security

### UI / UX
- Gamified dark theme with neon accents (cyber/military aesthetic)
- Orbitron + Share Tech Mono fonts
- Animated XP progress bar, streak shields, badge unlocks
- Responsive — mobile + desktop
- Attractive landing page with stats, leaderboard preview, feature cards

### Leaderboard
- Public global leaderboard
- Sorted by Rank Score → XP → Current Streak
- Medal icons for top 3

---

## 🏗️ Project Structure

```
StreakVerse/
├── app/
│   ├── api/
│   │   └── github/
│   │       └── webhook/
│   │           └── route.ts      # GitHub webhook handler (auto-sync on push)
│   ├── dashboard/
│   │   └── page.tsx              # Gamified dashboard (protected)
│   ├── leaderboard/
│   │   └── page.jsx              # Global leaderboard
│   ├── layout.jsx                # Root layout + Navbar
│   └── page.tsx                  # Landing page
├── components/
│   ├── DashboardCard.jsx         # Stat cards
│   ├── Leaderboard.jsx           # Leaderboard component
│   └── Navbar.tsx                # Navigation with active link + mobile menu
├── lib/
│   ├── supabaseClient.js         # Supabase client
│   └── streakUtils.ts            # XP, streak, tier, shield logic
├── styles/
│   └── globals.css               # Tailwind + custom utilities
├── utils/
│   └── auth.js                   # GitHub OAuth helpers
├── .env.example                  # Environment variable template
└── supabase_migration.sql        # DB migration (run in Supabase SQL Editor)
```

---

## ⚙️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Backend | Next.js API Routes (App Router) |
| Auth | Supabase Auth (GitHub OAuth) |
| Database | Supabase PostgreSQL |
| Deployment | Vercel |
| Sync | GitHub Webhooks + Auto-polling |

---

## 🚀 Getting Started (Local)

### 1. Clone & Install

```bash
git clone https://github.com/yatsu025/StreakVerse.git
cd StreakVerse
npm install --legacy-peer-deps
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional (webhook security + higher GitHub API rate limit)
GITHUB_WEBHOOK_SECRET=any_random_string
GITHUB_TOKEN=your_github_pat
```

| Variable | Where to get |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` key |
| `GITHUB_WEBHOOK_SECRET` | Any random string you choose |
| `GITHUB_TOKEN` | GitHub → Settings → Developer settings → Personal access tokens |

### 3. Supabase Migration

Run this in **Supabase SQL Editor**:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_commit_count INTEGER DEFAULT 0;
```

### 4. GitHub OAuth Setup

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Copy Client ID + Secret → Supabase → Authentication → Providers → GitHub

### 5. Run

```bash
npm run dev
```

Open `http://localhost:3000`

---

## 🌐 Production Deployment (Vercel)

### Environment Variables

Add these in **Vercel → Project → Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GITHUB_WEBHOOK_SECRET      (optional)
GITHUB_TOKEN               (optional)
```

### GitHub Webhook Setup (Real-time sync)

1. Go to any GitHub repo → **Settings → Webhooks → Add webhook**
2. **Payload URL**: `https://your-app.vercel.app/api/github/webhook`
3. **Content type**: `application/json`
4. **Secret**: same value as `GITHUB_WEBHOOK_SECRET`
5. **Events**: Just the push event
6. Save

Now every push to that repo instantly updates XP + streak — no manual sync needed.

> **Note**: Webhook is per-repo. Add it to each repo you want tracked. The auto-poll (every 5 min) covers repos without webhooks.

---

## 🧪 Testing Sync

### Auto-poll
- Open dashboard → push to any public repo → wait 5 minutes → XP updates automatically

### Manual sync
- Click **MANUAL_SYNC** button on dashboard

### Webhook
- Push to a repo that has the webhook configured
- Check **GitHub → repo → Settings → Webhooks → Recent Deliveries** — should show green ✓
- Check **Vercel → Functions → Logs** — should show `[Webhook] ✓ Profile updated for username`

---

## 📊 XP Rules Summary

| Action | XP |
|--------|----|
| First push of the day | +10 |
| 2nd, 3rd... push same day | +5 each |
| 5-day streak milestone | +10 (once) |
| 10-day streak milestone | +20 (once) |
| 30-day streak milestone | +50 (once) |
| First login ever | +25 |

---

## 🗺️ Roadmap

### Phase 1 — MVP ✅ Complete
- [x] GitHub OAuth
- [x] Streak tracking
- [x] XP system with milestones
- [x] Tier system (ROOKIE → MYTHIC)
- [x] Streak shields
- [x] Global leaderboard
- [x] Auto-sync (polling + webhook)
- [x] Gamified dashboard UI
- [x] Attractive landing page
- [x] Vercel deployment

### Phase 2 — Coming Soon
- [x] History of commit & strike
- [ ] Team streaks & battles.
- [ ] Activity heatmap (GitHub-style contribution grid)
- [ ] Rewards & badges system
- [ ] Private repo support (via GitHub App)

### Phase 3 — Future
- [ ] Daily mission hub
- [ ] AI commit quality analysis
- [ ] Weekly challenges
- [ ] Email/push notifications for streak reminders

---

## 💡 Vision

> **Turn coding consistency into a competitive and rewarding experience.**

StreakVerse is not just a GitHub tracker — it's a game where your discipline is your character.
