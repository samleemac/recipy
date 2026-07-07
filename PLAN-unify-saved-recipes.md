# PLAN: Unify saved-recipe (bookmark) keys across the site

**Rank: 1 of 5 — do this first.** It is a correctness bug in a flagship feature (the Saved flow was recently built out deliberately), and every day it ships, users accumulate more wrongly-keyed bookmarks that need migrating.

## Goal

Saving a recipe must use the **same storage key everywhere** so that:
- Saving on the recipe page shows as saved on the home grid, and vice versa.
- Saves sync to Supabase (and therefore appear in Profile → Saved and on other devices) for **all** recipes, including limited-edition/variant recipes like the blueberry muffins.

## The bug (verified in code)

Three different keys are used for the same concept:

1. `index.html` card grid keys bookmarks on the recipe UUID:
   in `renderCards()` — `const stableId = String(r.id != null ? r.id : i);`
2. `recipe.html` keys bookmarks on `recipeKey`, which is set in `applyRecipeState()`:
   `recipeKey = String(recipe.variantGroup || recipe.id || recipe.slug || "0");`
   For the blueberry muffins, `variantGroup` is `"berried-treasure-blueberry-muffins"` — **not** a UUID.
3. Supabase sync (in both files' `toggleBookmark()`) only fires when the key matches
   `/^[0-9a-f-]{36}$/i`. So variant-group keys **never sync**, never appear in
   Profile → Saved, and never reach other devices.

Result: save the muffins on the recipe page → home grid shows it unsaved, profile Saved tab never shows it.

## Files to touch

| File | What changes |
|---|---|
| `recipe.html` | Introduce a separate `bookmarkKey`; migrate old keys; keep `recipeKey` untouched |
| `profile.html` | Saved tab merges local UUID-shaped bookmarks with remote list |
| `index.html` | No key change needed (already correct); only verify — see acceptance criteria |

## CRITICAL edge case — do not rename or repurpose `recipeKey`

In `recipe.html`, `recipeKey` is used for **more than bookmarks**. In `applyRecipeState()`:

```js
STORAGE_INGREDIENTS = `recipy.ingredients.${recipeKey}`;
STORAGE_STEPS       = `recipy.steps.${recipeKey}`;
STORAGE_SERVINGS    = `recipy.servings.${recipeKey}`;
```

These are the user's ticked-ingredients / completed-steps / servings state, and they are **deliberately keyed on `variantGroup`** so progress is shared between the English and Dutch editions of the same recipe (the comment above the function says so). If you change `recipeKey` itself, every user's in-progress cooking state resets and variant progress-sharing breaks.

**Therefore: add a NEW variable `bookmarkKey` and change only the bookmark call sites.** Leave `recipeKey` and all three `STORAGE_*` lines exactly as they are.

## Step-by-step implementation

### Step 1 — add `bookmarkKey` in `recipe.html`

Near the existing declaration `let recipeKey = "";` (in the "Recipe state" block), add:

```js
let bookmarkKey = "";          /* canonical save key — always the primary variant's id */
```

### Step 2 — compute `bookmarkKey` in `applyRecipeState()`

At the end of `applyRecipeState()` (after `currentLang = recipe.language || "en";`), add:

```js
bookmarkKey = computeBookmarkKey();
```

And add this function next to `applyRecipeState()`:

```js
/* Bookmarks must key on the PRIMARY variant's id so saves made while
   viewing the Dutch edition still match the card on the home grid
   (which only lists primary variants). Falls back to this recipe's own
   id, then slug, for static/offline mode. */
function computeBookmarkKey() {
  const primary = Object.values(variantsByLang).find(v => v && v.isPrimary !== false);
  const src = primary || recipe;
  return String(src.id != null ? src.id : (src.slug || "0"));
}
```

Note: `variantsByLang` may be empty at first paint (variants load async in `loadVariants()`), in which case `recipe` itself is used — for non-variant recipes that is already the primary. See Step 4 for the variant timing fix.

### Step 3 — switch bookmark call sites in `recipe.html`

There are exactly two call sites that read/write bookmarks with `recipeKey`. Change both to `bookmarkKey`:

- In `syncSaveButtons()`: `const saved = getBookmarks().has(recipeKey);` → `has(bookmarkKey)`
- In `bindActions()`, inside `const save = () => {`: `toggleBookmark(recipeKey)` → `toggleBookmark(bookmarkKey)`

Do NOT touch any other occurrence of `recipeKey` in the file (there are several — they're the progress-storage keys).

### Step 4 — recompute after variants load

Find `loadVariants()` (it populates `variantsByLang` from `RECIPY.recipes.getVariants`). After the variants map is filled, add:

```js
bookmarkKey = computeBookmarkKey();
syncSaveButtons();
```

This handles the case where the user landed on `recipe.html?slug=berried-treasure-blueberry-muffins-nl` (the Dutch UUID differs from the English one) — once variants arrive, the key snaps to the primary's UUID.

### Step 5 — one-time migration of wrongly-stored keys in `recipe.html`

Old clients stored `variantGroup` strings or slugs. Add this inside `computeBookmarkKey()` **before** the `return`, or as a separate function called right after `bookmarkKey` is first computed:

```js
/* Migrate legacy bookmark keys (variantGroup / slug / own-variant id)
   for this recipe to the canonical key. */
function migrateLegacyBookmark(canonicalKey) {
  const legacy = new Set([
    recipe.variantGroup,
    recipe.slug,
    ...Object.values(variantsByLang).map(v => v && String(v.id)),
    ...Object.values(variantsByLang).map(v => v && v.slug),
  ].filter(k => k && String(k) !== canonicalKey).map(String));
  const set = getBookmarks();
  let changed = false;
  for (const k of legacy) {
    if (set.has(k)) { set.delete(k); set.add(canonicalKey); changed = true; }
  }
  if (changed) {
    saveBookmarks(set);
    if (window.RECIPY && window.RECIPY.configured && /^[0-9a-f-]{36}$/i.test(canonicalKey)) {
      window.RECIPY.bookmarks.add(canonicalKey).catch(() => {});
    }
  }
}
```

Call `migrateLegacyBookmark(bookmarkKey)` in both places `bookmarkKey` is computed (Step 2 and Step 4). It's idempotent.

### Step 6 — merge local bookmarks into the Profile Saved tab

In `profile.html`, the saved tab currently does `const ids = await window.RECIPY.bookmarks.list();` and nothing else. Immediately after that line, merge in locally-saved UUID keys (covers saves made while the remote write failed or before sign-in):

```js
let localIds = [];
try { localIds = JSON.parse(localStorage.getItem("recipy.bookmarks.v1") || "[]"); } catch {}
const uuidLocal = localIds.filter(k => /^[0-9a-f-]{36}$/i.test(String(k)));
const merged = [...new Set([...ids, ...uuidLocal])];
```

Then use `merged` instead of `ids` in the `!ids.length` check and the `getByIds(ids)` call.

## Other edge cases a weaker model would miss

- **Static/offline mode**: when Supabase is unconfigured, recipe ids are small integers (0–22) from `recipes-data.js`. `String(src.id)` produces `"7"` etc., which matches what `index.html` stores (`String(r.id != null ? r.id : i)`). Do not add a UUID check to `computeBookmarkKey` — non-UUID keys are valid locally; only the *Supabase sync* is (correctly) gated on the UUID regex inside `toggleBookmark`.
- **`variantsByLang` values can include the current recipe itself.** The migration set builder filters out the canonical key — keep that `filter`.
- **`toggleBookmark` in `recipe.html` doesn't check `currentUser`** before calling `RECIPY.bookmarks.add` (the API throws internally and the `.catch(()=>{})` swallows it). Leave that behaviour; do not "fix" it by adding an auth prompt to the save button — guests saving locally is intended.
- **Do not change `getPlan()` / meal-plan keys** in `index.html` — they share `stableId` but are a separate storage (`recipy.plan.*`) and are already consistent.
- **`index.html` `syncBookmarksFromSupabase()`** already migrates legacy *integer-index* keys. Leave it alone; it is complementary to (not conflicting with) the recipe-page migration.

## Acceptance criteria

Run a local static server (`python3 -m http.server`) and verify in the browser:

1. Open `recipe.html?slug=berried-treasure-blueberry-muffins`, click Save. Go to `index.html` → the Berried Treasure card's bookmark icon shows **saved**.
2. Un-save from the home grid card → back on the recipe page (reload), the hero/FAB button shows **Save** (not Saved).
3. Switch the muffins recipe to Dutch (`?lang=nl` or the toggle), save → the same single key is stored (inspect `localStorage["recipy.bookmarks.v1"]` — exactly one entry gained, and it is the **English/primary** recipe's id).
4. While signed in with Supabase configured: save the muffins on the recipe page, open `profile.html?tab=saved` → the muffins appear.
5. Seed a legacy key: in DevTools run `localStorage.setItem("recipy.bookmarks.v1", JSON.stringify(["berried-treasure-blueberry-muffins"]))`, reload the muffins recipe page → button shows Saved, and the stored key has been replaced by the canonical id (check localStorage).
6. Tick 2 ingredients on any recipe, reload → still ticked (proves `STORAGE_*` keys unchanged).
7. `node --check` passes on no files (HTML inline) — instead verify no console errors on index, recipe, profile pages, light and dark.
