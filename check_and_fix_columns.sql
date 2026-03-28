-- Check all emotion-related columns in the trades table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND (column_name LIKE '%emotion%' OR column_name LIKE '%tag%')
ORDER BY column_name;

-- If emotiontag exists (lowercase), rename it to emotionTag (camelCase)
-- First, let's see what we have before making changes
