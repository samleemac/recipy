# PLAN: SEO & sharing baseline (Open Graph, JSON-LD, sitemap, robots)

**Rank: 4 of 5.** Recipy is a public recipe site with literally zero SEO surface today: no Open Graph or Twitter tags anywhere, no `robots.txt`, no `sitemap.xml`, no canonical URLs, no structured data. Recipe results are one of the most structured-data-rewarded verticals in Google (rich cards with photo, rating, cook time), and sharing a recipe link to iMessage/WhatsApp/Slack currently unfurls with nothing.

## Constraints discovered while exploring

- The site is fully static with client-rendered detail pages: `recipe.html?slug=…` and `technique.html?slug=…` render from JS. Crawlers that don't execute JS see placeholder content; **Googlebot does execute JS**, so client-injected JSON-LD and title/description updates are effective for Google, while static OG tags cover link-unfurl bots (which do NOT execute JS — this is why each page needs sensible *static* OG defaults).
- The production URL is not recorded anywhere in the repo. All absolute-URL emitters must read from **one** configurable constant.
- The blueberry muffins exist as two rows (EN primary + NL variant). Only the primary must be in the sitemap.

## Files to touch / create

| File | What |
|---|---|
| `config.js` | Add `siteUrl` to `window.RECIPY_CONFIG` (single source of truth) |
| `robots.txt` (new) | Allow all; point to sitemap |
| `scripts/generate-sitemap.mjs` (new) | Emits `sitemap.xml` from static data files |
| `sitemap.xml` (new, generated) | Committed output |
| `package.json` | Add `"sitemap": "node scripts/generate-sitemap.mjs"` script |
| `index.html`, `learn.html`, `feed.html`, `upload.html`, `profile.html` | Static OG/Twitter/canonical tags |
| `recipe.html` | Static OG defaults + dynamic OG/JSON-LD/canonical after `resolveRecipe()` |
| `technique.html` | Static OG defaults + dynamic tags after guide render |

## Step-by-step implementation

### Step 1 — the site URL constant

In `config.js`, add to the existing `window.RECIPY_CONFIG` object:

```js
siteUrl: "https://SET-ME.example.com",   // production origin, no trailing slash
```

Everything below must build absolute URLs as `(window.RECIPY_CONFIG?.siteUrl || location.origin)`. The sitemap script reads the same value by parsing `config.js` (see Step 3) or via a `SITE_URL` env override. Tell the user in the final summary that they must set `siteUrl` to their real domain and re-run `npm run sitemap`.

### Step 2 — `robots.txt`

```
User-agent: *
Allow: /
Disallow: /admin.html
Sitemap: https://SET-ME.example.com/sitemap.xml
```

(The generator in Step 3 should rewrite the `Sitemap:` line with the real `siteUrl` each run so it can't drift.)

### Step 3 — sitemap generator

`scripts/generate-sitemap.mjs`, modelled on `scripts/audit-cookmode-ingredients.mjs`'s loader (it already shows how to eval `recipes-data.js` into a `vm` context — reuse that exact pattern, and load `techniques-data.js` the same way):

- Static pages: `index.html`, `learn.html`, `feed.html` (skip `upload.html`, `profile.html`, `admin.html`, `coming-soon.html` — auth-gated or placeholder).
- One `<url>` per recipe: `recipe.html?slug=<slug>` — **only** recipes where `isPrimary !== false` (this is the exact filter `staticListable()` uses in `supabase-client.js`; match it). URL-encode slugs with `encodeURIComponent`.
- One `<url>` per guide: `technique.html?slug=<slug>` from `window.TECHNIQUES`.
- Escape `&` in query URLs as `&amp;` (XML requirement — there are none today since slugs are single params, but the escape guards future params).
- Write `sitemap.xml` at repo root; also rewrite the `Sitemap:` line in `robots.txt`.
- Resolve the base URL: `process.env.SITE_URL` first, else parse `siteUrl` out of `config.js` with a regex like `/siteUrl:\s*"([^"]+)"/`; exit 1 with a clear message if it's still the SET-ME placeholder.

Add to `package.json`: `"sitemap": "node scripts/generate-sitemap.mjs"`. Run it once and commit the output (with the placeholder guard, this run may need `SITE_URL=` set; if the user hasn't provided a domain, generate with the placeholder AND say so loudly in the summary).

### Step 4 — static OG/Twitter/canonical on the listing pages

In each `<head>` (`index.html`, `learn.html`, `feed.html`, `upload.html`, `profile.html`), after the existing `<meta name="description">` (add one where missing), add:

```html
<meta property="og:site_name" content="Recipy" />
<meta property="og:type" content="website" />
<meta property="og:title" content="<page title>" />
<meta property="og:description" content="<same as meta description>" />
<meta property="og:image" content="https://SET-ME.example.com/photo-fallback.jpg" />
<meta name="twitter:card" content="summary_large_image" />
```

- `photo-fallback.jpg` exists at repo root (verified) — it's a fine generic share image. OG images **must be absolute URLs**; use the `siteUrl` placeholder and note it in the summary (unfurl bots don't run JS, so this cannot be made dynamic).
- Canonical: `<link rel="canonical" href="https://SET-ME.example.com/index.html" />` etc. Skip canonical on `profile.html` (per-user query pages) and `upload.html`.

### Step 5 — dynamic tags + JSON-LD on `recipe.html`

Add the same static defaults as Step 4 to `recipe.html`'s head (og:type `article`), then in the inline script, add a function called at the end of `renderHero()` **and** in `setLanguage()` (both re-render paths):

```js
function updateMetaForRecipe() {
  const base = (window.RECIPY_CONFIG?.siteUrl || location.origin).replace(/\/$/, "");
  const url = `${base}/recipe.html?slug=${encodeURIComponent(recipe.slug)}`;
  setMeta("og:title", `${recipe.title} — Recipy`);
  setMeta("og:description", recipe.intro || "");
  setMeta("og:image", photo);
  setMeta("og:url", url);
  let canon = document.querySelector('link[rel="canonical"]');
  if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
  canon.href = url;
  injectRecipeJsonLd(url);
}
function setMeta(prop, content) {
  let el = document.querySelector(`meta[property="${prop}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
  el.setAttribute("content", content);
}
```

JSON-LD (schema.org `Recipe`):

```js
function injectRecipeJsonLd(url) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.intro || "",
    image: [photo],
    author: { "@type": "Person", name: recipe.author || "Recipy" },
    totalTime: `PT${recipe.time || 30}M`,
    recipeYield: `${baseServings} ${recipe.servingNoun || "servings"}`,
    recipeCuisine: recipe.cuisine || undefined,
    keywords: (recipe.tags || []).join(", "),
    recipeIngredient: (recipe.ingredientGroups || []).flatMap(g =>
      (g.items || []).map(it => `${it.amount || ""} ${it.unit || ""} ${it.text}`.trim().replace(/\s+/g, " "))),
    recipeInstructions: (recipe.steps || []).map(s => ({
      "@type": "HowToStep", name: s.title || undefined, text: s.desc || "" })),
    nutrition: recipe.macros ? {
      "@type": "NutritionInformation",
      calories: `${recipe.macros.calories} calories`,
      proteinContent: `${recipe.macros.protein} g`,
      carbohydrateContent: `${recipe.macros.carbs} g`,
      fatContent: `${recipe.macros.fat} g`,
    } : undefined,
    url,
    inLanguage: recipe.language || "en",
  };
  let el = document.getElementById("recipeJsonLd");
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "recipeJsonLd";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data).replace(/</g, "\\u003c");
}
```

### Step 6 — dynamic tags on `technique.html`

Same pattern, simpler: in `renderGuide()`, set `document.title` (already done), og:title/description/image/url + canonical, and a `HowTo`-flavoured JSON-LD is overkill — use `Article`:

```js
{ "@context": "https://schema.org", "@type": "Article",
  headline: guide.title, description: guide.subtitle,
  image: [guide.heroPhoto], author: { "@type": "Organization", name: "Recipy" } }
```

## Edge cases a weaker model would miss

1. **`JSON.stringify(...).replace(/</g, "\\u003c")` is mandatory.** Recipe text is user-adjacent content; an unescaped `</script>` inside a step description would terminate the JSON-LD script tag and inject markup. The replace forecloses it.
2. **`setLanguage()` re-renders the recipe in place** — meta/JSON-LD must be refreshed there too, and `inLanguage` must follow `recipe.language`. If you only hook `renderHero()`, check whether `setLanguage()` calls it (it does — hooking `renderHero()` alone is sufficient; verify before adding a second call, to avoid double injection… which the `getElementById` guard makes harmless anyway).
3. **ISO-8601 durations**: `totalTime` must be `PT30M`, not `30` or `"30 min"`. Ranges don't exist in the data (single `time` number) — don't invent `cookTime`/`prepTime` splits from nothing; Google accepts `totalTime` alone.
4. **`undefined` values in JSON-LD**: `JSON.stringify` drops `undefined` object properties automatically — the pattern above relies on that. Do not replace `undefined` with `null` (null is emitted and fails validation).
5. **Ingredient amounts can be `0`** (e.g. "to taste" items with empty units); the template `${it.amount || ""}` handles 0/undefined the same way — fine here, don't "fix" it to show 0.
6. **The sitemap must exclude non-primary variants** (`isPrimary === false`), or Google sees EN and NL muffin pages as duplicates competing for the same query. This mirrors the home-grid dedup rule.
7. **`profile.html` has no meta description today** — add one, but do NOT add a canonical (its content varies with `?u=`).
8. **Do not add `og:url` statically to recipe/technique heads** — a static wrong URL is worse than none; only the dynamic path sets it.
9. **`recipe.slug` can be missing** in legacy `?id=N` mode (static fallback) — guard: if `!recipe.slug`, skip canonical/og:url and JSON-LD `url` (emit the rest).

## Acceptance criteria

1. `npm run sitemap` writes `sitemap.xml` containing: 3 static pages, one entry per primary recipe (spot-check the muffins: EN slug present, `-nl` slug absent), and 3 technique guides. `robots.txt` `Sitemap:` line matches.
2. `curl`/open `robots.txt` — disallows `/admin.html`, allows the rest.
3. Open `recipe.html?slug=berried-treasure-blueberry-muffins` in a browser; in DevTools:
   - `document.querySelector('meta[property="og:title"]').content` is "Berried Treasure Blueberry Muffins — Recipy" (or the actual title),
   - `#recipeJsonLd` exists; paste its content into Google's Rich Results Test (or `JSON.parse` it in console) — parses cleanly, `@type: "Recipe"`, non-empty `recipeIngredient` and `recipeInstructions`.
4. Toggle the recipe to Dutch → `inLanguage` becomes `nl` and og:title shows the Dutch title.
5. Open a recipe via legacy `?id=3` with Supabase config emptied (static mode) → no console errors; JSON-LD present minus `url`.
6. `technique.html?slug=how-to-cook-eggs` → og tags + Article JSON-LD present.
7. Every touched HTML file passes an inline-script syntax check (`new Function` eval trick used in this repo's previous verifications) and shows no console errors.
