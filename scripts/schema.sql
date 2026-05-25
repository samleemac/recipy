-- ============================================================
-- Recipy — full database schema + Row Level Security policies
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- ============================================================

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- profiles
--   One row per registered user. Mirrors auth.users with public-facing fields.
-- ============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null check (char_length(username) between 3 and 24
                                            and username ~ '^[a-z0-9_-]+$'),
  display_name  text not null default '',
  avatar_url    text,
  bio           text default '',
  role          text not null default 'user' check (role in ('user','admin')),
  created_at    timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (lower(username));

-- ============================================================
-- recipes
--   Source of truth for every recipe (system seeded + user submitted).
--   `status` controls visibility:
--     draft     → only the author can see it
--     pending   → in admin queue, only author + admins can see it
--     published → visible to everyone
--     rejected  → only author + admins can see it (with reject_reason)
-- ============================================================
create table if not exists public.recipes (
  id                uuid primary key default uuid_generate_v4(),
  slug              text unique not null,
  author_id         uuid references public.profiles(id) on delete set null,

  title             text not null,
  intro             text default '',
  cuisine           text default '',
  time              int  default 0,
  difficulty        int  default 1 check (difficulty between 1 and 3),
  base_servings     int  default 2,
  serving_noun      text default 'serving',

  tags              text[] default '{}',
  photo_url         text,

  fact              jsonb,
  macros            jsonb,
  equipment         text[] default '{}',

  ingredient_groups jsonb not null default '[]',
  steps             jsonb not null default '[]',

  status            text not null default 'pending'
                       check (status in ('draft','pending','published','rejected')),
  reject_reason     text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  published_at      timestamptz
);

create index if not exists recipes_status_idx     on public.recipes (status);
create index if not exists recipes_author_idx     on public.recipes (author_id);
create index if not exists recipes_published_idx  on public.recipes (published_at desc);

-- ============================================================
-- bookmarks
-- ============================================================
create table if not exists public.bookmarks (
  user_id    uuid references public.profiles(id) on delete cascade,
  recipe_id  uuid references public.recipes(id)  on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create index if not exists bookmarks_user_idx on public.bookmarks (user_id);

-- ============================================================
-- follows
-- ============================================================
create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  followee_id uuid references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index if not exists follows_followee_idx on public.follows (followee_id);

-- ============================================================
-- cooked_posts — "I just cooked X" social feed entries
-- ============================================================
create table if not exists public.cooked_posts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  recipe_id   uuid not null references public.recipes(id)  on delete cascade,
  caption     text default '',
  photo_url   text,
  created_at  timestamptz not null default now()
);

create index if not exists cooked_posts_user_idx    on public.cooked_posts (user_id);
create index if not exists cooked_posts_created_idx on public.cooked_posts (created_at desc);

-- ============================================================
-- cooked_likes
-- ============================================================
create table if not exists public.cooked_likes (
  user_id    uuid references public.profiles(id) on delete cascade,
  post_id    uuid references public.cooked_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- ============================================================
-- updated_at trigger for recipes
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists recipes_touch on public.recipes;
create trigger recipes_touch
  before update on public.recipes
  for each row execute procedure public.touch_updated_at();

-- ============================================================
-- New auth user → profile row
--   Username is taken from raw_user_meta_data.username (set client-side
--   on email/password signUp) or falls back to the email's local part.
--   For Google OAuth sign-ins, display_name and avatar_url are pulled
--   from raw_user_meta_data.full_name / name and picture respectively.
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
  -- Google OAuth puts the user's name in `full_name` / `name`
  -- and the avatar in `picture`. Email sign-ups use `display_name`.
  google_name := coalesce(
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name'
  );
  google_pic := coalesce(
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'picture'
  );

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Admin check helper
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles     enable row level security;
alter table public.recipes      enable row level security;
alter table public.bookmarks    enable row level security;
alter table public.follows      enable row level security;
alter table public.cooked_posts enable row level security;
alter table public.cooked_likes enable row level security;

-- profiles --------------------------------------------------
drop policy if exists "profiles readable by anyone"    on public.profiles;
drop policy if exists "profiles editable by owner"     on public.profiles;
drop policy if exists "profiles insertable by signup"  on public.profiles;

create policy "profiles readable by anyone"
  on public.profiles for select using (true);

create policy "profiles editable by owner"
  on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles insertable by signup"
  on public.profiles for insert with check (id = auth.uid());

-- recipes ---------------------------------------------------
drop policy if exists "published recipes are public"   on public.recipes;
drop policy if exists "authors see their own recipes"  on public.recipes;
drop policy if exists "admins see all recipes"         on public.recipes;
drop policy if exists "authors insert their own"       on public.recipes;
drop policy if exists "authors update their own"       on public.recipes;
drop policy if exists "admins update any recipe"       on public.recipes;
drop policy if exists "admins delete any recipe"       on public.recipes;

create policy "published recipes are public"
  on public.recipes for select using (status = 'published');

create policy "authors see their own recipes"
  on public.recipes for select using (author_id = auth.uid());

create policy "admins see all recipes"
  on public.recipes for select using (public.is_admin());

create policy "authors insert their own"
  on public.recipes for insert with check (author_id = auth.uid());

create policy "authors update their own"
  on public.recipes for update
  using  (author_id = auth.uid() and status in ('draft','pending','rejected'))
  with check (author_id = auth.uid());

create policy "admins update any recipe"
  on public.recipes for update using (public.is_admin()) with check (public.is_admin());

create policy "admins delete any recipe"
  on public.recipes for delete using (public.is_admin());

-- bookmarks -------------------------------------------------
drop policy if exists "bookmarks owner read"   on public.bookmarks;
drop policy if exists "bookmarks owner write"  on public.bookmarks;
drop policy if exists "bookmarks owner delete" on public.bookmarks;

create policy "bookmarks owner read"
  on public.bookmarks for select using (user_id = auth.uid());

create policy "bookmarks owner write"
  on public.bookmarks for insert with check (user_id = auth.uid());

create policy "bookmarks owner delete"
  on public.bookmarks for delete using (user_id = auth.uid());

-- follows ---------------------------------------------------
drop policy if exists "follows readable"      on public.follows;
drop policy if exists "follows follower write" on public.follows;
drop policy if exists "follows follower delete" on public.follows;

create policy "follows readable"
  on public.follows for select using (true);

create policy "follows follower write"
  on public.follows for insert with check (follower_id = auth.uid());

create policy "follows follower delete"
  on public.follows for delete using (follower_id = auth.uid());

-- cooked_posts ----------------------------------------------
drop policy if exists "cooked posts public read"  on public.cooked_posts;
drop policy if exists "cooked posts owner write"  on public.cooked_posts;
drop policy if exists "cooked posts owner update" on public.cooked_posts;
drop policy if exists "cooked posts owner delete" on public.cooked_posts;

create policy "cooked posts public read"
  on public.cooked_posts for select using (true);

create policy "cooked posts owner write"
  on public.cooked_posts for insert with check (user_id = auth.uid());

create policy "cooked posts owner update"
  on public.cooked_posts for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "cooked posts owner delete"
  on public.cooked_posts for delete using (user_id = auth.uid());

-- cooked_likes ----------------------------------------------
drop policy if exists "cooked likes public read"  on public.cooked_likes;
drop policy if exists "cooked likes owner write"  on public.cooked_likes;
drop policy if exists "cooked likes owner delete" on public.cooked_likes;

create policy "cooked likes public read"
  on public.cooked_likes for select using (true);

create policy "cooked likes owner write"
  on public.cooked_likes for insert with check (user_id = auth.uid());

create policy "cooked likes owner delete"
  on public.cooked_likes for delete using (user_id = auth.uid());

-- ============================================================
-- Storage buckets
--   `cooks`   public bucket for photos attached to cooked_posts
--   `recipes` public bucket for hero photos on submitted recipes
-- Authenticated users may upload to either bucket; anyone can read.
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('cooks', 'cooks', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('recipes', 'recipes', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

drop policy if exists "cooks public read"          on storage.objects;
drop policy if exists "cooks authenticated upload" on storage.objects;
drop policy if exists "cooks owner delete"         on storage.objects;
drop policy if exists "avatars owner update"       on storage.objects;
drop policy if exists "recipes public read"        on storage.objects;
drop policy if exists "recipes authenticated upload" on storage.objects;
drop policy if exists "recipes owner delete"       on storage.objects;

create policy "cooks public read"
  on storage.objects for select
  using (bucket_id in ('cooks','recipes','avatars'));

create policy "cooks authenticated upload"
  on storage.objects for insert
  with check (bucket_id in ('cooks','recipes','avatars') and auth.role() = 'authenticated');

create policy "cooks owner delete"
  on storage.objects for delete
  using (bucket_id in ('cooks','recipes','avatars') and owner = auth.uid());

create policy "avatars owner update"
  on storage.objects for update
  using (bucket_id = 'avatars' and owner = auth.uid())
  with check (bucket_id = 'avatars' and owner = auth.uid());

-- ============================================================
-- Realtime: enable on cooked_posts so the feed updates live
-- ============================================================
alter publication supabase_realtime add table public.cooked_posts;

-- ============================================================
-- Done. After running this:
--   1. Sign up an account through the site.
--   2. Promote yourself to admin in the Supabase SQL editor with:
--        update public.profiles set role = 'admin' where username = '<your-username>';
-- ============================================================
