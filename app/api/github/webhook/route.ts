import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ── Supabase client — lazy init at request time, not build time ───────────────
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  }

  return createClient(url, key)
}

// ── Verify GitHub webhook signature ──────────────────────────────────────────
function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

// ── XP helpers (same logic as dashboard) ─────────────────────────────────────
function calcStreakFromDates(
  dates: string[],
  existingShields: number = 0
): {
  currentStreak: number
  longestStreak: number
  shields: number
} {
  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

  let currentStreak = 0
  let longestStreak = 0
  let lastDate: string | null = null

  for (const date of dates.sort()) {
    if (!lastDate) {
      currentStreak = 1
    } else {
      const diff = Math.round(
        (new Date(date).getTime() - new Date(lastDate).getTime()) / 86_400_000
      )
      if (diff === 0) continue
      else if (diff === 1) currentStreak++
      else currentStreak = 1
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak
    lastDate = date
  }

  // Shield-aware decay
  let shields = existingShields
  if (lastDate && lastDate !== today && lastDate !== yesterday) {
    const missedDays = Math.round(
      (new Date(today).getTime() - new Date(lastDate).getTime()) / 86_400_000
    ) - 1

    if (missedDays > 0) {
      if (shields >= missedDays) {
        shields -= missedDays
      } else {
        currentStreak = 0
        shields = 0
      }
    }
  }

  return { currentStreak, longestStreak, shields }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body      = await req.text()
    const signature = req.headers.get('x-hub-signature-256')
    const event     = req.headers.get('x-github-event')

    // 1. Verify signature (skip if no secret configured — dev mode)
    const secret = process.env.GITHUB_WEBHOOK_SECRET
    if (secret && !verifySignature(body, signature, secret)) {
      console.warn('[Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 2. Only handle push events
    if (event !== 'push') {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const payload = JSON.parse(body)
    const pusherLogin: string = payload?.pusher?.name ?? payload?.sender?.login

    if (!pusherLogin) {
      return NextResponse.json({ error: 'No pusher info' }, { status: 400 })
    }

    console.log('[Webhook] Push from:', pusherLogin)

    // 3. Find the user in Supabase by GitHub username
    const supabase = getSupabase()
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', pusherLogin)
      .maybeSingle()

    if (profileErr || !profileData) {
      // User hasn't logged in yet — nothing to update
      console.log('[Webhook] No profile found for:', pusherLogin)
      return NextResponse.json({ ok: true, message: 'No profile found' })
    }

    // 4. Fetch their recent GitHub events
    const ghRes = await fetch(
      `https://api.github.com/users/${pusherLogin}/events?per_page=100`,
      {
        headers: process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {},
      }
    )

    if (!ghRes.ok) {
      throw new Error(`GitHub API error: ${ghRes.status}`)
    }

    const events = await ghRes.json()
    const pushEvents = Array.isArray(events)
      ? events.filter((e: any) => e.type === 'PushEvent')
      : []

    if (pushEvents.length === 0) {
      return NextResponse.json({ ok: true, message: 'No push events' })
    }

    // 5. Count commits per date
    const commitCountByDate: Record<string, number> = {}
    for (const ev of pushEvents) {
      const date  = ev.created_at.split('T')[0]
      const count = ev.payload?.commits?.length ?? ev.payload?.size ?? 1
      commitCountByDate[date] = (commitCountByDate[date] ?? 0) + count
    }

    const commitDates = Object.keys(commitCountByDate).sort()
    const today       = new Date().toISOString().split('T')[0]
    const yesterday   = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

    // 6. Recalculate streak (shield-aware)
    const existingShields = profileData.streak_shields ?? 0
    const { currentStreak, longestStreak, shields } = calcStreakFromDates(commitDates, existingShields)
    // 7. Calculate XP delta
    const existingXP        = profileData.xp ?? 0
    const rawLastDate       = profileData.last_commit_date ?? null
    const existingLastDate  = rawLastDate ? rawLastDate.split('T')[0] : null
    const existingLastCount = profileData.last_commit_count ?? 0

    const newDates = existingLastDate
      ? commitDates.filter((d: string) => d > existingLastDate)
      : commitDates

    let addedXP = 0

    // Day bonus for new dates
    for (const date of newDates) {
      addedXP += 10

      // Streak milestone bonuses
      let streakAtDate = 0
      let prev: string | null = null
      for (const d of commitDates) {
        if (d > date) break
        if (!prev) { streakAtDate = 1 }
        else {
          const diff = Math.round(
            (new Date(d).getTime() - new Date(prev).getTime()) / 86_400_000
          )
          if (diff === 0) { prev = d; continue }
          streakAtDate = diff === 1 ? streakAtDate + 1 : 1
        }
        prev = d
      }
      if (streakAtDate === 5)  addedXP += 10
      if (streakAtDate === 10) addedXP += 20
      if (streakAtDate === 30) addedXP += 50
    }

    // Additional commits today (+5 each)
    const totalCommitsToday = commitCountByDate[today] ?? 0
    const prevCountedToday  = existingLastDate === today ? existingLastCount : 0
    const newCommitsToday   = Math.max(0, totalCommitsToday - prevCountedToday)
    const isTodayNew        = newDates.includes(today)
    const extraCommits      = isTodayNew
      ? Math.max(0, newCommitsToday - 1)
      : newCommitsToday

    addedXP += extraCommits * 5

    const xp        = existingXP + addedXP
    const rankScore = xp + currentStreak * 5
    const lastDate  = commitDates[commitDates.length - 1] ?? existingLastDate

    console.log('[Webhook] XP update for', pusherLogin, ':', {
      existingXP, addedXP, xp, currentStreak, lastDate
    })

    // 8. Update Supabase
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        xp,
        current_streak:    currentStreak,
        longest_streak:    longestStreak,
        streak_shields:    shields,
        last_commit_date:  lastDate,
        last_commit_count: totalCommitsToday,
        rank_score:        rankScore,
      })
      .eq('id', profileData.id)

    if (updateErr) throw updateErr

    console.log('[Webhook] ✓ Profile updated for', pusherLogin)
    return NextResponse.json({ ok: true, addedXP, xp, currentStreak })

  } catch (err: any) {
    console.error('[Webhook] Error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
