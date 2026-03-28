-- Create the trades table in Supabase
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  day TEXT NOT NULL,
  trade_name TEXT,
  symbol TEXT NOT NULL CHECK (symbol IN ('NIFTY', 'BANKNIFTY')),
  option_type TEXT NOT NULL CHECK (option_type IN ('CE', 'PE')),
  strike_price NUMERIC NOT NULL,
  strategy_name TEXT NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC NOT NULL,
  quantity NUMERIC NOT NULL,
  lot_size NUMERIC NOT NULL DEFAULT 1,
  stop_loss NUMERIC NOT NULL,
  target NUMERIC NOT NULL,
  risk_amount NUMERIC NOT NULL,
  risk_reward_ratio TEXT DEFAULT '1:1',
  profit_loss NUMERIC NOT NULL,
  trade_result TEXT CHECK (trade_result IN ('Win', 'Loss')),
  mistake_tag TEXT,
  emotion_tag TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the date column for faster queries
CREATE INDEX IF NOT EXISTS idx_trades_date ON public.trades(date DESC);

-- Create an index on the strategy_name column
CREATE INDEX IF NOT EXISTS idx_trades_strategy ON public.trades(strategy_name);

-- Create an index on the symbol column
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON public.trades(symbol);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all authenticated users to read/write their own trades
CREATE POLICY "Allow authenticated users to manage trades" ON public.trades
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
