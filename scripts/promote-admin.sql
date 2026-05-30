-- Promote a user to admin (run in Supabase → SQL Editor)
-- Replace the id below if promoting a different account.

update public.profiles
set role = 'admin'
where id = 'd664a909-bbbb-47b8-8e43-e59d23e4ca80';

-- Verify:
-- select id, username, display_name, role from public.profiles where id = 'd664a909-bbbb-47b8-8e43-e59d23e4ca80';
