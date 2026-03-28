-- Fix email verification and clean demo data

-- 1. Mark cartoon8599 email as verified
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'cartoon8599@gmail.com';

-- 2. Check if user exists
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'cartoon8599@gmail.com';

-- 3. Remove demo data from trades table
DELETE FROM public.trades 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@demo.com' 
  OR email LIKE '%@test.local'
);

-- 4. Remove demo users
DELETE FROM auth.users 
WHERE email LIKE '%@demo.com' 
OR email LIKE '%@test.local';

-- 5. Verify cleanup
SELECT COUNT(*) as demo_users_count 
FROM auth.users 
WHERE email LIKE '%@demo.com' 
OR email LIKE '%@test.local';

SELECT COUNT(*) as trades_count 
FROM public.trades;

-- 6. Create a proper session for cartoon8599
INSERT INTO auth.sessions (
  id,
  user_id,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  id,
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'cartoon8599@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM auth.sessions 
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'cartoon8599@gmail.com')
);
