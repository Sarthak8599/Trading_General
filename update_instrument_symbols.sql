-- Update instrument symbols constraint to include new trading instruments

-- Drop the existing constraint
ALTER TABLE public.trades DROP CONSTRAINT IF EXISTS trades_symbol_check;

-- Add new constraint with all allowed symbols
ALTER TABLE public.trades 
ADD CONSTRAINT trades_symbol_check 
CHECK (symbol IN ('NIFTY', 'BANKNIFTY', 'BTC', 'GOLD', 'EUR/USD', 'SENSEX', 'MIDCAP', 'USD/JPY', 'CRUDEOIL'));

-- Verify the constraint was added
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.trades'::regclass 
AND contype = 'c';

-- Show current symbols in database
SELECT DISTINCT symbol, COUNT(*) as trade_count 
FROM public.trades 
GROUP BY symbol 
ORDER BY symbol;
