-- ============================================================
-- Google OAuth patch for handle_new_user
--
-- Run this once in the Supabase SQL editor AFTER you've already
-- run scripts/schema.sql. It replaces the existing trigger so that
-- users who sign in with Google get:
--   - display_name pulled from Google's name / full_name field
--   - avatar_url   pulled from Google's picture field
-- Email/password sign-ups continue to work exactly as before.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  base_name   text;
  candidate   text;
  i           int := 0;
  google_name text;
  google_pic  text;
begin
  -- Google sends the user's name in `full_name` or `name`,
  -- and the avatar in `picture` (sometimes `avatar_url`).
  google_name := coalesce(
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name'
  );
  google_pic := coalesce(
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'picture'
  );

  -- Username: prefer client-supplied (email/password sign-ups),
  -- otherwise derive from the email's local part.
  base_name := coalesce(
    new.raw_user_meta_data ->> 'username',
    regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_-]', '', 'g')
  );
  if base_name is null or length(base_name) < 3 then
    base_name := 'cook' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;

  candidate := lower(base_name);
  while exists (select 1 from public.profiles where username = candidate) loop
    i := i + 1;
    candidate := lower(base_name) || i::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (new.id, candidate, coalesce(google_name, candidate), google_pic);

  return new;
end $$;

-- Re-bind the trigger (no-op if already attached).
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
