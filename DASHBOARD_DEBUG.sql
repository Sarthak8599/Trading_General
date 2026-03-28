-- Debug dashboard data issues

-- 1. Check if trades exist and their data structure
SELECT 
  id, 
  date, 
  profit_loss, 
  created_at,
  user_id
FROM public.trades 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check today's trades specifically
SELECT 
  date, 
  profit_loss,
  COUNT(*) as trades_count
FROM public.trades 
WHERE date = CURRENT_DATE::TEXT
GROUP BY date, profit_loss;

-- 3. Check date format consistency
SELECT DISTINCT 
  date,
  COUNT(*) as count
FROM public.trades 
GROUP BY date 
ORDER BY date DESC;

-- 4. Check if user_id is properly set for current user
SELECT 
  COUNT(*) as total_trades,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as trades_with_user_id
FROM public.trades;

-- 5. Get current user info
SELECT 
  id, 
  email, 
  email_confirmed_at
FROM auth.users 
WHERE email = 'cartoon8599@gmail.com';

-- 6. Check if RLS is blocking access
-- (This will show if policies are working)
SELECT 
  COUNT(*) as visible_trades
FROM public.trades;
