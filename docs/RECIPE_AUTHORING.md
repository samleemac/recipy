# Recipe authoring — cook mode checklist

Every published recipe must show **ingredients and amounts** under “Ingredients this step” in **cook mode** for **every** step. Use this guide when adding or editing recipes in `recipes-data.js` and Supabase.

## Data shape (unchanged)

Recipes live in [`recipes-data.js`](../recipes-data.js) and are upserted to Supabase with:

```bash
SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." npm run migrate
```

Each recipe needs `ingredientGroups` (with `amount`, `unit`, `text`) and `steps` (with `title`, `time`, `desc`, optional `tip`).

## How cook mode picks ingredients

[`recipe.html`](../recipe.html) resolves ingredients in this order:

1. **`ingredientKeys`** (preferred, explicit) — array of `"groupIndex-itemIndex"` strings, e.g. `"0-2"`, `"1-0"`. Group/item indices match `ingredientGroups` in the file (0-based).
2. **`ingredientGroupNames`** — array of exact group `name` strings; all items in those groups are shown (good for “mix the sauce” steps).
3. **Group name in step text** — if the step mentions a group name (e.g. “cheese sauce”), that whole group is included.
4. **Keyword match** — ingredient words (4+ letters) matched in the step title, description, or tip.

Explicit keys are the most reliable. Keyword matching alone often misses items (e.g. “teriyaki sauce” vs `tamari` / `mirin`).

## Required for every step

| Rule | Why |
|------|-----|
| Each step has at least one ingredient chip | Cooks need amounts while working through the method |
| Every ingredient appears in at least one step | Nothing should only exist on the main ingredients list |
| Heat / flip / bake steps still list what you’re working with | e.g. batter on “Heat the pan”, tortillas on “Warm the tortillas” |

### Examples

**Sauce step — use a group name:**

```javascript
{
  title: "Mix the teriyaki sauce",
  time: 2,
  desc: "In a small bowl, mix together all the quick teriyaki sauce ingredients. Set aside.",
  ingredientGroupNames: ["Quick teriyaki-style sauce"]
}
```

**Explicit items — use keys:**

```javascript
{
  title: "Warm the tortillas",
  time: 2,
  desc: "Place tortillas on a baking tray and warm in the oven for 1–2 minutes.",
  ingredientKeys: ["1-2"]  // group 1, item 2 = tortilla wraps
}
```

**Ongoing step — repeat batter keys:**

```javascript
{
  title: "Heat the pan",
  time: 2,
  desc: "Place a non-stick frying pan over medium heat…",
  ingredientKeys: ["0-0", "0-1", "0-2", "0-3", "0-4", "0-5"]
}
```

## Audit before you ship

Run the cook-mode audit (must exit 0):

```bash
npm run audit:cookmode
```

This reports:

- **Empty steps** — no ingredients would show in cook mode
- **Orphan ingredients** — never linked to any step

## Bulk assign keys (optional)

If you add a large recipe or import from text, you can auto-assign keys, then review:

```bash
node scripts/apply-cookmode-ingredient-keys.mjs
npm run audit:cookmode
```

Re-run migrate after changing `recipes-data.js`.

## New recipe workflow

1. Add full `ingredientGroups` and `steps` to `recipes-data.js`.
2. Add `ingredientKeys` or `ingredientGroupNames` on any step that keyword matching might miss.
3. Run `npm run audit:cookmode` until it passes.
4. Run `npm run migrate` to update Supabase.
5. Open the recipe on the site → cook mode → click through **every** step and confirm chips + amounts.
