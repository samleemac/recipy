# PLAN: Add Cookery School guides to the command palette

**Rank: 3 of 5.** This was explicitly deferred from the Learn-section v1 ("Command-palette search integration for guides" was listed as a future phase). The Learn section is live but invisible to search — the palette is the site's primary discovery surface (⌘K, `/`, and the nav search button), and right now typing "tofu" surfaces recipes but never the tofu guide.

## Goal

Searching in the command palette (both on `index.html` and `recipe.html`) surfaces matching technique guides in a "Cookery School" section, and the empty state shows the guides as a browsable section. Also fix the small a11y gap found on the recipe page's palette input while in the file.

## Files to touch

| File | What changes |
|---|---|
| `index.html` | Load `techniques-data.js`; add guide search + section to its `cmdk.renderRecipes()` |
| `recipe.html` | Add guide search + section to its `cmdk.renderRecipes()`; add missing `aria-label` on `#cmdkInput` |

There are **two independent copies** of the palette object (`const cmdk = {...}` in each file's inline script). They differ in details (index has category chips and prefill; recipe has "Enter Cook Mode"). Do not try to merge them into a shared file in this task — edit each in place. (Extracting a shared module is worthwhile but is a separate, riskier refactor.)

## Step-by-step implementation

### Step 1 — load the guide data on `index.html`

`index.html` does **not** currently load `techniques-data.js` (only `learn.html`, `technique.html` and `recipe.html` do). In `index.html`'s script chain, add the tag **after** `recipes-data.js` and **before** the inline `<script>`:

```html
<script src="techniques-data.js"></script>
```

`recipe.html` already loads it (it powers the guide cross-link banner) — no script change needed there.

### Step 2 — add a shared matcher (copy into BOTH inline scripts)

Add near each file's `cmdk` object:

```js
function searchGuides(q) {
  const guides = window.TECHNIQUES || [];
  if (!q) return guides;
  return guides.filter(g =>
    g.title.toLowerCase().includes(q) ||
    (g.tags || []).some(t => t.toLowerCase().includes(q)) ||
    (g.relatedIngredientKeywords || []).some(k => k.toLowerCase().includes(q))
  );
}

function guideCmdkSection(q) {
  const matches = searchGuides(q).slice(0, 4);
  if (!matches.length) return "";
  return `
    <div class="cmdk-section">
      <h5>Cookery School</h5>
      ${matches.map(g => `
        <a class="cmdk-item" data-action="navigate" href="technique.html?slug=${encodeURIComponent(g.slug)}">
          <span class="cmdk-item-icon" aria-hidden="true" style="font-size:18px">${g.icon || "🎓"}</span>
          <div class="cmdk-item-main">
            <div class="cmdk-item-title">${escapeHtml(g.title)}</div>
            <div class="cmdk-item-sub">${escapeHtml(g.skillLevel)} · ${g.readTime} min read · ${g.methods.length} methods</div>
          </div>
          <span class="cmdk-item-meta">Guide</span>
        </a>`).join("")}
    </div>`;
}
```

Notes:
- Guide keyword matching uses `relatedIngredientKeywords` so "egg", "chickpea", "aquafaba" all hit.
- The `q` passed in must be the already-lowercased trimmed query (both `renderRecipes` implementations compute `const q = this.input.value.trim().toLowerCase();` — reuse that variable).
- `escapeHtml` already exists in both files' inline scripts.

### Step 3 — inject the section into `index.html`'s `renderRecipes()`

In `index.html`, find the line that assembles the body:

```js
this.body.innerHTML = filterChips + recipeList + actions;
```

Change to:

```js
const guides = guideCmdkSection(q);
this.body.innerHTML = filterChips + recipeList + guides + actions;
```

Placement: after recipes, before quick actions. With no query, all 3 guides show as a browse section (mirrors the "Suggested" recipes block).

### Step 4 — inject into `recipe.html`'s `renderRecipes()`

In `recipe.html`, find:

```js
this.body.innerHTML = recipeList + actions;
```

Change to:

```js
const guides = guideCmdkSection(q);
this.body.innerHTML = recipeList + guides + actions;
```

### Step 5 — check keyboard activation on both pages

- Both pages rebuild the selectable list with `this.items = $$(".cmdk-item", this.body);` after setting `innerHTML` — the new `<a class="cmdk-item">` entries are picked up automatically. No change needed.
- **`index.html`'s `activate()` handles `data-action === "navigate"` by reading `getAttribute("href")`** — the markup above sets both, so Enter works.
- **`recipe.html`'s `activate()` is different**: read it before assuming. It navigates plain `<a>` items by checking `sel.tagName === "A"` / href (verify in the file — the `activate()` function is right after `move()`). If it only special-cases `data-action` buttons (`theme`, `cook`) and clicks/follows anchors otherwise, the guide items work as-is. If it *only* handles buttons, add an anchor branch:
  `if (sel.tagName === "A") { window.location.href = sel.getAttribute("href"); return; }`

### Step 6 — fix the recipe palette input label

In `recipe.html`, the palette input is:

```html
<input id="cmdkInput" type="text" placeholder="Search recipes, authors, or try 'duck'…" autocomplete="off" />
```

Add `aria-label="Search recipes and guides"` (the index copy already has a label — check and mirror its exact attribute style). While there, update **both** pages' recipes-mode placeholder from "Search recipes, authors, or try 'duck'…" to "Search recipes, guides, or try 'tofu'…" — including the copies set in each `setMode()` function (the placeholder is reassigned on mode switch; if you only change the HTML attribute, switching People → Recipes restores the old text).

## Edge cases a weaker model would miss

1. **The placeholder lives in two places per page**: the HTML attribute *and* the `setMode()` reassignment. Change both or the new text disappears after visiting the People tab.
2. **`window.TECHNIQUES` may be undefined** if `techniques-data.js` fails to load or the script tag is misordered — `searchGuides` guards with `|| []`, and `guideCmdkSection` returns `""`. Never let the palette throw; it would take the whole search feature down.
3. **`cmdk-item-icon` sizing**: the existing class is designed for 18px SVGs. The emoji needs the inline `font-size:18px` (as specified) or it renders tiny/misaligned. Do not invent a new class — the palette styles are page-local and duplicated; a new class would need adding in both files' `<style>` blocks.
4. **Result caps**: recipes are capped at 8; cap guides at 4 (`.slice(0, 4)`) so quick actions never scroll off-screen on a laptop.
5. **The "no matches" empty state on index** (`cmdk-empty`) renders when `results.length === 0` — but guides may still match (e.g. query "aquafaba" matches zero recipes, one guide). The section injection in Step 3 happens regardless of recipe results, so this already works — but verify: type "aquafaba" → recipe area says no matches, Cookery School section shows the chickpea guide beneath it. If the empty-state branch `return`s early in the code you find, restructure so the guide section still renders.
6. **Do not add guides to the People mode** — `renderPeople()` is async and rebuilds `this.body` after a network reply; injecting the guide section there would be overwritten or duplicated.

## Acceptance criteria

Serve locally and verify:

1. On `index.html`, press `⌘K` (or click Search): with an empty query the palette shows Categories, Suggested recipes, a **Cookery School** section with 3 guides, then Quick actions.
2. Type `tofu` → recipe matches AND the "How to Cook Tofu" guide appear; Enter on the guide (arrow down to it) navigates to `technique.html?slug=how-to-cook-tofu`.
3. Type `aquafaba` → zero recipes, but the chickpea guide appears and is clickable.
4. Same checks pass on `recipe.html`'s palette.
5. Switch to People mode and back to Recipes → placeholder still says "Search recipes, guides, or try 'tofu'…" and the guide section still renders.
6. Temporarily rename `techniques-data.js` in the script tag to a bogus path → palette still opens and searches recipes without console errors (then restore).
7. Keyboard-only pass: open palette, ↓ to a guide row, Enter → navigates. `Esc` still closes.
8. No console errors on either page, light and dark mode.
