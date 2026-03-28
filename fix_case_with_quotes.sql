-- Use quoted identifiers to preserve exact case
-- Drop the existing column first
ALTER TABLE public.trades DROP COLUMN "emotiontag";

-- Add the column with exact camelCase using quotes
ALTER TABLE public.trades ADD COLUMN "emotionTag" TEXT;

-- Verify the fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name ILIKE '%emotion%';
