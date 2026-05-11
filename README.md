# StreakVerse 🚀

> Gamified GitHub consistency platform that motivates developers to code consistently using streaks, XP, levels, and competition.

---

# 📌 Project Overview

**StreakVerse** is a web-based gamification platform designed to help developers maintain coding consistency.

The platform connects with GitHub and transforms commit activity into a game-like experience.

Users can:

* Track coding streaks 🔥
* Earn XP ⚡
* Level up 🏆
* Compete on leaderboards 📈
* Stay motivated to code consistently 💻

The primary objective of StreakVerse is:

> **To motivate developers and beginners to code consistently through gamification.**

---

# 🎯 Problem Statement

Many developers, especially beginners, struggle with coding consistency.

Common issues:

* Lack of motivation
* Irregular coding habits
* No accountability system
* GitHub contribution graph becomes inconsistent

StreakVerse solves this problem by introducing:

* Daily streak tracking
* XP system
* Competitive leaderboard
* Progress visibility
* Achievement-based motivation

---

# 👥 Target Users

### Primary Users

* Beginner Developers
* College Students
* Self-taught Programmers
* Developers building consistency

### Secondary Users

* Coding communities
* Hackathon teams
* Open-source contributors

---

# 🧱 Tech Stack

## Frontend

* Next.js (App Router)
* Tailwind CSS

## Backend

* Next.js API Routes

## Authentication

* Supabase Auth
* GitHub OAuth

## Database (Future)

* Supabase PostgreSQL

## Realtime (Future)

* Supabase Realtime

## External APIs

* GitHub REST API

## Deployment

* Vercel

---

# ⚙️ Core Features (MVP)

## 1. GitHub Authentication

### Description

Users can securely log in using their GitHub account.

### Flow

1. User clicks **Login with GitHub**
2. Redirect to GitHub OAuth page
3. User authorizes access
4. Redirect back to StreakVerse Dashboard

### Tech

* Supabase OAuth
* GitHub Provider

### Status

✅ MVP

---

## 2. Commit Streak Tracking

### Description

Tracks whether a user commits daily on GitHub.

### Logic

* At least 1 commit/day = streak +1
* Miss a day = streak reset

### Data Tracked

* Current streak
* Longest streak
* Last commit date

### Status

✅ MVP

---

## 3. XP System

### Description

Users earn XP based on coding consistency.

### XP Logic

Base XP:

```txt
1 valid coding day = 10 XP
```

Bonus XP:

```txt
5+ streak = +5 XP
10+ streak = +10 XP
```

### Purpose

Creates motivation loop.

### Status

✅ MVP

---

## 4. Level System

### Description

Users progress through levels.

### Level Mapping

| XP Range | Level    |
| -------- | -------- |
| 0–100    | Beginner |
| 100–300  | Coder    |
| 300–700  | Hacker   |
| 700+     | Legend   |

### Status

✅ MVP

---

## 5. Public Leaderboard

### Description

Shows ranking of users.

### Ranking Logic

Priority:

1. XP
2. Current streak

### Data Displayed

* Rank
* Username
* Avatar
* XP
* Streak

### Access

Public page.

No login required.

### Status

✅ MVP

---

# 🔮 Future Features (Phase 2)

## AI Commit Analysis

Analyze commit quality.

Examples:

* Good commit ✅
* Low-value commit ⚠️

Purpose:
Prevent fake streaks.

---

## Challenges & Battles

Competitive coding.

Examples:

* 1v1 coding battles
* Weekly streak contests
* Team competitions

---

## Git City Visualization

Gamified city system.

Concept:

* More commits → city grows
* Broken streak → city damage

---

# 🧠 User Flow

## Public User Flow

```txt
Landing Page
      ↓
View Leaderboard
```

## Authenticated User Flow

```txt
Landing Page
      ↓
Login with GitHub
      ↓
GitHub OAuth
      ↓
Dashboard
      ↓
View streak, XP, level
```

---

# 📁 Project Structure

```txt
/app
  page.js
  layout.js

  /leaderboard
    page.js

  /dashboard
    page.js

/components
  Navbar.jsx
  Leaderboard.jsx
  DashboardCard.jsx

/lib
  supabaseClient.js

/utils
  auth.js

/public
  images/

/styles
  globals.css
```

---

# 🔐 Authentication Rules

### Public Pages

Accessible without login:

```txt
/
/leaderboard
```

### Protected Pages

Requires login:

```txt
/dashboard
```

### Redirect Logic

If user not logged in:

```txt
/dashboard → /
```

---

# 🌐 API Requirements

## GitHub API

### Purpose

Fetch commit activity.

### Endpoint Example

```txt
https://api.github.com/users/{username}/events
```

### Required Data

Filter:

```txt
PushEvent
```

Only PushEvent counts as commits.

---

# 🗄️ Future Database Schema

## Users Table

```sql
id UUID
username TEXT
email TEXT
avatar_url TEXT
xp INTEGER
current_streak INTEGER
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

* [ ] Landing page
* [ ] GitHub login
* [ ] Dashboard auth protection
* [ ] Fetch GitHub commits
* [ ] Streak logic
* [ ] XP system
* [ ] Level system
* [ ] Public leaderboard
* [ ] Responsive UI

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

# 📄 License

MIT License

---

# 💡 Final Vision

StreakVerse is not just another GitHub tracker.

The vision is:

> **Turn coding consistency into a competitive and rewarding experience.**
