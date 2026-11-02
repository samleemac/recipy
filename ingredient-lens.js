/* ============================================================
   Recipy — Ingredient lens (recipe page)
   Every ingredient gets a lens button. Open it to see:
   - exactly which steps use it (and those steps light up)
   - good swaps if you haven't got it, or for vegan/gluten-free
   - which other recipes use it (use up the rest of the pack)
   - a technique guide if there is one
   - add it to the shopping list, or tick it as "got it"
   ============================================================ */
(function () {
  const EXTRA_KEY = "recipy.shopextra";
  let host, panel, current = null, lastTrigger = null;

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- swaps ----------
     Each rule: [matches ingredient name, [[swap, why/how], ...]] */
  const SWAPS = [
    [/\b(?<!peanut |plant-based )butter\b(?! beans)/i, [["Plant-based butter", "Same amount, keeps it dairy-free"], ["Olive oil", "For savoury cooking, use a little less"]]],
    [/\b(single|double|oatly|cooking) cream\b|^cream$/i, [["Oat cream", "Same amount, dairy-free"], ["Cashew cream", "Blend soaked cashews with water"], ["Light coconut milk", "Adds a gentle coconut note"]]],
    [/coconut milk/i, [["Oat cream", "Less coconut flavour, still creamy"], ["Cashew cream", "Rich and neutral"]]],
    [/\bsoy sauce\b(?! or)/i, [["Tamari", "Gluten-free, same amount"], ["Coconut aminos", "Sweeter and less salty"]]],
    [/\btamari\b/i, [["Soy sauce", "Same amount (contains gluten)"]]],
    [/maple|agave/i, [["Honey", "Same amount (not vegan)"], ["Golden syrup", "Same amount"]]],
    [/\bhoney\b/i, [["Maple syrup", "Same amount, vegan"], ["Agave syrup", "Same amount, vegan"]]],
    [/halloumi/i, [["Paneer", "Fry it the same way"], ["Firm tofu", "Press it, then pan-fry until golden"]]],
    [/\bfeta\b|salad cheese/i, [["Vegan feta", "Same amount"], ["Firm tofu crumbled", "With lemon juice and a good pinch of salt"]]],
    [/paneer/i, [["Halloumi", "Saltier, so season less"], ["Firm tofu", "Press it first"]]],
    [/parmesan|hard cheese|italian.style/i, [["Nutritional yeast", "1–2 tbsp for the savoury hit, vegan"], ["Pecorino", "Saltier, use a little less"]]],
    [/cheddar|grated cheese/i, [["Plant-based grated cheese", "Same amount"], ["Red Leicester", "Melts the same way"]]],
    [/\btofu\b/i, [["Tempeh", "Firmer and nuttier, slice thinly"], ["Chickpeas", "For bowls and curries"]]],
    [/tempeh/i, [["Firm tofu", "Pressed, same amount"]]],
    [/chickpea/i, [["Butter beans", "Creamier, same amount"], ["Cannellini beans", "Same amount"]]],
    [/butter beans/i, [["Cannellini beans", "Same amount"], ["Chickpeas", "Firmer bite"]]],
    [/kidney beans/i, [["Black beans", "Same amount"], ["Pinto beans", "Same amount"]]],
    [/black beans/i, [["Kidney beans", "Same amount"], ["Pinto beans", "Same amount"]]],
    [/red (split )?lentils/i, [["Yellow split peas", "Cook 10–15 min longer"]]],
    [/puy lentils|green lentils/i, [["Brown lentils", "Same amount, a little softer"]]],
    [/\b(spaghetti|linguine|fusilli|penne|farfalle|conchiglie|macaroni|pasta)\b/i, [["Any pasta shape", "Check the packet time"], ["Gluten-free pasta", "Same amount"]]],
    [/noodles?/i, [["Rice noodles", "Gluten-free; soak or boil as the packet says"], ["Spaghetti", "Works in a pinch"]]],
    [/\bspinach\b/i, [["Kale", "Strip the stalks and cook a few minutes longer"], ["Chard", "Same amount"]]],
    [/\bkale\b/i, [["Spinach", "Add at the very end"], ["Cavolo nero", "Same amount"]]],
    [/sweet potato/i, [["Butternut squash", "Same weight and roasting time"], ["Carrots", "Sweeter, cut a little smaller"]]],
    [/mushrooms?/i, [["Aubergine", "Cube it and cook until soft"], ["Courgette", "Cooks faster"]]],
    [/^shallots?$/i, [["Red onion", "About ½ onion per 2 shallots"]]],
    [/\b(red|brown|yellow|white)? ?onions?\b(?! (marmalade|powder|granules))/i, [["Shallots", "2 shallots per onion, milder"], ["Leek", "Sweeter; wash well"]]],
    [/spring onions?/i, [["Chives", "Snip over at the end"], ["Red onion", "A little, very finely chopped"]]],
    [/lemon juice|^lemons?$/i, [["Lime juice", "Same amount"], ["White wine vinegar", "Use half as much"]]],
    [/lime juice|^limes?$/i, [["Lemon juice", "Same amount"]]],
    [/fresh coriander|^coriander$/i, [["Flat-leaf parsley", "Plus a squeeze of lime"], ["Mint", "Fresher, use a little less"]]],
    [/fresh parsley|^parsley$/i, [["Coriander", "Different flavour, same amount"], ["Basil", "Same amount"]]],
    [/fresh basil|^basil$/i, [["Parsley", "Plus a pinch of dried basil"], ["Rocket", "Peppery, for salads"]]],
    [/stock (paste|cube|powder)|vegetable stock/i, [["Stock powder", "1 tsp per 250 ml water"], ["White miso", "1 tsp stirred into hot water"]]],
    [/\bmiso\b/i, [["Soy sauce", "Plus a pinch of sugar"], ["Tahini", "Nutty rather than salty"]]],
    [/tahini/i, [["Smooth peanut butter", "Same amount"], ["Cashew butter", "Milder"]]],
    [/peanut butter/i, [["Almond or cashew butter", "Same amount"], ["Sunflower seed butter", "Nut-free"]]],
    [/mayonnaise|\bmayo\b/i, [["Vegan mayo", "Same amount"], ["Greek-style yoghurt", "Lighter and tangier"]]],
    [/yog(h)?urt/i, [["Plant-based yoghurt", "Same amount"], ["Soured cream", "Richer"]]],
    [/(almond|soy|oat|plant) milk|^milk$/i, [["Any unsweetened plant milk", "Same amount"]]],
    [/plain flour/i, [["Gluten-free plain flour", "Same amount"]]],
    [/cornflour/i, [["Arrowroot", "Same amount"], ["Plain flour", "Use double, cook a little longer"]]],
    [/panko|breadcrumbs/i, [["Regular breadcrumbs", "Same amount"], ["Crushed crackers", "Extra crunch"]]],
    [/harissa/i, [["Chilli paste", "Plus a pinch of cumin"], ["Sriracha", "Hotter, use less"]]],
    [/smoked paprika/i, [["Paprika", "Plus a pinch of chipotle or a drop of liquid smoke"]]],
    [/chipotle/i, [["Smoked paprika", "Plus a pinch of chilli flakes"]]],
    [/gochujang/i, [["Sriracha", "Plus ½ tsp miso"], ["Chilli paste", "Plus a pinch of sugar"]]],
    [/sriracha|hot sauce/i, [["Any chilli sauce", "To taste"], ["Chilli flakes", "A pinch"]]],
    [/balsamic/i, [["Red wine vinegar", "Plus a pinch of sugar"]]],
    [/rice (wine )?vinegar/i, [["Apple cider vinegar", "Same amount"], ["White wine vinegar", "Same amount"]]],
    [/mirin/i, [["Rice vinegar", "Plus ½ tsp sugar per tbsp"]]],
    [/\b(sherry|white wine|red wine|whisky)\b/i, [["Vegetable stock", "Plus a splash of vinegar, alcohol-free"]]],
    [/egg whites?/i, [["Aquafaba", "3 tbsp chickpea water per egg white"]]],
    [/icing sugar/i, [["Caster sugar", "Blitzed until powdery"]]],
    [/caster sugar/i, [["Granulated sugar", "Blitz briefly for baking"]]],
    [/nutritional yeast/i, [["Grated parmesan", "Not vegan"]]],
    [/olive oil/i, [["Rapeseed oil", "Same amount"]]],
    [/jasmine rice|basmati/i, [["Basmati or jasmine", "Swap freely, check cooking time"], ["Brown rice", "Cook about 15 min longer"]]],
    [/quinoa/i, [["Bulgur wheat", "Same amount"], ["Couscous", "Quicker, just add hot water"]]]
  ];

  function cleanName(text) {
    return String(text || "")
      .replace(/\[[^\]]*\]|\([^)]*\)/g, "")
      .replace(/,.*$/, "")
      .replace(/^of\s+/i, "")
      .replace(/\s+/g, " ").trim();
  }

  /* the word(s) to look for in step text and other recipes */
  const STOP = new Set(["fresh", "dried", "ground", "chopped", "sliced", "diced", "large", "small", "medium", "ripe", "firm", "extra", "virgin", "fine", "freshly", "smooth", "light", "dark", "plain", "unsweetened", "frozen", "cooked", "dry", "tinned", "mixed", "baby", "whole", "of", "a", "and", "or", "the", "for", "to", "taste", "style", "plant", "based"]);
  function keywords(name) {
    const words = name.toLowerCase().replace(/[^a-z\s-]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
    if (!words.length) return [];
    const last = words[words.length - 1].replace(/(oes|s)$/i, m => m === "oes" ? "o" : "");
    const pair = words.length >= 2 ? words.slice(-2).join(" ").replace(/(oes|s)$/i, m => m === "oes" ? "o" : "") : "";
    /* "coconut milk" must not match every "milk"; "firm tofu" can match any "tofu" */
    const GENERIC = /^(milk|oil|sauce|paste|juice|powder|stock|vinegar|cream|cheese|butter|flour|sugar|seed|bean|rice|noodle|pasta|syrup|leave|extract|water|wine|chip|flake|cube|mix|purée|puree)$/;
    if (pair && GENERIC.test(last)) return [pair];
    return [pair, last].filter(Boolean);
  }

  function swapsFor(name) {
    for (const [re, list] of SWAPS) if (re.test(name)) return list;
    return [];
  }

  /* which steps use ingredient gi-ii */
  function stepsFor(gi, ii) {
    const key = `${gi}-${ii}`;
    const groups = host.ingredientGroups();
    const groupName = (groups[gi] && groups[gi].name || "").toLowerCase();
    const name = cleanName(groups[gi].items[ii].text);
    const kw = keywords(name);
    const out = [];
    const explicitAny = host.steps().some(s => (s.ingredientKeys || []).length || (s.ingredientGroupNames || []).length);
    host.steps().forEach((s, i) => {
      const keys = (s.ingredientKeys || []).map(String);
      const names = (s.ingredientGroupNames || []).map(n => String(n).toLowerCase());
      let hit = keys.includes(key) || (groupName && names.includes(groupName));
      if (!hit && !explicitAny) {
        const hay = `${s.title} ${s.desc}`.toLowerCase();
        hit = kw.some(k => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(hay));
      }
      if (hit) out.push({ i, step: s });
    });
    /* explicit data can miss things; fall back to the words if nothing matched */
    if (!out.length && explicitAny) {
      host.steps().forEach((s, i) => {
        const hay = `${s.title} ${s.desc}`.toLowerCase();
        if (kw.some(k => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(hay))) out.push({ i, step: s, guessed: true });
      });
    }
    return out;
  }

  function sentenceWith(text, kw) {
    const sentences = String(text || "").split(/(?<=[.!?])\s+/);
    const hit = sentences.find(sn => kw.some(k => sn.toLowerCase().includes(k)));
    return (hit || sentences[0] || "").trim();
  }

  function alsoIn(name) {
    const me = host.recipe();
    const kw = keywords(name);
    if (!kw.length) return [];
    const re = new RegExp(`\\b(${kw.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "i");
    return (host.allRecipes() || [])
      .filter(r => r && r.slug !== me.slug && r.status !== "draft")
      .filter(r => (r.ingredientGroups || []).some(g => (g.items || []).some(i => re.test(cleanName(i.text)))))
      .sort((a, b) => (a.time || 0) - (b.time || 0));
  }

  function guideFor(name) {
    const n = name.toLowerCase();
    return (host.techniques() || []).find(t => (t.relatedIngredientKeywords || []).some(k => new RegExp(`\\b${k}\\b(?![-\\s]?(free|less)\\b)`, "i").test(n)));
  }

  function photo(u, w) {
    if (!u) return "";
    return /unsplash\.com/.test(u) ? `${u}${u.includes("?") ? "&" : "?"}auto=format&fit=crop&w=${w}&q=65` : u;
  }

  /* ---------- panel ---------- */
  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement("aside");
    panel.className = "lens";
    panel.id = "ingredientLens";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "lensTitle");
    panel.hidden = true;
    document.body.appendChild(panel);
    panel.addEventListener("click", onPanelClick);
    return panel;
  }

  function open(gi, ii, trigger) {
    const groups = host.ingredientGroups();
    const item = groups[gi] && groups[gi].items[ii];
    if (!item) return;
    current = { gi, ii };
    lastTrigger = trigger || null;
    const name = cleanName(item.text) || item.text;
    const note = (String(item.text).match(/,\s*(.+)$/) || [])[1] || (String(item.text).match(/\(([^)]+)\)/) || [])[1] || "";
    const scaled = (item.amount || 0) * host.factor();
    const amount = scaled > 0 ? `${host.formatAmount(scaled)}${item.unit ? " " + item.unit : ""}` : "";
    const steps = stepsFor(gi, ii);
    const kw = keywords(name);
    const swaps = swapsFor(name);
    const others = alsoIn(name);
    const guide = guideFor(name);
    const got = host.isChecked(`${gi}-${ii}`);

    const p = ensurePanel();
    p.innerHTML = `
      <div class="lens-head">
        <div>
          <span class="lens-eyebrow">${esc(groups[gi].name || "Ingredient")}</span>
          <h3 id="lensTitle">${amount ? `<span class="lens-amount">${esc(amount)}</span> ` : ""}${esc(name)}</h3>
          ${note ? `<p class="lens-note">${esc(note)}</p>` : ""}
        </div>
        <button type="button" class="lens-close" data-lens-close aria-label="Close">×</button>
      </div>

      <section class="lens-sec">
        <h4>When you'll use it</h4>
        ${steps.length ? `<ol class="lens-steps">${steps.map(({ i, step, guessed }) => `
          <li><button type="button" data-goto="${i}">
            <span class="lens-step-n">${i + 1}</span>
            <span><strong>${esc(step.title || "Step " + (i + 1))}</strong><small>${esc(sentenceWith(step.desc, kw)).slice(0, 140)}</small></span>
          </button></li>`).join("")}</ol>`
          : `<p class="lens-empty">Used to finish or serve the dish.</p>`}
      </section>

      ${swaps.length ? `
      <section class="lens-sec">
        <h4>Haven't got it? Swap it</h4>
        <ul class="lens-swaps">${swaps.map(([s, why]) => `<li><strong>${esc(s)}</strong><span>${esc(why)}</span></li>`).join("")}</ul>
      </section>` : ""}

      ${others.length ? `
      <section class="lens-sec">
        <h4>Use up the rest</h4>
        <p class="lens-sub">${others.length} other recipe${others.length === 1 ? " uses" : "s use"} ${esc(name.toLowerCase())}</p>
        <div class="lens-others">${others.slice(0, 3).map(r => `
          <a href="recipe.html?slug=${encodeURIComponent(r.slug)}">
            <span class="lens-thumb" style="${r.photo ? `background-image:url(${esc(photo(r.photo, 160))})` : ""}" aria-hidden="true"></span>
            <span><strong>${esc(r.title.replace(/\s*\(changes needed\)\s*$/i, ""))}</strong><small>${r.time ? r.time + " min" : ""}</small></span>
          </a>`).join("")}</div>
      </section>` : ""}

      ${guide ? `
      <a class="lens-guide" href="technique.html?slug=${encodeURIComponent(guide.slug)}">
        <span aria-hidden="true">${esc(guide.icon || "🎓")}</span>
        <span><small>Cookery School</small><strong>${esc(guide.title)}</strong></span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </a>` : ""}

      <div class="lens-actions">
        <button type="button" class="lens-btn" data-shop>+ Shopping list</button>
        <button type="button" class="lens-btn lens-btn--primary${got ? " is-on" : ""}" data-got aria-pressed="${got}">${got ? "✓ Got it" : "I've got it"}</button>
      </div>`;

    /* light up the steps that use it */
    document.querySelectorAll(".r-step.is-lens").forEach(el => el.classList.remove("is-lens"));
    steps.forEach(({ i }) => { const el = document.querySelector(`.r-step[data-step="${i}"]`); if (el) el.classList.add("is-lens"); });
    document.querySelectorAll(".r-ingredient.is-lensed").forEach(el => el.classList.remove("is-lensed"));
    const row = document.querySelector(`.r-ingredient[data-key="${gi}-${ii}"]`);
    if (row) row.classList.add("is-lensed");

    p.hidden = false;
    requestAnimationFrame(() => p.classList.add("open"));
    const close = p.querySelector("[data-lens-close]");
    if (close) close.focus({ preventScroll: true });
  }

  function close() {
    if (!panel || panel.hidden) return;
    panel.classList.remove("open");
    setTimeout(() => { if (!panel.classList.contains("open")) panel.hidden = true; }, 220);
    document.querySelectorAll(".r-step.is-lens").forEach(el => el.classList.remove("is-lens"));
    document.querySelectorAll(".r-ingredient.is-lensed").forEach(el => el.classList.remove("is-lensed"));
    current = null;
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
  }

  function onPanelClick(e) {
    if (e.target.closest("[data-lens-close]")) { close(); return; }
    const go = e.target.closest("[data-goto]");
    if (go) {
      const el = document.querySelector(`.r-step[data-step="${go.dataset.goto}"]`);
      if (el) {
        el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
        el.classList.remove("lens-flash"); void el.offsetWidth; el.classList.add("lens-flash");
      }
      if (matchMedia("(max-width: 760px)").matches) close();
      return;
    }
    if (e.target.closest("[data-shop]") && current) {
      const groups = host.ingredientGroups();
      const item = groups[current.gi].items[current.ii];
      const scaled = (item.amount || 0) * host.factor();
      const label = `${cleanName(item.text)}${scaled > 0 ? ` (${host.formatAmount(scaled)}${item.unit ? " " + item.unit : ""})` : ""}`;
      let list = [];
      try { list = JSON.parse(localStorage.getItem(EXTRA_KEY) || "[]"); } catch (err) {}
      if (!list.includes(label)) list.push(label);
      try { localStorage.setItem(EXTRA_KEY, JSON.stringify(list.slice(0, 40))); } catch (err) {}
      host.toast(`Added ${cleanName(item.text).toLowerCase()} to your shopping list`);
      return;
    }
    const got = e.target.closest("[data-got]");
    if (got && current) {
      host.toggleChecked(`${current.gi}-${current.ii}`);
      const on = host.isChecked(`${current.gi}-${current.ii}`);
      got.classList.toggle("is-on", on);
      got.setAttribute("aria-pressed", on);
      got.textContent = on ? "✓ Got it" : "I've got it";
    }
  }

  function mount(h) {
    host = h;
    document.addEventListener("click", e => {
      const b = e.target.closest("[data-lens]");
      if (b) {
        e.preventDefault(); e.stopPropagation();
        const [gi, ii] = b.dataset.lens.split("-").map(Number);
        if (current && current.gi === gi && current.ii === ii) { close(); return; }
        open(gi, ii, b);
        return;
      }
      if (panel && !panel.hidden && !panel.contains(e.target) && !e.target.closest(".r-ingredients, .r-ingredient, .toast")) close();
    }, true);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && current) close(); });
  }

  /* re-render after servings change: keep the panel's amount right */
  function refresh() { if (current) open(current.gi, current.ii, lastTrigger); }

  window.RecipyLens = { mount, refresh, close, _swapsFor: swapsFor, _keywords: keywords };
})();
