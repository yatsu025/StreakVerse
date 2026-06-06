// ─────────────────────────────────────────────────────────────────────────────
// StreakVerse — GitHub Auth Helpers
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from '../db/supabaseClient'

/** Redirect user to GitHub OAuth login */
export async function signInWithGitHub(): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  })
  if (error) throw new Error(`GitHub login failed: ${error.message}`)
}

/** Sign the current user out */
export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(`Sign out failed: ${error.message}`)
}
