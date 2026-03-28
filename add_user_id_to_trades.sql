-- Add user_id column to trades table for multi-user support
ALTER TABLE public.trades ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);

-- Update RLS policies to ensure users can only access their own trades
DROP POLICY IF EXISTS "Allow authenticated users to manage trades" ON public.trades;

CREATE POLICY "Allow users to manage their own trades" ON public.trades
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name = 'user_id';
