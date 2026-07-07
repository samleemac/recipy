# PLAN: Make the cook-mode ingredient audit match runtime behaviour

**Rank: 2 of 5.** Small, contained, and it guards the one guarantee the product owner has called "vital": cook mode must always show the ingredients (and amounts) needed at every step. The audit script is the CI gate for that guarantee — and right now it audits different logic than the site actually runs.

## Goal

`npm run audit:cookmode` (`scripts/audit-cookmode-ingredients.mjs`) must reproduce exactly what `recipe.html` renders in cook mode — **including the cross-step deduplication** added later (`getUsedIngredientKeys`) — so the audit can no longer pass while cook mode shows an empty chip row, or vice versa.

## The mismatch (verified in code)

Runtime (`recipe.html`, functions `getUsedIngredientKeys` + `ingredientsForStep(step, stepIndex)`):
- Before matching, it builds a set of ingredient keys "used" by **earlier** steps and skips those items (so step 3 doesn't re-list the 5 sauce ingredients mixed in step 2).
- Crucially, "used" is computed **only from earlier steps' explicit `ingredientKeys` and `ingredientGroupNames`** — never from earlier steps' keyword-tier matches.
- The skip happens inside `pushItem` in **every** resolution tier, which means: if a step's explicit `ingredientKeys` are all already-used, `matched` stays empty and the code **falls through** to the group-name tier, then the keyword tier.

Audit script (`scripts/audit-cookmode-ingredients.mjs`):
- Implements the four resolution tiers but has **no concept of used keys**. It flags a step "empty" only if raw matching finds nothing, and can call a step fine when runtime will render zero chips.

## Files to touch

| File | What changes |
|---|---|
| `scripts/audit-cookmode-ingredients.mjs` | Port dedup; classify empty steps into two categories |
| `docs/RECIPE_AUTHORING.md` | Document the dedup rule + new audit output |

Do **not** touch `recipe.html` — runtime is the source of truth; the audit conforms to it.

## Step-by-step implementation

### Step 1 — port `getUsedIngredientKeys` into the audit script

Add to `scripts/audit-cookmode-ingredients.mjs` (above `ingredientsForStep`). It must mirror `recipe.html` exactly:

```js
function getUsedIngredientKeys(steps, stepIndex, ingredientGroups) {
  const used = new Set();
  for (let i = 0; i < stepIndex; i++) {
    const prev = steps[i];
    if (prev.ingredientKeys?.length) {
      for (const key of prev.ingredientKeys) used.add(String(key));
    }
    if (prev.ingredientGroupNames?.length) {
      for (const name of prev.ingredientGroupNames) {
        const gi = ingredientGroups.findIndex(
          (g) => (g.name || "").toLowerCase() === String(name).toLowerCase()
        );
        if (gi !== -1) {
          ingredientGroups[gi].items.forEach((_, ii) => used.add(`${gi}-${ii}`));
        }
      }
    }
  }
  return used;
}
```

### Step 2 — thread used-keys through `ingredientsForStep`

Change the audit's `ingredientsForStep(step, ingredientGroups)` signature to `ingredientsForStep(step, ingredientGroups, usedKeys)` and make its `push` helper skip used keys, mirroring runtime's `pushItem`:

```js
const push = (gi, ii, item) => {
  const k = itemKey(gi, ii);
  if (usedKeys.has(k)) return;      // NEW: skip ingredients shown in earlier steps
  if (seen.has(k)) return;
  seen.add(k);
  matched.push({ gi, ii, text: item.text });
};
```

**Do not restructure the tiers.** The existing order — explicit keys → group names → group-name-in-text → keyword — and the `if (matched.length) return matched;` early-exits after each tier must stay byte-for-byte in the same positions, because the used-key skip interacts with the fall-through (a fully-deduped keys tier falls through to later tiers, exactly like runtime).

### Step 3 — classify empty steps into two buckets in the main loop

Replace the per-recipe loop body with logic that runs the match **twice** per step:

```js
steps.forEach((step, si) => {
  const usedKeys = si > 0 ? getUsedIngredientKeys(steps, si, groups) : new Set();
  const effective = ingredientsForStep(step, groups, usedKeys);   // what cook mode shows
  const raw       = ingredientsForStep(step, groups, new Set());  // ignoring dedup
  raw.forEach((m) => usedKeys2Global.add(itemKey(m.gi, m.ii)));   // orphan tracking uses RAW
  if (effective.length === 0) {
    if (raw.length === 0) {
      emptySteps.push({ slug: r.slug, step: si + 1, title: step.title });          // ERROR
    } else {
      dedupedSteps.push({ slug: r.slug, step: si + 1, title: step.title });        // INFO
    }
  }
});
```

(`usedKeys2Global` is the existing per-recipe `usedKeys` set used for orphan detection — rename to avoid clashing with the new per-step variable.)

Rationale for the two buckets:
- **`emptySteps` (raw AND effective empty)** — a genuine authoring error, keeps exiting 1.
- **`dedupedSteps` (raw non-empty, effective empty)** — the step's ingredients were all introduced earlier (e.g. "add the sauce"). This is **intentional product behaviour** (explicitly requested: "the user can just read the text to put the sauce in"), so it must be reported as informational, **not** a failure. A weaker model would flag these as errors and force pointless data churn.

### Step 4 — output & exit code

- Print `EMPTY STEPS` (errors) exactly as today.
- Print a new section `DEDUPED STEPS (0 chips at runtime — OK if the step references a made component like a sauce or batter):` listing `dedupedSteps`.
- Keep orphan-ingredient detection **based on raw matches** (an ingredient "shown at least once" should count its first raw appearance; dedup never hides a first appearance anyway, but using raw keeps the invariant obvious).
- Exit code: `1` only for `emptySteps.length + orphanIngredients.length > 0`. Deduped steps never fail the build.

### Step 5 — document in `docs/RECIPE_AUTHORING.md`

Add a short subsection under the cook-mode rules:
- Runtime hides ingredients already introduced by an earlier step's explicit `ingredientKeys`/`ingredientGroupNames`.
- A later step that only references a made component (sauce, batter, marinade) is *expected* to show zero chips; the audit reports these as `DEDUPED STEPS` info, not errors.
- Keyword-tier matches in earlier steps do **not** mark ingredients as used — if you want dedup, use explicit keys.

## Edge cases a weaker model would miss

1. **Dedup source is explicit-only.** Only `ingredientKeys` and `ingredientGroupNames` of earlier steps populate the used set. Copying the "used" tracking from the audit's current orphan loop (which uses matched output from all tiers) would over-dedupe versus runtime.
2. **Tier fall-through after full dedup.** If a step's explicit keys are all used, runtime falls through to group-name/keyword tiers and may legitimately surface *other* unused ingredients. The port must keep the `if (matched.length) return matched;` guards *after* the used-key filtering, not before.
3. **Orphan detection must use raw matches**, otherwise an ingredient could be counted as never-shown when dedup merely suppressed a *second* appearance.
4. **`getUsedIngredientKeys` normalises keys with `String(key)`** — recipe data sometimes has keys as strings, sometimes conceivably numbers. Keep the `String()` calls.
5. **Group name matching is case-insensitive** in both directions (`toLowerCase()` on both sides) — preserve it.
6. **Don't "improve" the STOP-word list or keyword regexes** while in there. Any drift from `recipe.html` recreates the exact class of bug this plan removes. If you spot an improvement, apply it to BOTH files in a separate change.

## Acceptance criteria

1. `npm run audit:cookmode` exits `0` on the current dataset (the data was previously authored to pass; if any *new* `EMPTY STEPS` errors appear, the finding is real — list them in the summary rather than papering over them).
2. The output contains a `DEDUPED STEPS` section, and it lists at least the known intentional cases (e.g. teriyaki-sauce-style "add the sauce" steps in the rice-bowl recipes).
3. Manual spot check: pick one recipe listed under `DEDUPED STEPS`, open `recipe.html?slug=<it>` in a browser, enter cook mode, navigate to that step → chip row is empty and the step text references a made component. Audit and runtime now agree.
4. Temporarily add a bogus step `{ "title": "Test", "desc": "Do nothing." }` to one recipe locally → audit exits `1` and lists it under `EMPTY STEPS`. Revert afterwards.
5. `node --check scripts/audit-cookmode-ingredients.mjs` passes.
6. `docs/RECIPE_AUTHORING.md` mentions dedup and the two audit categories.
