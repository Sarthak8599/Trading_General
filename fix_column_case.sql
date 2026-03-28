-- The issue is case sensitivity: we have 'emotiontag' but need 'emotionTag'
-- We need to drop the lowercase column and recreate it with correct case

-- First, backup any existing data (if any)
-- SELECT emotiontag FROM public.trades WHERE emotiontag IS NOT NULL;

-- Drop the lowercase column
ALTER TABLE public.trades DROP COLUMN emotiontag;

-- Add the column with correct camelCase name
ALTER TABLE public.trades ADD COLUMN emotionTag TEXT;

-- Verify the fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name ILIKE '%emotion%';
