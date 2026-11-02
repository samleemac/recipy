/* ============================================================
   Recipy — "What's for dinner tonight?" hero
   The first viewport answers the visitor's real question:
   pick how long you've got and what you fancy, and three
   recipes deal themselves out, each one tap from the
   dinner planner.
   ============================================================ */
(function () {
  const STORE_KEY = "recipy-tonight-v1";

  const TIMES = [
    { id: "20", label: "20 min", max: 20 },
    { id: "30", label: "30 min", max: 30 },
    { id: "45", label: "45 min", max: 45 },
    { id: "any", label: "No rush", max: Infinity }
  ];

  const MOODS = [
    { id: "comfort", label: "Something comforting", short: "Comforting", emoji: "🍲", tags: ["Comfort", "Curry", "Pasta"] },
    { id: "light", label: "Light & fresh", short: "Light & fresh", emoji: "🥗", tags: ["Light", "Mediterranean"] },
    { id: "spicy", label: "A bit of heat", short: "Spicy", emoji: "🌶️", tags: ["Spicy", "Curry"] },
    { id: "protein", label: "High protein", short: "High protein", emoji: "💪", tags: ["Protein"] },
    { id: "breakfast", label: "Brunch vibes", short: "Brunch", emoji: "🥞", tags: ["Breakfast"] },
    { id: "any", label: "Surprise me", short: "Surprise me", emoji: "🎲", tags: [] }
  ];

  const DIFF = { 1: "Easy", 2: "Intermediate", 3: "Advanced" };

  let root, opts;
  let state = { time: null, mood: null, shuffle: 0 };

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function meal() {
    const h = new Date().getHours();
    if (h < 11) return { word: "breakfast", when: "this morning", mood: "breakfast" };
    if (h < 15) return { word: "lunch", when: "today", mood: "light" };
    return { word: "dinner", when: "tonight", mood: "comfort" };
  }

  function defaults() {
    const d = new Date().getDay();
    const weekend = d === 0 || d === 6;
    return { time: weekend ? "45" : "30", mood: meal().mood };
  }

  function load() {
    const def = defaults();
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (saved && TIMES.some(t => t.id === saved.time) && MOODS.some(m => m.id === saved.mood)) {
        /* keep the time preference; mood follows the time of day unless it was set today */
        const today = new Date().toDateString();
        return { time: saved.time, mood: saved.day === today ? saved.mood : def.mood, shuffle: 0 };
      }
    } catch (e) {}
    return { time: def.time, mood: def.mood, shuffle: 0 };
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ time: state.time, mood: state.mood, day: new Date().toDateString() })); } catch (e) {}
  }

  /* small seeded PRNG so picks are stable for a given day + choice, but shuffle on demand */
  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

  function pick() {
    const all = (opts.getRecipes() || []).map((r, idx) => ({ r, idx })).filter(e => e.r && e.r.title);
    const t = TIMES.find(x => x.id === state.time) || TIMES[1];
    const m = MOODS.find(x => x.id === state.mood) || MOODS[MOODS.length - 1];
    const fitsTime = e => (e.r.time || 0) <= t.max;
    const fitsMood = e => !m.tags.length || (e.r.tags || []).some(tag => m.tags.includes(tag));

    const perfect = all.filter(e => fitsTime(e) && fitsMood(e));
    const rand = rng(hash(new Date().toDateString() + state.time + state.mood + state.shuffle));
    const shuffled = arr => arr.map(e => [rand(), e]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
    /* photos first: the hero is a visual moment */
    const withPhoto = arr => arr.filter(e => e.r.photo).concat(arr.filter(e => !e.r.photo));

    let out = withPhoto(shuffled(perfect));
    const seen = new Set(out.map(e => e.idx));
    /* Always deal three. Keep the mood and allow a bit longer first (spicy in 25 min beats
       pancakes in 15), then fall back to anything that fits the time. */
    if (out.length < 3) {
      const moodLonger = all.filter(e => fitsMood(e) && !seen.has(e.idx)).sort((a, b) => (a.r.time || 0) - (b.r.time || 0));
      moodLonger.forEach(e => { if (out.length < 3) { out.push(Object.assign({ near: "time" }, e)); seen.add(e.idx); } });
    }
    if (out.length < 3) {
      const timeOnly = shuffled(all.filter(e => fitsTime(e) && !seen.has(e.idx)));
      timeOnly.forEach(e => { if (out.length < 3) { out.push(Object.assign({ near: "mood" }, e)); seen.add(e.idx); } });
    }
    return { cards: out.slice(0, 3), matches: perfect.length, time: t, mood: m };
  }

  function photo(r, w) {
    const u = r.photo || "";
    if (!u) return opts.fallbackPhoto || "";
    return /unsplash\.com/.test(u) ? `${u}${u.includes("?") ? "&" : "?"}auto=format&fit=crop&w=${w}&q=74` : u;
  }

  function cardHtml(e, i) {
    const r = e.r;
    const href = opts.recipeHref(r, e.idx);
    const meta = [r.time ? `${r.time} min` : "", DIFF[r.difficulty] || ""].filter(Boolean).join(" · ");
    const note = e.near === "mood" ? "Close match" : e.near === "time" ? "A little longer" : "";
    if (i === 0) {
      return `
        <article class="tn-card tn-card--feature">
          <a class="tn-card-img" href="${href}" tabindex="-1" aria-hidden="true">
            <img src="${esc(photo(r, 900))}" alt="" loading="eager" onerror="this.onerror=null;this.src='${esc(opts.fallbackPhoto || "")}'">
            ${note ? `<span class="tn-note">${note}</span>` : `<span class="tn-note is-top">Top pick</span>`}
          </a>
          <div class="tn-card-body">
            <h3><a href="${href}">${esc(r.title)}</a></h3>
            <p class="tn-meta">${esc(meta)}${r.author ? ` · ${esc(r.author)}` : ""}</p>
            <a class="tn-cook" href="${href}#timing">${meal().word === "dinner" ? "Cook it tonight" : "Cook this"}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        </article>`;
    }
    return `
      <a class="tn-card tn-card--mini" href="${href}#timing">
        <img src="${esc(photo(r, 240))}" alt="" loading="eager" onerror="this.onerror=null;this.src='${esc(opts.fallbackPhoto || "")}'">
        <span class="tn-mini-text">
          <strong>${esc(r.title)}</strong>
          <span class="tn-meta">${esc(meta)}${note ? ` · ${note}` : ""}</span>
        </span>
        <svg class="tn-mini-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </a>`;
  }

  function renderPicks(animate) {
    const res = pick();
    const stack = root.querySelector("[data-stack]");
    stack.classList.toggle("is-dealing", !!animate);
    stack.innerHTML = res.cards.length
      ? res.cards.map(cardHtml).join("")
      : `<p class="tn-empty">Recipes are loading…</p>`;
    if (animate) { void stack.offsetWidth; stack.classList.remove("is-dealing"); }

    const count = root.querySelector("[data-count]");
    if (count) {
      count.textContent = res.matches > 3
        ? `${res.matches} recipes fit · showing 3`
        : res.matches === 0 ? "Nothing fits exactly, so here are the nearest" : `${res.matches} recipe${res.matches === 1 ? "" : "s"} fit`;
    }
  }

  function chips(group, list, current) {
    return list.map(o => `<button type="button" class="tn-chip${o.id === current ? " is-on" : ""}" aria-pressed="${o.id === current}" data-${group}="${o.id}">${o.emoji ? `<span aria-hidden="true">${o.emoji}</span>` : ""}${esc(o.short || o.label)}</button>`).join("");
  }

  function render() {
    const ml = meal();
    const n = (opts.getRecipes() || []).length;
    root.innerHTML = `
      <div class="tn-left">
        <div class="hero-meta" id="heroMeta">${esc(opts.metaText || "")}</div>
        <h1 class="hero-title tn-title">What's for ${ml.word}<br><em>${ml.when}?</em></h1>
        <div class="tn-builder" role="group" aria-label="Find a recipe for ${ml.when}">
          <div class="tn-row">
            <span class="tn-label" id="tnTimeLabel">I've got</span>
            <div class="tn-chips" role="group" aria-labelledby="tnTimeLabel">${chips("time", TIMES, state.time)}</div>
          </div>
          <div class="tn-row">
            <span class="tn-label" id="tnMoodLabel">and I fancy</span>
            <div class="tn-chips" role="group" aria-labelledby="tnMoodLabel">${chips("mood", MOODS, state.mood)}</div>
          </div>
        </div>
        <p class="tn-alt">
          <a href="#fridge" data-jump="fridge">🧺 Or start from what's in your fridge</a>
          ${n ? `<span class="tn-trust">${n} recipes from real home kitchens</span>` : ""}
        </p>
      </div>
      <div class="tn-right">
        <div class="tn-right-head">
          <span class="tn-right-title">Your ${ml.word} shortlist</span>
          <button type="button" class="tn-shuffle" data-shuffle>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
            Shuffle
          </button>
        </div>
        <div class="tn-stack" data-stack aria-live="polite"></div>
        <p class="tn-count" data-count></p>
      </div>`;
    renderPicks(false);
  }

  function setChip(group, id) {
    state[group] = id;
    state.shuffle = 0;
    save();
    root.querySelectorAll(`[data-${group}]`).forEach(b => {
      const on = b.getAttribute(`data-${group}`) === id;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on);
    });
    renderPicks(true);
  }

  function bind() {
    root.addEventListener("click", e => {
      const t = e.target.closest("[data-time]");
      if (t) { setChip("time", t.dataset.time); return; }
      const m = e.target.closest("[data-mood]");
      if (m) { setChip("mood", m.dataset.mood); return; }
      if (e.target.closest("[data-shuffle]")) { state.shuffle++; renderPicks(true); return; }
      const j = e.target.closest("[data-jump]");
      if (j) {
        const target = document.getElementById(j.dataset.jump);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
          const input = target.querySelector("input");
          if (input) setTimeout(() => input.focus({ preventScroll: true }), 500);
        }
      }
    });
  }

  function mount(el, options) {
    root = el; opts = options;
    state = load();
    render();
    bind();
  }

  function refresh() { if (root) render(); }

  window.RecipyTonight = { mount, refresh };
})();
