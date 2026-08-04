-- ============================================================
-- Recipy — Cookery School technique guides in Supabase
-- Run once in the Supabase SQL editor (Project → SQL Editor → New query),
-- then seed the table with:  npm run seed:techniques
--
-- Guides are editorial content managed by admins only. Admin edits
-- publish directly — there is no pending/review state (unlike recipes).
-- ============================================================

create table if not exists public.techniques (
  id                          uuid primary key default uuid_generate_v4(),
  slug                        text unique not null,

  title                       text not null,
  subtitle                    text default '',
  hero_photo                  text default '',
  icon                        text default '',
  skill_level                 text default 'Beginner',
  read_time                   int  default 5,
  tags                        text[] default '{}',

  intro                       text default '',
  fact                        jsonb,
  methods                     jsonb not null default '[]',
  seasoning_ideas             jsonb not null default '[]',
  tools_needed                jsonb not null default '[]',
  top_tips                    jsonb not null default '[]',
  troubleshooting             jsonb not null default '[]',

  -- Optional section-heading overrides (the dairy-free cheese guide
  -- uses "Pick a cheese" / "Three homemade cheeses")
  methods_section_tag         text,
  methods_section_title       text,
  methods_tablist_label       text,

  related_ingredient_keywords text[] default '{}',

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  updated_by                  uuid references public.profiles(id) on delete set null
);

create index if not exists techniques_slug_idx on public.techniques (slug);

-- Keep updated_at fresh on every edit
create or replace function public.touch_techniques_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists techniques_touch_updated_at on public.techniques;
create trigger techniques_touch_updated_at
  before update on public.techniques
  for each row execute procedure public.touch_techniques_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.techniques enable row level security;

drop policy if exists "techniques readable by anyone" on public.techniques;
drop policy if exists "admins insert techniques"      on public.techniques;
drop policy if exists "admins update techniques"      on public.techniques;
drop policy if exists "admins delete techniques"      on public.techniques;

create policy "techniques readable by anyone"
  on public.techniques for select using (true);

create policy "admins insert techniques"
  on public.techniques for insert with check (public.is_admin());

create policy "admins update techniques"
  on public.techniques for update using (public.is_admin()) with check (public.is_admin());

create policy "admins delete techniques"
  on public.techniques for delete using (public.is_admin());
