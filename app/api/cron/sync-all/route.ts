import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin }       from '../../../../backend/db/supabaseClient'
import { fetchUserPushEvents }    from '../../../../backend/github/githubEvents'
import { calcProfileUpdate }      from '../../../../backend/sync/syncProfile'
import type { ProfileData }       from '../../../../backend/types'


const BATCH_SIZE = 8

export async function GET(req: NextRequest) {

  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron] Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const supabase  = getSupabaseAdmin()

  const { data: profiles, error: fetchErr } = await supabase
    .from('profiles')
    .select('id, username, xp, current_streak, longest_streak, streak_shields, last_commit_date, last_commit_count, rank_score')
    .not('username', 'is', null)
    .order('last_synced_at', { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE)

  if (fetchErr || !profiles) {
    console.error('[Cron] Failed to fetch profiles:', fetchErr?.message)
    return NextResponse.json({ error: 'DB fetch failed' }, { status: 500 })
  }

  console.log(`[Cron] Processing ${profiles.length} profiles`)

  const results = {
    synced:  [] as string[],
    skipped: [] as string[],
    errors:  [] as string[],
  }

  for (const profile of profiles as ProfileData[]) {


    const label = profile.username ?? profile.id

    try {
      if (!profile.username) {
        results.skipped.push(profile.id)
        continue
      }

      const now = new Date().toISOString()

      // Fetch GitHub push events
      const pushEvents = await fetchUserPushEvents(profile.username)

      if (pushEvents.length === 0) {
        // No events BUT still run calcProfileUpdate — it handles streak decay
        // (if user missed days without commits, streak breaks or shields consumed)
      }

      // Calculate new profile state
      // calcProfileUpdate handles:
      //   - XP for new commit days
      //   - Streak recalculation from GitHub dates
      //   - Shield consumption if days were missed
      //   - Shield gain every 7-day streak block
      const { profileUpdate, addedXP } = calcProfileUpdate(profile, pushEvents)


      const hasChanged =
        profileUpdate.xp             !== profile.xp             ||
        profileUpdate.current_streak !== profile.current_streak ||
        profileUpdate.longest_streak !== profile.longest_streak ||
        profileUpdate.streak_shields !== profile.streak_shields ||
        profileUpdate.rank_score     !== profile.rank_score

      if (!hasChanged) {

        await supabase
          .from('profiles')
          .update({ last_synced_at: now })
          .eq('id', profile.id)

        results.skipped.push(label)
        continue
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ ...profileUpdate, last_synced_at: now })
        .eq('id', profile.id)

      if (updateErr) {
        results.errors.push(`${label}: ${updateErr.message}`)
        continue
      }

      console.log(
        `[Cron] ✓ ${label} | ` +
        `streak: ${profile.current_streak} → ${profileUpdate.current_streak} | ` +
        `longest: ${profile.longest_streak} → ${profileUpdate.longest_streak} | ` +
        `shields: ${profile.streak_shields} → ${profileUpdate.streak_shields} | ` +
        `+${addedXP} XP`
      )

      results.synced.push(label)

    } catch (err: any) {
      console.error(`[Cron] Error for ${label}:`, err.message)
      results.errors.push(`${label}: ${err.message}`)
    }
  }

  const duration = Date.now() - startTime
  console.log(`[Cron] Done in ${duration}ms | synced: ${results.synced.length} | skipped: ${results.skipped.length} | errors: ${results.errors.length}`)

  return NextResponse.json({
    ok: true,
    duration_ms: duration,
    synced:  results.synced.length,
    skipped: results.skipped.length,
    errors:  results.errors.length,
    details: results,
  })
}