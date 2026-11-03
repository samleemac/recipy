-- ============================================================
-- Recipy — private cook notes
-- Run once in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- Notes a cook leaves for themselves in Cook Mode, pinned to a recipe and
-- optionally to a step and a part of that step. Strictly private: every
-- policy is owner-only, so nobody else (not even other signed-in users)
-- can read, change or delete them.
-- ============================================================

create table if not exists public.cook_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recipe_slug text not null check (char_length(recipe_slug) between 1 and 200),
  step_index  int  check (step_index is null or step_index between 0 and 200),
  part_index  int  check (part_index is null or part_index between 0 and 50),
  body        text not null check (char_length(body) between 1 and 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists cook_notes_owner_recipe_idx
  on public.cook_notes (user_id, recipe_slug, created_at desc);

drop trigger if exists cook_notes_touch on public.cook_notes;
create trigger cook_notes_touch
  before update on public.cook_notes
  for each row execute procedure public.touch_updated_at();

alter table public.cook_notes enable row level security;

drop policy if exists "cook notes owner read"   on public.cook_notes;
drop policy if exists "cook notes owner insert" on public.cook_notes;
drop policy if exists "cook notes owner update" on public.cook_notes;
drop policy if exists "cook notes owner delete" on public.cook_notes;

create policy "cook notes owner read"
  on public.cook_notes for select to authenticated
  using (user_id = (select auth.uid()));

create policy "cook notes owner insert"
  on public.cook_notes for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "cook notes owner update"
  on public.cook_notes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "cook notes owner delete"
  on public.cook_notes for delete to authenticated
  using (user_id = (select auth.uid()));

-- Signed-out visitors get nothing at all
revoke all on public.cook_notes from anon;
grant select, insert, update, delete on public.cook_notes to authenticated;
