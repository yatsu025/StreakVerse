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

```text
StreakVerse/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── dashboard/        # User Arsenal (Private)
│   │   └── page.js       # Dashboard implementation
│   ├── leaderboard/      # Global Arena (Public)
│   │   └── page.js       # Leaderboard implementation
│   ├── layout.js         # Root Layout & Global Configurations
│   └── page.js           # Home Page (Landing)
├── components/           # Reusable UI Components
│   ├── DashboardCard.jsx # Gamified Stat Cards
│   ├── Leaderboard.jsx   # Rankings Logic & UI
│   └── Sidebar.jsx       # Navigation Command Center
├── lib/                  # Shared Library Instances
│   └── supabaseClient.js # Supabase Client Initialization
├── styles/               # Global CSS & Themes
│   └── globals.css       # Custom Neon & Cyber Utilities
├── utils/                # Helper Logic
│   └── auth.js           # GitHub OAuth & Session Logic
├── tailwind.config.ts    # Design System & Animations
└── package.json          # Dependencies & Scripts
```

### 🛠️ Core File Descriptions

* **[`app/layout.js`](file:///c:/Users/yashs/OneDrive/Desktop/yash/project/StreakVerse/app/layout.js)**: Configures global fonts (**Orbitron** & **Space Grotesk**) and wraps the entire application with the [Sidebar.jsx](file:///c:/Users/yashs/OneDrive/Desktop/yash/project/StreakVerse/components/Sidebar.jsx).
* **[`app/page.js`](file:///c:/Users/yashs/OneDrive/Desktop/yash/project/StreakVerse/app/page.js)**: The main entry point featuring the high-impact "Cyber-Arena" landing page.
* **[`app/dashboard/page.js`](file:///c:/Users/yashs/OneDrive/Desktop/yash/project/StreakVerse/app/dashboard/page.js)**: Handles user authentication checks, fetches GitHub commit data, and calculates streaks/XP.
* **[`components/Sidebar.jsx`](file:///c:/Users/yashs/OneDrive/Desktop/yash/project/StreakVerse/components/Sidebar.jsx)**: A complex navigation component that stays persistent and displays the user's current rank and level.
* **[`components/Leaderboard.jsx`](file:///c:/Users/yashs/OneDrive/Desktop/yash/project/StreakVerse/components/Leaderboard.jsx)**: Fetches real-time profile data from Supabase and ranks users based on their performance.
* **[`styles/globals.css`](file:///c:/Users/yashs/OneDrive/Desktop/yash/project/StreakVerse/styles/globals.css)**: Defines the custom "Cyber-Grid" background, neon glows, and glassmorphism styles used throughout the app.
* **[`utils/auth.js`](file:///c:/Users/yashs/OneDrive/Desktop/yash/project/StreakVerse/utils/auth.js)**: A utility for managing Supabase authentication states and GitHub provider logic.

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
