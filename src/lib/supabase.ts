// Supabase configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Trade {
  id: string;
  date: string;
  time: string;
  day: string;
  trade_name?: string;
  symbol: 'NIFTY' | 'BANKNIFTY' | 'BTC' | 'GOLD' | 'EUR/USD' | 'SENSEX' | 'MIDCAP' | 'USD/JPY' | 'CRUDEOIL';
  option_type: 'CE' | 'PE';
  strike_price: number;
  strategy_name: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  lot_size: number;
  stop_loss: number;
  target: number;
  risk_amount: number;
  risk_reward_ratio: string;
  profit_loss: number;
  trade_result: 'Win' | 'Loss';
  mistake_tag?: string;
  emotionTag?: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}