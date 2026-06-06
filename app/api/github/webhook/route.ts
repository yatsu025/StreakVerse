/**
 * POST /api/github/webhook
 * GitHub → push event → sync XP + streak for that user.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// ── Backend imports ───────────────────────────────────────────────────────────
import { getSupabaseAdmin }       from '../../../../backend/db/supabaseClient'
import { fetchUserPushEvents }    from '../../../../backend/github/githubEvents'
import { calcProfileUpdate }      from '../../../../backend/sync/syncProfile'
// ─────────────────────────────────────────────────────────────────────────────

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export async function POST(req: NextRequest) {
  try {
    const body      = await req.text()
    const signature = req.headers.get('x-hub-signature-256')
    const event     = req.headers.get('x-github-event')

    // Verify signature
    const secret = process.env.GITHUB_WEBHOOK_SECRET
    if (secret && !verifySignature(body, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (event !== 'push') {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const payload     = JSON.parse(body)
    const pusherLogin = payload?.pusher?.name ?? payload?.sender?.login

    if (!pusherLogin) {
      return NextResponse.json({ error: 'No pusher info' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Find user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', pusherLogin)
      .maybeSingle()

    if (!profileData) {
      return NextResponse.json({ ok: true, message: 'No profile found' })
    }

    // Fetch GitHub events using backend fetcher
    const pushEvents = await fetchUserPushEvents(pusherLogin)

    if (pushEvents.length === 0) {
      return NextResponse.json({ ok: true, message: 'No push events' })
    }

    // Calculate update using backend sync logic
    const { profileUpdate, addedXP } = calcProfileUpdate(profileData, pushEvents)

    // Save to Supabase
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', profileData.id)

    if (error) throw error

    console.log(`[Webhook] ✓ ${pusherLogin} | +${addedXP} XP | streak: ${profileUpdate.current_streak}`)
    return NextResponse.json({ ok: true, addedXP, xp: profileUpdate.xp, streak: profileUpdate.current_streak })

  } catch (err: any) {
    console.error('[Webhook] Error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
