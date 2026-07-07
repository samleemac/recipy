-- ============================================================
-- Recipy — recipe reviews migration
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query)
-- if your project was set up before reviews shipped. Fresh installs get
-- all of this from scripts/schema.sql.
--
-- One review per user per recipe (rating 1–5 + optional text).
-- Writing requires an account; reading is public, like the recipes
-- themselves. Users can edit or delete their own review; admins can
-- delete any review.
-- ============================================================

create table if not exists public.reviews (
  id         uuid primary key default uuid_generate_v4(),
  recipe_id  uuid not null references public.recipes(id)  on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  rating     int  not null check (rating between 1 and 5),
  body       text not null default '' check (char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, user_id)
);

create index if not exists reviews_recipe_idx  on public.reviews (recipe_id);
create index if not exists reviews_created_idx on public.reviews (created_at desc);

-- Keep updated_at fresh on edits (reuses the shared touch function)
drop trigger if exists reviews_touch on public.reviews;
create trigger reviews_touch
  before update on public.reviews
  for each row execute procedure public.touch_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.reviews enable row level security;

drop policy if exists "reviews public read"    on public.reviews;
drop policy if exists "reviews owner write"    on public.reviews;
drop policy if exists "reviews owner update"   on public.reviews;
drop policy if exists "reviews owner delete"   on public.reviews;
drop policy if exists "reviews admin delete"   on public.reviews;

create policy "reviews public read"
  on public.reviews for select using (true);

-- Only allow reviews on recipes the reviewer can actually see (published)
create policy "reviews owner write"
  on public.reviews for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.status = 'published'
    )
  );

create policy "reviews owner update"
  on public.reviews for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reviews owner delete"
  on public.reviews for delete using (user_id = auth.uid());

create policy "reviews admin delete"
  on public.reviews for delete using (public.is_admin());
