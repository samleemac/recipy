# PLAN: Trust & shell consistency cleanup

**Rank: 5 of 5.** A bundle of small, independent fixes that each erode user trust or shell consistency: hardcoded fake reviews shown on *every* recipe, a fake newsletter form, duplicate `#toasts` element IDs on the recipe page, three pages with no footer at all, and no navigation menu on mobile for recipe/technique pages. None is individually big; together they're the difference between "demo" and "product".

Each part below is independent — implement in the order given, verify per-part, and a failure in one must not block the others.

## Part A — remove the fake reviews section on `recipe.html`

### Problem
`recipe.html` ships a static Reviews section — "4.8 · 247 reviews" and three hardcoded quotes (Marta R. etc.) — identical on every recipe. There is no reviews backend. This is actively misleading.

### Files: `recipe.html` only

### Steps
1. Delete the whole `<section class="r-section r-reviews" id="reviews">…</section>` block (find it via `<!-- Reviews -->`; it contains the `.r-reviews-head` and three `.r-review` blocks).
2. Delete the sticky-anchor link to it: `<a class="r-anchor" href="#reviews">Reviews</a>` (in the `.r-glance` / anchors row near the top of `<main>`).
3. Search the inline script for `"#reviews"` / `reviews` to catch scrollspy references: `initScrollspy()` iterates the `.r-anchor` elements and their hash targets — **verify it derives sections from the anchor list** (it does; removing the anchor removes the scrollspy entry). If any hardcoded array of section ids exists, remove `"reviews"` from it.
4. Optionally delete the now-unused CSS: the `/* ---- Reviews ---- */` block (`.r-reviews`, `.r-review*` rules) and the `.r-reviews` token in the print-hide rule (`@media print { … .r-related, .r-reviews, footer { display:none } }`). Leaving the print rule token is harmless if unsure — but the style block should go.

### Edge cases a weaker model would miss
- The print stylesheet references `.r-reviews` in a comma-separated selector list — when removing, delete **only that token and its comma**, not the whole rule (it also hides nav, FAB, cmdk in print).
- Do not remove the `.r-rating` stars CSS if it's used elsewhere — check with a search first (it appears only inside the reviews section today, so it can go).

### Acceptance
- No "Reviews" anchor in the sticky glance bar; page scrolls normally; scrollspy highlights remaining anchors without console errors.
- `Cmd+P` print preview still hides nav/FAB and shows ingredients/method.

## Part B — fix duplicate `#toasts` on `recipe.html`

### Problem
`recipe.html` has a static `<div class="toasts" id="toasts" …>` in its body, **and** `app-shell.js` injects another `#toasts` on mount (`toastsHtml()`), producing duplicate IDs. It happens to work (both `getElementById` calls resolve to the first, static one) but is invalid HTML and one refactor away from broken toasts.

### Files: `recipe.html` only (do NOT change `app-shell.js` — every other page relies on its injection)

### Steps
1. Delete the static `<div class="toasts" id="toasts" aria-live="polite" aria-atomic="true"></div>` from `recipe.html`'s body.
2. The page's local `toast()` helper does `$("#toasts")` — the app-shell-injected container will now be the only match. Confirm timing: `app-shell.js` registers its `DOMContentLoaded` listener at script-parse time (it loads *before* the inline script), so `mount()` — which injects the container — runs before the page's own `DOMContentLoaded` work. Any `toast()` call from user interaction happens long after. No code change needed, but add a null guard to the local `toast()` (`if (!container) return;`) as belt-and-braces.

### Acceptance
- `document.querySelectorAll("#toasts").length === 1` after load.
- Click Save on a recipe → toast still appears. Trigger a cook-mode finish toast → appears.

## Part C — add footers to `feed.html`, `upload.html`, `profile.html`

### Problem
These three pages end abruptly with no footer; every other page has one. They also lack any footer path to the Cookery School.

### Files: `feed.html`, `upload.html`, `profile.html`

### Steps
1. Copy the minimal footer used by `technique.html` (bottom of the file):

```html
<footer class="site-footer-mini">
  <div class="logo">RECIPY<span class="logo-dot" aria-hidden="true"></span></div>
  <div>&copy; Recipy 2026 · <a href="learn.html">Cookery School</a> <a href="index.html">All recipes</a></div>
</footer>
```

2. Its styles are inline in `technique.html`, not in `theme.css` — so also copy the `footer { … }` CSS block from `technique.html` into each page's inline `<style>`, **renaming the selector to `.site-footer-mini`** in both the CSS and markup (a bare `footer` selector could collide with existing page styles; scope it).
3. Place the footer after `</main>` and before the `<script>` tags in each file.

### Edge cases
- `profile.html` and `feed.html` render content async into containers; the footer must sit **outside** those containers or it will be wiped by `innerHTML` writes.
- `upload.html` has fixed/sticky submit bars on small screens — after adding the footer, check the submit bar doesn't overlap it (add `margin-bottom` to the footer only if visually needed).

### Acceptance
- All three pages show the footer, light + dark mode, desktop + 375px width; the Cookery School link works; no layout overlap with the upload submit bar.

## Part D — mobile menu on recipe & technique pages

### Problem
`app-shell.js` renders crumb-style nav for `page === "recipe"` and `"technique"` (`isCrumbPage`), and deliberately omits the hamburger and `.mobile-nav`. On a phone, a user on a recipe page has **no menu at all** — only back and logo. (Desktop is fine: the crumb replaces the links row by design.)

### Files: `app-shell.js` only

### Steps
1. In `pillNavHtml()`, the hamburger button block is gated by `${isCrumbPage ? "" : `…hamburger…`}` — change the gate so the hamburger renders on crumb pages too (i.e. remove the `isCrumbPage` condition around the hamburger, keeping it for nothing else).
2. Same for the trailing `.mobile-nav` block: render it on crumb pages as well (remove the `isCrumbPage ? "" :` wrapper at the bottom of the function). The mobile-nav's active-state classes key off `page`, which is `"recipe"`/`"technique"` — no entry will show active; that's fine.
3. Check `theme.css` for `.nav-hamburger` visibility rules: it is hidden above the mobile breakpoint (`@media (max-width: 760px)` shows it). Confirm the crumb (`.nav-crumb`) plus hamburger fit at 375px — if the crumb title overflows, add to `theme.css`: `.nav-crumb { min-width: 0; } .nav-crumb strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }` scoped inside the existing mobile media query.
4. `initMobileNav()`/`bindShell()` binds `#navHamburger` if present — no JS changes needed; verify the binding is unconditional (it null-checks the element).

### Edge cases
- **Do not** render the `.nav-links` list on crumb pages — only the hamburger + dropdown. The desktop crumb layout must be pixel-identical to today at >760px (hamburger stays `display:none` there).
- `technique.html` and `recipe.html` both mount with `data-page` → the same `pillNavHtml` path; test both.

### Acceptance
- At 375px width on `recipe.html?slug=…` and `technique.html?slug=…`: hamburger visible, opens the menu with Recipes/Learn/Feed/Submit links, Escape/again-click closes it.
- At 1200px: nav looks exactly as before (no hamburger, crumb unchanged).

## Part E — honest newsletter + small a11y fixes

### Steps
1. `index.html` `initSubscribe()`: the form pretends to subscribe (client-only success). Change the success copy to be honest — e.g. toast/inline text "Thanks! The newsletter is launching soon — we've noted your interest." and store the email locally (`localStorage.setItem("recipy.newsletter.v1", email)`) so a future backend can pick it up. Do not build a backend.
2. `admin.html`: the reject-reason `<input>` has only a placeholder. Add `aria-label="Reason for rejection"`.
3. `supabase-client.js` `statsGetSiteStats`: `cookCount` is actually a **profiles** count. The UI label ("Home cooks") matches profiles, so numbers are not wrong — rename the field to `homeCookCount` in both `supabase-client.js` (two return sites: the unconfigured fallback and the Supabase path) **and** its consumer in `index.html` (`stats.cookCount` near `#statCooks`), purely for code clarity. Search for every `cookCount` usage before renaming — there are exactly the fallback object literal in `index.html` (`let stats = { recipeCount…, cookCount: 0 … }`) plus the two in `supabase-client.js`.

### Acceptance
- Subscribe with `a@b.com` → honest message, value in localStorage, no network request.
- Admin page reject input announces a label in the accessibility tree (inspect via DevTools a11y panel).
- Hero stats on index still animate to non-zero values when Supabase is configured; `rg cookCount` returns no hits.

## Overall verification (after all parts)

1. Inline-script syntax check across touched HTML files (the repo's established trick):
   `node -e "const fs=require('fs');for(const f of ['recipe.html','index.html','feed.html','upload.html','profile.html','admin.html']){const h=fs.readFileSync(f,'utf8');[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((m,i)=>{try{new Function(m[1])}catch(e){console.log(f,i,e.message);process.exitCode=1}})};console.log('OK')"`
2. `node --check app-shell.js supabase-client.js` (run separately per file).
3. Click-through: home → recipe → cook mode → finish; feed; profile tabs; upload form open — zero console errors, light and dark.
