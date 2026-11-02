/* ============================================================
   Recipy — "What's in your kitchen?"
   Matches the ingredients a visitor already has against each
   recipe's key ingredients, so the grid can answer the real
   question: "what can I cook tonight with what I've got?"

   Pantry staples (oil, salt, pepper, stock, spices, sugar, flour…)
   are assumed and never counted as missing.
   ============================================================ */
(function () {
  const STORE_KEY = "recipy-fridge-v1";

  /* label, emoji, pattern matched against an ingredient name (lower-case,
     descriptors after the first comma removed). Order = display order. */
  const VOCAB = [
    ["Onion",        "🧅", /\b(?<!spring )(red |brown |white )?onions?\b(?! (marmalade|powder|granules))|\bshallots?\b/],
    ["Garlic",       "🧄", /\bgarlic\b(?! powder)/],
    ["Tomatoes",     "🍅", /\btomato(es)?\b(?! (puree|purée|paste|ketchup))|\bpassata\b/],
    ["Mushrooms",    "🍄", /\bmushrooms?\b/],
    ["Spinach",      "🥬", /\bspinach\b/],
    ["Kale",         "🥬", /\bkale\b/],
    ["Broccoli",     "🥦", /\bbroccoli\b/],
    ["Cauliflower",  "🥦", /\bcauliflower\b/],
    ["Carrots",      "🥕", /\bcarrots?\b/],
    ["Potatoes",     "🥔", /\b(?<!sweet )potato(es)?\b/],
    ["Sweet potato", "🍠", /\bsweet potato(es)?\b/],
    ["Peppers",      "🫑", /\b(bell|red|green|yellow|romano) peppers?\b|\bpeppers\b/],
    ["Courgette",    "🥒", /\bcourgettes?\b|\bzucchini\b/],
    ["Aubergine",    "🍆", /\baubergines?\b|\beggplant\b/],
    ["Peas",         "🫛", /\bpeas\b/],
    ["Spring onions","🧅", /\bspring onions?\b|\bscallions?\b/],
    ["Cucumber",     "🥒", /\bcucumbers?\b/],
    ["Avocado",      "🥑", /\bavocados?\b/],
    ["Lettuce",      "🥗", /\blettuce\b|\brocket\b|\bsalad leaves\b|\bbaby leaf\b/],
    ["Cabbage",      "🥬", /\bcabbage\b/],
    ["Parsnip",      "🥕", /\bparsnips?\b/],
    ["Asparagus",    "🌱", /\basparagus\b/],
    ["Fresh chilli", "🌶️", /\b(red|green|fresh|mild|bird'?s eye) chill(i|ies)\b/],
    ["Fresh ginger", "🫚", /\b(fresh )?ginger\b(?! (powder|paste))(?<!ground ginger)(?<!pickled ginger)/],
    ["Lemon",        "🍋", /\blemons?\b/],
    ["Lime",         "🍋", /\blimes?\b/],
    ["Tofu",         "🧈", /\btofu\b/],
    ["Tempeh",       "🫘", /\btempeh\b/],
    ["Chickpeas",    "🫘", /\bchickpeas?\b/],
    ["Lentils",      "🫘", /\blentils?\b/],
    ["Beans",        "🫘", /\b(kidney|black|butter|cannellini|mixed|pinto|borlotti|baked|refried) beans\b/],
    ["Edamame",      "🫛", /\bedamame\b/],
    ["Eggs",         "🥚", /\beggs?\b(?!-free)/],
    ["Halloumi",     "🧀", /\bhalloumi\b/],
    ["Feta",         "🧀", /\bfeta\b|\bsalad cheese\b/],
    ["Cheddar",      "🧀", /\bcheddar\b/],
    ["Parmesan",     "🧀", /\bparmesan\b|\bhard cheese\b/],
    ["Cream",        "🥛", /\b(single|double|cooking|oatly|soya|oat) cream\b|\bcrème fraîche\b|\bcreme fraiche\b/],
    ["Yoghurt",      "🥛", /\byog(h)?urt\b/],
    ["Coconut milk", "🥥", /\bcoconut (milk|cream)\b/],
    ["Rice",         "🍚", /\brice\b(?! (vinegar|wine|noodles|paper))/],
    ["Pasta",        "🍝", /\bpasta\b|\blinguine\b|\bspaghetti\b|\bpenne\b|\bfusilli\b|\bmacaroni\b|\btagliatelle\b|\brigatoni\b|\borzo\b/],
    ["Noodles",      "🍜", /\bnoodles?\b/],
    ["Bread & wraps","🥖", /\bbread\b|\bciabatta\b|\bwraps?\b|\btortillas?\b|\bpittas?\b|\bnaan\b|\bbuns?\b/],
    ["Oats",         "🌾", /\boats\b/],
    ["Quinoa",       "🌾", /\bquinoa\b/],
    ["Bulgur & couscous","🌾", /\bbulgur\b|\bcouscous\b/],
    ["Peanut butter","🥜", /\bpeanut butter\b/],
    ["Nuts",         "🥜", /\b(cashew|salted |roasted )?(nuts|peanuts|almonds|cashews|walnuts|pecans)\b|\balmond flakes\b|\bflaked almonds\b/],
    ["Miso",         "🥣", /\bmiso\b/],
    ["Apples",       "🍎", /\bapples?\b/],
    ["Bananas",      "🍌", /\bbananas?\b/],
    ["Berries",      "🫐", /\bblueberr(y|ies)\b|\braspberr(y|ies)\b|\bstrawberr(y|ies)\b|\bdiepvriesbosbessen\b/],
    ["Mango",        "🥭", /\bmangoe?s?\b/],
    ["Watermelon",   "🍉", /\bwatermelon\b/],
    ["Olives",       "🫒", /\bolives\b/]
  ];

  const byLabel = new Map(VOCAB.map(v => [v[0].toLowerCase(), v]));

  function cleanName(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/\(.*?\)/g, " ")
      .replace(/,.*$/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function ingredientNames(recipe) {
    const out = [];
    (recipe.ingredientGroups || []).forEach(g => (g.items || []).forEach(i => out.push(cleanName(i.text))));
    return out;
  }

  /* Cache per recipe object */
  const keyCache = new WeakMap();
  function keysFor(recipe) {
    if (keyCache.has(recipe)) return keyCache.get(recipe);
    const names = ingredientNames(recipe);
    const keys = [];
    VOCAB.forEach(([label, , re]) => {
      if (names.some(n => re.test(n))) keys.push(label);
    });
    keyCache.set(recipe, keys);
    return keys;
  }

  /* Free-typed items that aren't in the vocabulary still count when a
     recipe lists them by name ("tahini", "sumac"). */
  function customHit(recipe, term) {
    const re = new RegExp("\\b" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/s$/, "") + "s?\\b");
    return ingredientNames(recipe).some(n => re.test(n));
  }

  /* ---------- state ---------- */
  let have = new Set();
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    if (Array.isArray(raw)) have = new Set(raw.filter(x => typeof x === "string").slice(0, 40));
  } catch (e) { /* storage unavailable: start empty */ }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify([...have])); } catch (e) {}
  }

  function canonical(term) {
    const t = term.trim().toLowerCase();
    if (!t) return null;
    if (byLabel.has(t)) return byLabel.get(t)[0];
    /* "onions" → Onion, "tomato" → Tomatoes, "eggs" → Eggs */
    for (const [label, , re] of VOCAB) {
      if (re.test(t)) return label;
    }
    return t.length > 1 ? t.charAt(0).toUpperCase() + t.slice(1) : null;
  }

  /* score: { have: [...], need: [...], total, ratio } */
  function score(recipe) {
    const keys = keysFor(recipe);
    const haveList = [], needList = [];
    keys.forEach(k => (have.has(k) ? haveList : needList).push(k));
    /* custom (non-vocab) terms */
    [...have].forEach(t => {
      if (byLabel.has(t.toLowerCase())) return;
      if (customHit(recipe, t.toLowerCase())) haveList.push(t);
    });
    const total = haveList.length + needList.length;
    return { have: haveList, need: needList, total, ratio: total ? haveList.length / total : 0 };
  }

  function isActive() { return have.size > 0; }

  /* Filter + rank an array of { recipe, idx }; keeps only recipes that use
     at least one thing you have. Best matches first: fewest missing, then
     most matched, then quickest. */
  function rank(list) {
    if (!isActive()) return list;
    return list
      .map(entry => Object.assign({}, entry, { fridge: score(entry.recipe) }))
      .filter(e => e.fridge.have.length > 0)
      .sort((a, b) =>
        (a.fridge.need.length - b.fridge.need.length) ||
        (b.fridge.have.length - a.fridge.have.length) ||
        ((a.recipe.time || 0) - (b.recipe.time || 0)));
  }

  /* Card footer markup for a given recipe (empty string when inactive) */
  function cardBadge(recipe) {
    if (!isActive()) return "";
    const s = score(recipe);
    if (!s.have.length) return "";
    const esc = v => String(v).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const ready = s.need.length === 0;
    const needText = ready
      ? "You've got everything"
      : "Need " + s.need.slice(0, 3).map(n => n.toLowerCase()).join(", ") + (s.need.length > 3 ? " +" + (s.need.length - 3) : "");
    return `<div class="fridge-badge${ready ? " is-ready" : ""}" aria-label="You have ${s.have.length} of ${s.total} key ingredients. ${esc(needText)}">
      <span class="fridge-badge__meter" style="--fill:${Math.round(s.ratio * 100)}%"><b>${s.have.length}/${s.total}</b></span>
      <span class="fridge-badge__text">${esc(needText)}</span>
    </div>`;
  }

  /* Most-used key ingredients across the library, for the quick-pick chips */
  function popular(recipes, n) {
    const counts = new Map();
    recipes.forEach(r => keysFor(r).forEach(k => counts.set(k, (counts.get(k) || 0) + 1)));
    return [...counts.entries()]
      .filter(([k]) => k !== "Garlic" && k !== "Onion") /* everyone has these: shown first anyway */
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k]) => k);
  }

  function emojiFor(label) {
    const v = byLabel.get(label.toLowerCase());
    return v ? v[1] : "🧺";
  }

  /* ---------- UI ---------- */
  let root, onChange, getRecipes;

  function summary() {
    const list = getRecipes();
    let ready = 0, close = 0, any = 0;
    list.forEach(r => {
      const s = score(r);
      if (!s.have.length) return;
      any++;
      if (s.need.length === 0) ready++;
      else if (s.need.length <= 2) close++;
    });
    return { ready, close, any };
  }

  function render() {
    if (!root) return;
    const recipes = getRecipes();
    const picks = ["Onion", "Garlic"].concat(popular(recipes, 14));
    const extras = [...have].filter(h => !picks.includes(h));
    const chips = picks.concat(extras);
    const s = summary();

    let headline;
    if (!isActive()) headline = `<strong>Tap what you've got.</strong> We'll show you what you can cook tonight.`;
    else if (s.ready) headline = `<strong>You can cook ${s.ready} recipe${s.ready === 1 ? "" : "s"} right now</strong>${s.close ? ` · ${s.close} more need just 1–2 things` : ""}`;
    else if (s.close) headline = `<strong>${s.close} recipe${s.close === 1 ? "" : "s"} need just 1–2 more things</strong>`;
    else if (s.any) headline = `<strong>${s.any} recipe${s.any === 1 ? "" : "s"} use what you've got</strong> · add a few more to narrow it down`;
    else headline = `<strong>Nothing matches yet.</strong> Try adding a few more ingredients.`;

    const esc = v => String(v).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    root.innerHTML = `
      <div class="fridge__inner">
        <div class="fridge__intro">
          <p class="fridge__eyebrow"><span aria-hidden="true">🧺</span> Cook from your kitchen</p>
          <h2 class="fridge__title">What have you got in?</h2>
          <p class="fridge__summary" aria-live="polite">${headline}</p>
        </div>
        <div class="fridge__picker">
          <form class="fridge__add" autocomplete="off">
            <label class="sr-only" for="fridgeInput">Add an ingredient you have</label>
            <input id="fridgeInput" type="text" list="fridgeVocab" placeholder="Add anything… e.g. tahini, leeks" maxlength="30" />
            <datalist id="fridgeVocab">${VOCAB.map(v => `<option value="${esc(v[0])}">`).join("")}</datalist>
            <button type="submit">Add</button>
          </form>
          <div class="fridge__chips" role="group" aria-label="Ingredients you have">
            ${chips.map(label => {
              const on = have.has(label);
              return `<button type="button" class="fridge__chip${on ? " is-on" : ""}" aria-pressed="${on}" data-ing="${esc(label)}"><span aria-hidden="true">${emojiFor(label)}</span>${esc(label)}</button>`;
            }).join("")}
            ${isActive() ? `<button type="button" class="fridge__clear" data-clear>Clear all</button>` : ""}
          </div>
        </div>
      </div>`;
  }

  function changed() {
    save();
    const focusKey = document.activeElement && root.contains(document.activeElement)
      ? (document.activeElement.getAttribute("data-ing") || (document.activeElement.id === "fridgeInput" ? "#input" : null))
      : null;
    render();
    if (focusKey) {
      const el = focusKey === "#input" ? root.querySelector("#fridgeInput")
        : root.querySelector(`[data-ing="${CSS.escape(focusKey)}"]`);
      if (el) el.focus();
    }
    onChange && onChange();
  }

  function mount(el, opts) {
    root = el;
    onChange = opts.onChange;
    getRecipes = opts.getRecipes;
    render();

    root.addEventListener("click", e => {
      const chip = e.target.closest("[data-ing]");
      if (chip) {
        const k = chip.getAttribute("data-ing");
        if (have.has(k)) have.delete(k); else have.add(k);
        changed();
        return;
      }
      if (e.target.closest("[data-clear]")) {
        have.clear();
        changed();
      }
    });

    root.addEventListener("submit", e => {
      e.preventDefault();
      const input = root.querySelector("#fridgeInput");
      const parts = (input.value || "").split(/,| and /);
      let added = false;
      parts.forEach(p => {
        const c = canonical(p);
        if (c && have.size < 40) { have.add(c); added = true; }
      });
      input.value = "";
      if (added) changed();
    });
  }

  window.RecipyFridge = { mount, rank, cardBadge, isActive, score, keysFor, refresh: render };
})();
