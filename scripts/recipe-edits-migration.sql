-- ============================================================
-- Recipy — Edit Existing Recipes migration
-- Adds support for editing recipes (author + admin) where edits to a
-- published recipe are stored as `pending_changes` so the live version
-- stays up until an admin approves.
--
-- Run this once in the Supabase SQL editor after schema.sql.
-- ============================================================

-- ------------------------------------------------------------
-- 1. New columns on recipes
--    pending_changes    → proposed edit payload (snake_case column keys)
--    pending_photo_url  → proposed new hero photo (live photo_url untouched)
--    edit_reject_reason → admin's reason if a proposed edit was rejected
-- ------------------------------------------------------------
alter table public.recipes add column if not exists pending_changes    jsonb;
alter table public.recipes add column if not exists pending_photo_url  text;
alter table public.recipes add column if not exists edit_reject_reason text;

-- Index to find recipes with a pending edit quickly (admin queue)
create index if not exists recipes_pending_changes_idx
  on public.recipes ((pending_changes is not null))
  where pending_changes is not null;

-- ------------------------------------------------------------
-- 2. submit_recipe_edit
--    Stores a proposed edit without touching the live recipe.
--    Callable by the recipe's author or any admin.
-- ------------------------------------------------------------
create or replace function public.submit_recipe_edit(
  p_recipe_id uuid,
  p_changes   jsonb,
  p_photo_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author uuid;
begin
  select author_id into v_author from public.recipes where id = p_recipe_id;
  if v_author is null and not exists (select 1 from public.recipes where id = p_recipe_id) then
    raise exception 'Recipe not found';
  end if;

  if not (v_author = auth.uid() or public.is_admin()) then
    raise exception 'Not allowed to edit this recipe';
  end if;

  update public.recipes
  set pending_changes    = p_changes,
      pending_photo_url   = p_photo_url,
      edit_reject_reason  = null,
      updated_at          = now()
  where id = p_recipe_id;
end $$;

grant execute on function public.submit_recipe_edit(uuid, jsonb, text) to authenticated;

-- ------------------------------------------------------------
-- 3. approve_recipe
--    Admin approval. If the recipe has a pending edit, merge it into the
--    live columns and clear the pending fields. Otherwise this publishes a
--    brand-new submission (same behaviour as the old approve).
-- ------------------------------------------------------------
create or replace function public.approve_recipe(p_recipe_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pc jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;

  select pending_changes into pc from public.recipes where id = p_recipe_id;

  if pc is not null then
    -- Merge the proposed edit into the live recipe.
    update public.recipes
    set title             = coalesce(pc->>'title', title),
        intro             = coalesce(pc->>'intro', intro),
        cuisine           = coalesce(pc->>'cuisine', cuisine),
        time              = coalesce((pc->>'time')::int, time),
        difficulty        = coalesce((pc->>'difficulty')::int, difficulty),
        base_servings     = coalesce((pc->>'base_servings')::int, base_servings),
        serving_noun      = coalesce(pc->>'serving_noun', serving_noun),
        tags              = coalesce(
                              case when pc ? 'tags'
                                then array(select jsonb_array_elements_text(pc->'tags'))
                                else null end,
                              tags),
        fact              = case when pc ? 'fact' then pc->'fact' else fact end,
        macros            = case when pc ? 'macros' then pc->'macros' else macros end,
        equipment         = coalesce(
                              case when pc ? 'equipment'
                                then array(select jsonb_array_elements_text(pc->'equipment'))
                                else null end,
                              equipment),
        ingredient_groups = case when pc ? 'ingredient_groups' then pc->'ingredient_groups' else ingredient_groups end,
        steps             = case when pc ? 'steps' then pc->'steps' else steps end,
        photo_url         = coalesce(pending_photo_url, photo_url),
        pending_changes    = null,
        pending_photo_url   = null,
        edit_reject_reason  = null,
        status              = 'published',
        published_at        = now(),
        reject_reason       = null
    where id = p_recipe_id;
  else
    -- Brand-new submission: just publish it.
    update public.recipes
    set status        = 'published',
        published_at  = now(),
        reject_reason = null
    where id = p_recipe_id;
  end if;
end $$;

grant execute on function public.approve_recipe(uuid) to authenticated;

-- ------------------------------------------------------------
-- 4. reject_recipe
--    Admin rejection. If the recipe has a pending edit, discard the edit and
--    record the reason (the live recipe stays published). Otherwise reject a
--    brand-new submission (same behaviour as the old reject).
-- ------------------------------------------------------------
create or replace function public.reject_recipe(p_recipe_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pc jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;

  select pending_changes into pc from public.recipes where id = p_recipe_id;

  if pc is not null then
    update public.recipes
    set pending_changes   = null,
        pending_photo_url  = null,
        edit_reject_reason = coalesce(p_reason, ''),
        updated_at         = now()
    where id = p_recipe_id;
  else
    update public.recipes
    set status        = 'rejected',
        reject_reason = coalesce(p_reason, '')
    where id = p_recipe_id;
  end if;
end $$;

grant execute on function public.reject_recipe(uuid, text) to authenticated;

-- ============================================================
-- Done. Authors/admins can now submit edits via submit_recipe_edit,
-- and the admin queue approves/rejects via approve_recipe / reject_recipe.
-- ============================================================
