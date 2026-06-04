-- ============================================================
-- Recipy — Limited Edition / multi-language recipes migration
-- Adds support for "limited edition" recipes that have language
-- variants stored as separate rows. The primary row (typically the
-- English one) is the only one shown in listings/search; variants are
-- linked by a shared `variant_group` and reached via the recipe page's
-- language toggle.
--
-- Run this once in the Supabase SQL editor after schema.sql.
-- ============================================================

-- ------------------------------------------------------------
-- New columns on recipes
--   language           → BCP-47-ish locale code for this row's content ('en', 'nl', …)
--   is_limited_edition → flags the recipe as a special limited edition
--   variant_group      → shared key linking language siblings (null for normal recipes)
--   is_primary         → the canonical row shown in listings; variants are false
-- ------------------------------------------------------------
alter table public.recipes add column if not exists language           text    not null default 'en';
alter table public.recipes add column if not exists is_limited_edition boolean not null default false;
alter table public.recipes add column if not exists variant_group      text;
alter table public.recipes add column if not exists is_primary         boolean not null default true;

-- Quickly find a recipe's language siblings.
create index if not exists recipes_variant_group_idx
  on public.recipes (variant_group)
  where variant_group is not null;

-- ============================================================
-- Done. Existing rows backfill to language='en', is_primary=true,
-- is_limited_edition=false, so current listings are unchanged.
-- ============================================================
