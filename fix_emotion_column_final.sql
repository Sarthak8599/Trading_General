-- First, let's check the current column name
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name LIKE '%emotion%';

-- If the column is still named emotion_tag, rename it to emotionTag
ALTER TABLE public.trades RENAME COLUMN emotion_tag TO emotionTag;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name = 'emotionTag';
