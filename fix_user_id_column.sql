-- Add user_id column to trades table for multi-user support
ALTER TABLE public.trades ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);

-- Update existing trades to have a default user (cartoon8599@gmail.com)
UPDATE public.trades 
SET user_id = (SELECT id FROM auth.users WHERE email = 'cartoon8599@gmail.com' LIMIT 1)
WHERE user_id IS NULL;

-- Set user_id to NOT NULL for future inserts
ALTER TABLE public.trades ALTER COLUMN user_id SET NOT NULL;

-- Update RLS policies to ensure users can only access their own trades
DROP POLICY IF EXISTS "Allow authenticated users to manage trades" ON public.trades;

CREATE POLICY "Allow users to manage their own trades" ON public.trades
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name = 'user_id';

-- Check if existing trades were updated
SELECT COUNT(*) as trades_with_user_id 
FROM public.trades 
WHERE user_id IS NOT NULL;
