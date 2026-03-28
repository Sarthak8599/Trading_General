-- Check all columns in trades table to see exactly what we have
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
ORDER BY column_name;

-- Specifically look for emotion-related columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name ILIKE '%emotion%'
ORDER BY column_name;
