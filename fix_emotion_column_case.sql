-- First, check what emotion columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name LIKE '%emotion%'
ORDER BY column_name;

-- If emotiontag exists (lowercase), drop it and recreate with correct case
-- OR if emotion_tag exists, rename it properly

-- Option 1: If emotiontag (lowercase) exists, drop it
-- ALTER TABLE public.trades DROP COLUMN IF EXISTS emotiontag;

-- Option 2: If emotion_tag (snake_case) still exists, rename it to emotionTag
-- ALTER TABLE public.trades RENAME COLUMN emotion_tag TO emotionTag;

-- Option 3: If you have both, keep the correct one and drop the other
-- ALTER TABLE public.trades DROP COLUMN IF EXISTS emotiontag;
-- ALTER TABLE public.trades RENAME COLUMN emotion_tag TO emotionTag;
