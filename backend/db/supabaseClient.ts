// ─────────────────────────────────────────────────────────────────────────────
// StreakVerse — Supabase Clients
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Singleton instances ───────────────────────────────────────────────────────
let _client: SupabaseClient | null = null
let _admin: SupabaseClient | null = null

/**
 * Public anon client — use in browser / client components.
 * Singleton: creates once, reuses on subsequent calls.
 */
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
    )
  }

  _client = createClient(url, key)
  return _client
}

/**
 * Admin service-role client — server-side API routes ONLY.
 * Bypasses RLS. Never expose to browser.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing env var: SUPABASE_SERVICE_ROLE_KEY must be set for server-side operations'
    )
  }

  _admin = createClient(url, key)
  return _admin
}

/**
 * Named export for convenience — same as getSupabaseClient().
 * Use this in client components instead of calling getSupabaseClient() directly.
 */
export const supabase = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  return createClient(url, key)
})()
