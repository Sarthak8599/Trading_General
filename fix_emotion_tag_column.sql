-- Fix the emotion_tag column name to match application code (emotionTag)
-- This script renames the column from emotion_tag to emotionTag

-- Rename the column from emotion_tag to emotionTag to match the application code
ALTER TABLE public.trades RENAME COLUMN emotion_tag TO emotionTag;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name = 'emotionTag';
