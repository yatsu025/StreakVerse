# StreakVerse 🚀

> Gamified GitHub consistency platform that motivates developers to code consistently using streaks, XP, levels, and competition.

---

# 📌 Project Overview

**StreakVerse** is a web-based gamification platform designed to help developers maintain coding consistency.
The platform connects with GitHub and transforms commit activity into a game-like experience.

### ✅ Done So Far:
* **Architecture Refactor**: Implemented a fair, anti-abuse streak and XP system.
* **Fair Streak Logic**: Requires 1+ commit per day; PushEvents only.
* **Streak Shield**: Earn 1 shield every 7 days (max 3) to protect against resets.
* **New XP System**: Balanced XP gains with streak bonuses (5, 10, 30 days).
* **Rank Score Formula**: `xp + (current_streak * 5)` for competitive ranking.
* **Periodic Sync**: Removed "real-time" wording for realistic periodic/manual syncing.
* **UI Refresh**: Dashboard and Leaderboard updated with Tiers and Rank Scores.

---

#  Tech Stack

## Frontend & Backend
* **Next.js 15+** (App Router)
* **React 19**
* **Tailwind CSS**

## Authentication & Database
* **Supabase Auth** (GitHub OAuth)
* **Supabase PostgreSQL**

---

# ⚙️ Core Features

## 1. GitHub Authentication ✅
* Secure login using GitHub account.
* Automatic profile creation in Supabase.

## 2. Commit Streak Tracking ✅
* **Rule**: Minimum 1 commit per day (PushEvents only).
* **Shields**: 1 shield earned every 7-day streak (Max 3). Shields prevent reset on missed days.
* **Tracking**: Longest streak and last commit date logged.

## 3. XP & Rank System ✅
* **XP**: +10 per valid day. Bonuses: 5d (+10), 10d (+20), 30d (+50).
* **Rank Score**: `xp + (current_streak * 5)`.
* **Tiers**: ROOKIE (0-100) → SOLDIER (101-250) → VETERAN (251-500) → ELITE (501-900) → LEGEND (901-1500) → MYTHIC (1501+).

## 4. Global Arena ✅
* Periodic/Manual sync to prevent API abuse.
* Leaderboard sorted by Rank Score, then XP, then Current Streak.

---

# 📁 Project Structure

```text
StreakVerse/
├── app/                  # Next.js App Router
│   ├── dashboard/        # User Arsenal (Private)
│   │   └── page.tsx      # Dashboard implementation
│   ├── leaderboard/      # Global Arena (Public)
│   │   └── page.jsx      # Leaderboard implementation
│   ├── layout.jsx        # Root Layout & Global Navbar
│   └── page.tsx          # Home Page (Landing)
├── components/           # Reusable UI Components
│   ├── DashboardCard.jsx # Gamified Stat Cards
│   ├── Leaderboard.jsx   # Rankings Logic & UI
│   └── Navbar.tsx        # Global Navigation
├── lib/                  # Shared Library Instances
│   └── supabaseClient.js # Supabase Client Initialization
├── styles/               # Global CSS & Themes
│   └── globals.css       # Custom Neon & Cyber Utilities
├── utils/                # Helper Logic
│   └── auth.js           # GitHub OAuth & Session Logic
└── package.json          # Dependencies & Scripts
```

---

# 🚀 Getting Started

1. **Clone the repo**
2. **Install dependencies**: `npm install --legacy-peer-deps`
3. **Set up .env**: Add your Supabase credentials.
4. **Run dev server**: `npm run dev`

---

# 🌐 Deployment

Deployed on **Vercel**. 
*Note: Build uses `--legacy-peer-deps` to ensure React 19 compatibility with all UI libraries.*

longest_streak INTEGER
last_commit_date DATE
created_at TIMESTAMP
```

## Commits Table

```sql
id UUID
user_id UUID
date DATE
commit_count INTEGER
```

---

# 🎨 UI/UX Design Guidelines

### Theme

* Dark Mode
* Gaming-style aesthetics
* Futuristic feel

### Colors

* Purple
* Blue
* Cyan neon accents

### UI Principles

* Clean layout
* Responsive design
* Smooth animations
* Minimal clutter

---

# 🚀 Setup Instructions

## 1. Clone Repository

```bash
git clone <repo-url>
cd streakverse
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Create Environment File

Create:

```txt
.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 4. Setup GitHub OAuth

Go to GitHub Developer Settings.

Create OAuth App.

Set:

### Homepage URL

```txt
http://localhost:3000
```

### Callback URL

```txt
https://YOUR_PROJECT.supabase.co/auth/v1/callback
```

Copy:

* Client ID
* Client Secret

Add to Supabase Authentication Providers.

---

## 5. Run Project

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# 🧪 MVP Checklist

* [x] Landing page
* [x] GitHub login
* [x] Dashboard auth protection
* [x] Fetch GitHub commits
* [x] Streak logic
* [x] XP system
* [x] Public leaderboard
* [x] Responsive UI
* [ ] Level system (based on XP ranges)
* [ ] Bonus XP for streaks (5+ streak = +5 XP, 10+ = +10 XP)
* [ ] Longest streak tracking
* [ ] Last commit date tracking
* [ ] Enhanced streak logic (reset on miss, continue on consecutive days)

---

# 📊 Project Status Summary

## ✅ Completed Features

### Core Infrastructure
- **Project Setup**: Next.js with App Router, Tailwind CSS, Supabase integration
- **Authentication**: GitHub OAuth login via Supabase
- **Database**: Supabase client setup and basic profile table usage
- **UI Components**: Responsive design with glass-panel styling, dark theme

### MVP Features Implemented
- **Landing Page**: Welcome screen with login button and dashboard redirect
- **Dashboard**: Protected page showing user profile, XP, and current streak
- **GitHub Integration**: Fetches user events and filters PushEvents (commits)
- **Streak Tracking**: Basic streak calculation (consecutive commit days)
- **XP System**: 10 XP per commit (basic implementation)
- **Leaderboard**: Public page displaying top users by XP and streak
- **Responsive UI**: Mobile-friendly layouts using Tailwind CSS

### Code Quality
- **Component Structure**: Modular components (DashboardCard, Leaderboard, Navbar)
- **State Management**: React hooks for auth and data fetching
- **Error Handling**: Basic error states in leaderboard and dashboard

## ❌ Remaining Work

### MVP Completion
- **Level System**: Implement XP-to-level mapping (Beginner, Coder, Hacker, Legend)
- **Enhanced XP Logic**: Add bonus XP for streak milestones (5+ days = +5 XP, 10+ = +10 XP)
- **Streak Improvements**: 
  - Track longest streak
  - Store last commit date
  - Proper streak reset logic (miss a day = reset to 0)
- **Database Schema**: Complete profiles table with all required fields

### Future Enhancements (Phase 2)
- **AI Commit Analysis**: Quality assessment of commits
- **Challenges & Battles**: Competitive features
- **Git City Visualization**: Gamified progress visualization
- **Realtime Updates**: Live leaderboard and streak updates

### Technical Debt
- **Testing**: Add unit and integration tests
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Optimize GitHub API calls and caching
- **Security**: Validate and sanitize all user inputs and API responses

---

# 📈 Roadmap

### Phase 1 (MVP)

* Authentication
* Streaks
* XP
* Levels
* Leaderboard

### Phase 2

* AI Commit Analysis
* Battles
* Weekly Challenges

### Phase 3

* Git City
* Teams
* Rewards System

---

# 🤝 Contribution Guide

Before contributing:

1. Fork repository
2. Create feature branch
3. Follow existing code style
4. Test changes
5. Create pull request

---



---

# 💡 Final Vision

StreakVerse is not just another GitHub tracker.

The vision is:

> **Turn coding consistency into a competitive and rewarding experience.**
