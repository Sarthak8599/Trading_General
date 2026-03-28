-- Force Supabase schema cache refresh
-- This script makes temporary changes to trigger cache refresh, then reverts them

-- Step 1: Add a temporary column to trigger cache refresh
ALTER TABLE public.trades ADD COLUMN temp_refresh_column TEXT;

-- Step 2: Immediately remove the temporary column
ALTER TABLE public.trades DROP COLUMN temp_refresh_column;

-- Step 3: Verify the emotionTag column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name = 'emotionTag';
