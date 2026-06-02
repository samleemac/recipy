# Supabase Management Guide

This guide covers how recipes and images are stored in Supabase, and how to manage them.

---

## Database Overview

### Where Things Are Stored

| Data | Location | Description |
|------|----------|-------------|
| **Recipes** | `public.recipes` table | All recipe content (title, ingredients, steps, etc.) |
| **Recipe photos** | `recipes` storage bucket | Hero images uploaded with recipe submissions |
| **User avatars** | `avatars` storage bucket | Profile photos (stored as data URLs in `profiles.avatar_url`) |
| **Cook post photos** | `cooks` storage bucket | Photos from "I cooked this" posts |
| **User profiles** | `public.profiles` table | Usernames, display names, bios, roles |

---

## Recipes Table

### Schema

```sql
public.recipes (
  id                uuid        -- Primary key
  slug              text        -- URL-friendly identifier (unique)
  author_id         uuid        -- References profiles.id
  title             text        -- Recipe title
  intro             text        -- Short description
  cuisine           text        -- e.g., "Italian", "Japanese"
  time              int         -- Total time in minutes
  difficulty        int         -- 1 (Easy), 2 (Intermediate), 3 (Advanced)
  base_servings     int         -- Default serving size
  serving_noun      text        -- "serving", "muffin", etc.
  tags              text[]      -- Array of tags
  photo_url         text        -- Hero image URL
  fact              jsonb       -- { title, body } for "Did you know?"
  macros            jsonb       -- { calories, carbs, protein, fat, fibre, sugar }
  equipment         text[]      -- Array of equipment needed
  ingredient_groups jsonb       -- Array of { name, items[] }
  steps             jsonb       -- Array of { title, time, desc, tip? }
  status            text        -- 'draft', 'pending', 'published', 'rejected'
  reject_reason     text        -- Reason for rejection (if rejected)
  pending_changes   jsonb       -- Proposed edit to a live recipe (snake_case column keys); live row stays untouched until approved
  pending_photo_url text        -- Proposed new hero image for a pending edit
  edit_reject_reason text       -- Reason an edit was rejected (recipe stays live)
  created_at        timestamptz
  updated_at        timestamptz
  published_at      timestamptz
)
```

> The `pending_changes`, `pending_photo_url`, and `edit_reject_reason` columns
> are added by `scripts/recipe-edits-migration.sql`. See
> [Editing Existing Recipes](#editing-existing-recipes) below.

### Recipe Statuses

| Status | Visibility | Description |
|--------|------------|-------------|
| `draft` | Author only | Work in progress, not submitted |
| `pending` | Author + Admins | In moderation queue awaiting review |
| `published` | Everyone | Live on the site |
| `rejected` | Author + Admins | Rejected with reason shown to author |

---

## Editing Existing Recipes

Recipes can be edited by their **author** or by an **admin**. To keep the live
site stable, edits to a published recipe never overwrite the live row directly —
they are stored as a proposed change and routed through the same admin queue used
for brand-new submissions.

Run `scripts/recipe-edits-migration.sql` once in the Supabase SQL editor to add
the columns and functions described here.

### New columns

| Column | Purpose |
|--------|---------|
| `pending_changes` (`jsonb`) | The proposed edit, stored with **snake_case** keys matching the table columns (`title`, `intro`, `ingredient_groups`, `steps`, …). `null` when there is no pending edit. |
| `pending_photo_url` (`text`) | A proposed new hero image. The live `photo_url` is untouched until approval. |
| `edit_reject_reason` (`text`) | Set when an admin rejects a proposed edit. The recipe stays `published`. |

### RPC functions (`SECURITY DEFINER`)

All edit writes go through these functions, which bypass RLS but enforce
permissions internally — so no RLS policy changes are needed.

| Function | Who can call | What it does |
|----------|--------------|--------------|
| `submit_recipe_edit(p_recipe_id, p_changes, p_photo_url)` | Author of the recipe **or** an admin | Stores `p_changes` in `pending_changes` and `p_photo_url` in `pending_photo_url`, clears `edit_reject_reason`, touches `updated_at`. The live columns are not modified. |
| `approve_recipe(p_recipe_id)` | Admins only | If `pending_changes` is set, merges each proposed field into the live columns (including `pending_photo_url` → `photo_url`), clears the pending fields, and sets `status='published'`. If `pending_changes` is `null`, it simply publishes a brand-new submission (old behaviour). |
| `reject_recipe(p_recipe_id, p_reason)` | Admins only | If `pending_changes` is set, discards the edit and records `edit_reject_reason` (the recipe **stays published**). Otherwise it rejects a brand-new submission by setting `status='rejected'` + `reject_reason`. |

### Lifecycle

```
Author/Admin clicks "Edit" on a recipe
        │
        ▼
upload.html?edit=<slug>  ──submit──►  submit_recipe_edit RPC
        │                                   │
        │                          writes pending_changes
        │                          (live row unchanged, still published)
        ▼
admin.html queue shows the card with an
"Edit to a live recipe" badge + proposed preview
        │
   ┌────┴─────┐
   ▼          ▼
approve_recipe   reject_recipe
   │                │
merge into      clear pending_changes,
live row,       set edit_reject_reason,
clear pending   recipe stays live
```

Key rules:

- **Brand-new submissions** are unchanged: `insert` with `status='pending'`,
  approved/rejected as before.
- **Edits** only ever write to `pending_changes` — the live version keeps
  serving until an admin approves.
- The **slug is kept stable** across edits so existing URLs and bookmarks don't
  break (the client omits `slug` from the edit payload).

### Inspecting pending edits manually

```sql
-- Recipes that currently have a proposed edit awaiting review
SELECT id, slug, title, status, pending_changes
FROM public.recipes
WHERE pending_changes IS NOT NULL;
```

```sql
-- Approve / reject from SQL (normally done via the admin UI)
SELECT public.approve_recipe('<recipe-uuid>');
SELECT public.reject_recipe('<recipe-uuid>', 'Please fix the ingredient amounts');
```

---

## Common Operations

### View All Recipes

```sql
SELECT id, slug, title, status, author_id, created_at
FROM public.recipes
ORDER BY created_at DESC;
```

### View Pending Recipes (Admin Queue)

```sql
SELECT r.id, r.slug, r.title, p.username as author, r.created_at
FROM public.recipes r
LEFT JOIN public.profiles p ON r.author_id = p.id
WHERE r.status = 'pending'
ORDER BY r.created_at ASC;
```

### Approve a Recipe

```sql
UPDATE public.recipes
SET status = 'published',
    published_at = NOW(),
    reject_reason = NULL
WHERE slug = 'recipe-slug-here';
```

### Reject a Recipe

```sql
UPDATE public.recipes
SET status = 'rejected',
    reject_reason = 'Your reason here'
WHERE slug = 'recipe-slug-here';
```

### Update Recipe Photo URL

```sql
UPDATE public.recipes
SET photo_url = 'https://images.unsplash.com/photo-xxxxx'
WHERE slug = 'recipe-slug-here';
```

### Delete a Recipe

```sql
DELETE FROM public.recipes
WHERE slug = 'recipe-slug-here';
```

**Warning:** This permanently deletes the recipe. The associated photo in storage is NOT automatically deleted.

### Assign All Recipes to a User

```sql
UPDATE public.recipes
SET author_id = 'user-uuid-here'
WHERE author_id IS NULL OR author_id != 'user-uuid-here';
```

### Find Recipes Without Photos

```sql
SELECT id, slug, title
FROM public.recipes
WHERE photo_url IS NULL OR photo_url = '';
```

---

## Storage Buckets

### Recipe Photos (`recipes` bucket)

**Path format:** `{user_id}/{timestamp}-{random}.{ext}`

Example: `6fd3a768-1f79-4299-b866-2981c04be2db/1717171200000-a1b2c3.jpg`

**To get the public URL:**
```
https://<project>.supabase.co/storage/v1/object/public/recipes/{path}
```

### Managing Storage in Dashboard

1. Go to **Supabase Dashboard** → **Storage**
2. Select the `recipes`, `cooks`, or `avatars` bucket
3. Browse, upload, or delete files

### Delete Orphaned Images

Images uploaded during failed submissions may be orphaned. To find them:

1. List all files in the `recipes` bucket
2. Compare against `photo_url` values in `public.recipes`
3. Delete files not referenced by any recipe

---

## User Management

### View All Users

```sql
SELECT id, username, display_name, role, created_at
FROM public.profiles
ORDER BY created_at DESC;
```

### Promote User to Admin

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE username = 'username-here';
```

### Demote Admin to User

```sql
UPDATE public.profiles
SET role = 'user'
WHERE username = 'username-here';
```

### Find User by Email

```sql
SELECT p.id, p.username, p.display_name, a.email
FROM public.profiles p
JOIN auth.users a ON p.id = a.id
WHERE a.email = 'user@example.com';
```

---

## Bulk Operations

### Export All Recipes as JSON

```sql
SELECT json_agg(r)
FROM public.recipes r
WHERE status = 'published';
```

### Bulk Update Tags

```sql
-- Add a tag to all recipes missing it
UPDATE public.recipes
SET tags = array_append(tags, 'Vegan')
WHERE 'Vegan' = ANY(tags) IS FALSE
  AND slug IN ('recipe-1', 'recipe-2', 'recipe-3');
```

### Re-run Migration (Upsert)

The migration script (`scripts/migrate-recipes.mjs`) is idempotent:

```bash
SUPABASE_URL="https://xxxx.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="ey..." \
node scripts/migrate-recipes.mjs
```

This will update existing recipes by slug without duplicating them.

---

## Troubleshooting

### Recipe Photo Not Showing

1. Check if `photo_url` is set:
   ```sql
   SELECT slug, photo_url FROM public.recipes WHERE slug = 'recipe-slug';
   ```

2. If empty, update it:
   ```sql
   UPDATE public.recipes
   SET photo_url = 'https://...'
   WHERE slug = 'recipe-slug';
   ```

3. If it's a storage URL, verify the file exists in the bucket

### User Can't See Their Submitted Recipe

- Check the recipe's `status` — it may be `pending` (awaiting approval)
- Check `author_id` matches the user's `id`

### Admin Queue Empty But Recipes Exist

- Verify recipes have `status = 'pending'`
- Check the admin user has `role = 'admin'` in `profiles`

---

## Backup & Recovery

### Export Recipes Table

In Supabase Dashboard:
1. Go to **Table Editor** → **recipes**
2. Click **Export** → **Download as CSV**

Or via SQL:
```sql
COPY (SELECT * FROM public.recipes) TO STDOUT WITH CSV HEADER;
```

### Export Storage Files

Use the Supabase CLI:
```bash
supabase storage cp -r 'recipes/*' ./backup/recipes/
```

---

## Related Files

| File | Purpose |
|------|---------|
| `scripts/schema.sql` | Full database schema |
| `scripts/migrate-recipes.mjs` | Import recipes from recipes-data.js |
| `scripts/seed-mackinley-kitchen-profile.sql` | Create The Mackinley Kitchen profile |
| `scripts/assign-recipes-to-mackinley.sql` | Assign recipes to a specific author |
| `docs/RECIPE_AUTHORING.md` | How to structure recipe data for cook mode |
