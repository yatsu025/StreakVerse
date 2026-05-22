-- StreakVerse — Run this in Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard → your project → SQL Editor

-- 1. Add last_commit_count column (tracks commits counted in last sync)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_commit_count INTEGER DEFAULT 0;

-- 2. Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
