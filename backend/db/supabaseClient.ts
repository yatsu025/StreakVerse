// ─────────────────────────────────────────────────────────────────────────────
// StreakVerse — Supabase Clients
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

/**
 * Public anon client — use in browser / client components.
 * Only has RLS-filtered access.
 */
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase public env vars')
  return createClient(url, key)
}

/**
 * Admin service-role client — use ONLY in server-side API routes.
 * Bypasses RLS. Never expose to browser.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env var')
  return createClient(url, key)
}
