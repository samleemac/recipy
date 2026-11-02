/* ============================================================
   Recipy — Cookery School "studio" on the homepage
   Turns the "Master the basics" links into a 60-second lesson:
   pick an ingredient → pick a method → slide through the
   doneness stages (time + what it looks like) → start a timer
   right here. Then jump to the full guide or a recipe that
   uses the ingredient.
   ============================================================ */
(function () {
  const STORE_KEY = "recipy-studio-v1";
  let root, opts, guides = [];
  let sel = { g: 0, m: 0, d: 0 };
  let timer = null; // { total, left, running, endsAt, raf }

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* "6 min" → 360, "8–9 min" → 480 (check at the start of the range), "+30 sec flipped" → 30,
     "1½–2 hrs" → 5400, "2–3 min per side" → 120. Returns 0 when it isn't a simple timer. */
  function seconds(text) {
    const t = String(text || "").toLowerCase().replace(/½/g, ".5").replace(/¼/g, ".25").replace(/¾/g, ".75");
    if (/overnight|ready now|straight after|at \d+\s*°/.test(t)) return 0;
    const m = t.match(/(\d+(?:\.\d+)?)\+?\s*(?:[–-]\s*\d+(?:\.\d+)?\s*)?(hrs?|hours?|min(?:ute)?s?|sec(?:ond)?s?)\b/);
    if (!m) return 0;
    const n = parseFloat(m[1]);
    const unit = m[2];
    const s = unit.startsWith("h") ? n * 3600 : unit.startsWith("s") ? n : n * 60;
    return s >= 10 && s <= 4 * 3600 ? Math.round(s) : 0;
  }

  function clock(s) {
    s = Math.max(0, Math.ceil(s));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(sec).padStart(2, "0");
  }

  function short(title) {
    return String(title || "").replace(/^how to (cook|make)\s+/i, "").replace(/^\w/, c => c.toUpperCase());
  }

  /* Recipes that use this ingredient, quickest first */
  function relatedRecipes(guide) {
    const keys = (guide.relatedIngredientKeywords || []).map(k => k.toLowerCase());
    if (!keys.length) return [];
    const re = new RegExp("\\b(" + keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\b(?![-\\s]?(free|less)\\b)", "i");
    return (opts.getRecipes() || [])
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => (r.ingredientGroups || []).some(g => (g.items || []).some(i => re.test(i.text || ""))))
      .sort((a, b) => (a.r.time || 0) - (b.r.time || 0));
  }

  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify({ slug: guides[sel.g] && guides[sel.g].slug })); } catch (e) {} }
  function restore() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      const i = s ? guides.findIndex(g => g.slug === s.slug) : -1;
      if (i >= 0) sel.g = i;
    } catch (e) {}
  }

  /* ---------- render ---------- */
  function render() {
    const g = guides[sel.g];
    if (!g) return;
    const methods = g.methods || [];
    const m = methods[sel.m] || methods[0] || {};
    const stages = m.doneness || [];
    const d = stages[sel.d] || stages[0];
    const secs = d ? seconds(d.time) : 0;
    const related = relatedRecipes(g);
    const pct = stages.length > 1 ? (sel.d / (stages.length - 1)) * 100 : 50;
    const guideHref = `technique.html?slug=${encodeURIComponent(g.slug)}`;

    root.innerHTML = `
      <div class="st-intro">
        <span class="basics-tag st-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
          Cookery School
        </span>
        <h2>Master the basics</h2>
        <p>Pick an ingredient and a method. We'll show you exactly what "done" looks like, and time it for you.</p>
        <div class="st-guides" role="tablist" aria-label="Ingredient">
          ${guides.map((x, i) => `
            <button type="button" role="tab" class="st-guide${i === sel.g ? " is-on" : ""}" aria-selected="${i === sel.g}" data-g="${i}">
              <span class="st-emoji" aria-hidden="true">${esc(x.icon || "🍽️")}</span>
              <span class="st-guide-text"><strong>${esc(short(x.title))}</strong><small>${(x.methods || []).length} methods · ${esc(x.skillLevel || "Beginner")}</small></span>
            </button>`).join("")}
        </div>
        <a class="basics-all st-all" href="learn.html">See all guides
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
      </div>

      <div class="st-panel" role="tabpanel" aria-label="${esc(short(g.title))}">
        <div class="st-methods" role="tablist" aria-label="Method">
          ${methods.map((x, i) => `<button type="button" role="tab" class="st-method${i === sel.m ? " is-on" : ""}" aria-selected="${i === sel.m}" data-m="${i}">${esc(x.label)}</button>`).join("")}
        </div>

        <div class="st-body">
          <div class="st-head">
            <h3>${esc(m.label || "")} ${esc(short(g.title).toLowerCase())}</h3>
            <div class="st-facts">
              ${m.heat ? `<span><b>Heat</b> ${esc(m.heat)}</span>` : ""}
              ${m.time ? `<span><b>Time</b> ${esc(m.time)}</span>` : ""}
            </div>
          </div>

          ${stages.length ? `
          <div class="st-ladder" style="--pct:${pct}%">
            <div class="st-track" aria-hidden="true"><span class="st-fill"></span></div>
            <div class="st-stops" role="radiogroup" aria-label="How done do you want it?">
              ${stages.map((x, i) => `
                <button type="button" role="radio" class="st-stop${i === sel.d ? " is-on" : ""}${i < sel.d ? " is-past" : ""}" aria-checked="${i === sel.d}" data-d="${i}">
                  <span class="st-dot" aria-hidden="true"></span>
                  <span class="st-stop-label">${esc(x.label)}</span>
                  <span class="st-stop-time">${esc(x.time)}</span>
                </button>`).join("")}
            </div>
          </div>

          <div class="st-result">
            <div class="st-cue">
              <span class="st-label">What you're looking for</span>
              <p>${esc(d.cue || "")}</p>
            </div>
            ${secs ? `
            <div class="st-timer" data-timer>
              <div class="st-ring" style="--p:0"><span class="st-clock" data-clock>${clock(secs)}</span></div>
              <div class="st-timer-actions">
                <button type="button" class="st-go" data-start>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
                  Start ${esc(clock(secs))} timer
                </button>
                <span class="st-timer-note">Checks at the start of the range</span>
              </div>
            </div>` : `<div class="st-timer is-none"><span class="st-label">Timing</span><p>${esc(d.time)}</p></div>`}
          </div>` : ""}

          ${m.commonMistake ? `<p class="st-mistake"><span aria-hidden="true">⚠️</span> <b>Common mistake:</b> ${esc(m.commonMistake)}</p>` : ""}

          <div class="st-foot">
            <a class="st-full" href="${guideHref}">Full step-by-step guide →</a>
            ${related.length ? `
              <span class="st-cook">
                <span class="st-label">Put it to work</span>
                ${related.slice(0, 2).map(({ r, idx }) => `<a href="${opts.recipeHref(r, idx)}">${esc(r.title)}</a>`).join("")}
                ${related.length > 2 ? `<span class="st-more">+${related.length - 2} more</span>` : ""}
              </span>` : ""}
          </div>
        </div>
      </div>`;
  }

  /* ---------- timer ---------- */
  let audio;
  function chime() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35, 0.7].forEach(t => {
        const o = audio.createOscillator(), gn = audio.createGain();
        o.type = "sine"; o.frequency.value = 880;
        gn.gain.setValueAtTime(0.0001, audio.currentTime + t);
        gn.gain.exponentialRampToValueAtTime(0.25, audio.currentTime + t + 0.02);
        gn.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + t + 0.3);
        o.connect(gn).connect(audio.destination);
        o.start(audio.currentTime + t); o.stop(audio.currentTime + t + 0.32);
      });
    } catch (e) {}
    try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
  }

  function stopTimer() {
    if (timer && timer.raf) cancelAnimationFrame(timer.raf);
    if (timer && timer.iv) clearInterval(timer.iv);
    timer = null;
    document.title = baseTitle;
  }

  const baseTitle = document.title;
  function tick() {
    if (!timer) return;
    const box = root.querySelector("[data-timer]");
    timer.left = (timer.endsAt - Date.now()) / 1000;
    const done = timer.left <= 0;
    if (box) {
      box.querySelector("[data-clock]").textContent = done ? "Done" : clock(timer.left);
      box.querySelector(".st-ring").style.setProperty("--p", Math.min(100, 100 - (timer.left / timer.total) * 100));
    }
    document.title = done ? "⏰ Done! · Recipy" : `${clock(timer.left)} · ${timer.label}`;
    if (done) {
      chime();
      if (box) {
        box.classList.add("is-done");
        const go = box.querySelector("[data-start]");
        go.innerHTML = "Check it now · start again";
        go.dataset.state = "done";
      }
      const t = timer; stopTimer();
      document.title = "⏰ Done! · Recipy";
      setTimeout(() => { if (!timer) document.title = baseTitle; }, 8000);
      return t;
    }
    timer.raf = requestAnimationFrame(tick);
  }

  function startTimer(btn) {
    const g = guides[sel.g], m = (g.methods || [])[sel.m], d = (m.doneness || [])[sel.d];
    const secs = seconds(d && d.time);
    if (!secs) return;
    const box = root.querySelector("[data-timer]");
    if (timer && btn.dataset.state === "running") {
      stopTimer();
      box.classList.remove("is-running", "is-done");
      box.querySelector("[data-clock]").textContent = clock(secs);
      box.querySelector(".st-ring").style.setProperty("--p", 0);
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg> Start ${clock(secs)} timer`;
      btn.dataset.state = "";
      return;
    }
    stopTimer();
    timer = { total: secs, endsAt: Date.now() + secs * 1000, label: `${d.label} ${short(g.title).toLowerCase()}` };
    box.classList.add("is-running"); box.classList.remove("is-done");
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14"></rect><rect x="14" y="5" width="4" height="14"></rect></svg> Stop`;
    btn.dataset.state = "running";
    /* rAF pauses in background tabs; a slow interval keeps the tab title counting down */
    timer.iv = setInterval(() => { if (document.hidden) tick(); }, 1000);
    tick();
  }

  /* ---------- events ---------- */
  function choose(kind, i) {
    stopTimer();
    if (kind === "g") { sel = { g: i, m: 0, d: 0 }; save(); }
    if (kind === "m") { sel.m = i; sel.d = 0; }
    if (kind === "d") { sel.d = i; }
    const focusSel = `[data-${kind}="${i}"]`;
    render();
    const el = root.querySelector(focusSel);
    if (el) el.focus({ preventScroll: true });
  }

  function bind() {
    root.addEventListener("click", e => {
      const b = e.target.closest("[data-g],[data-m],[data-d],[data-start]");
      if (!b) return;
      if (b.hasAttribute("data-start")) { startTimer(b); return; }
      const kind = b.hasAttribute("data-g") ? "g" : b.hasAttribute("data-m") ? "m" : "d";
      choose(kind, parseInt(b.getAttribute("data-" + kind), 10));
    });
    /* arrow keys move along the doneness ladder, like a slider */
    root.addEventListener("keydown", e => {
      const stop = e.target.closest("[data-d]");
      if (!stop || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault();
      const n = root.querySelectorAll("[data-d]").length;
      const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      choose("d", Math.max(0, Math.min(n - 1, sel.d + dir)));
    });
  }

  async function mount(el, options) {
    root = el; opts = options;
    try {
      guides = window.RECIPY && window.RECIPY.techniques
        ? await window.RECIPY.techniques.getAll()
        : (window.TECHNIQUES || []).slice();
    } catch (e) {
      guides = (window.TECHNIQUES || []).slice();
    }
    guides = (guides || []).filter(g => (g.methods || []).length);
    if (!guides.length) return; /* keep the static links */
    restore();
    el.classList.add("is-studio");
    const banner = el.closest(".basics-banner");
    if (banner) banner.classList.add("is-studio");
    render();
    bind();
  }

  window.RecipyStudio = { mount, _seconds: seconds };
})();
