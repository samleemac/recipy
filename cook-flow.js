/* ============================================================
   Recipy — Cook Mode "flow"
   One action at a time, in big type, with:
   - amounts written into the sentence ("Heat the oil ½ tbsp…")
   - "~6-7 min" turned into a one-tap timer
   - tap anywhere / swipe / arrows to move on
   - hands-free voice ("next", "back", "repeat", "timer")
     and read-aloud
   - story-style progress and an "Up next: get ready" peek
   host = {
     steps(), ingredientGroups(), factor(), formatAmount(n),
     stepIndex(), nextStep(), prevStep(), startTimer(label, mins),
     timerRunning(label), ingredientsForStep(step, i), recipeTitle()
   }
   ============================================================ */
(function () {
  const PREF_KEY = "recipy-cookflow-v1";
  let host, root, beat = 0, lastStep = -1, beatsCache = new Map(), pendingFromEnd = false;
  let checkpoint = false; /* the "Step done" card between steps */
  let prefs = { voice: false, speak: false, hinted: false };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || "{}")); prefs.voice = false; } catch (e) {}
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} };

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- split a step into actions ---------- */
  function beatsFor(i) {
    if (beatsCache.has(i)) return beatsCache.get(i);
    const s = host.steps()[i] || {};
    let parts = String(s.desc || "").replace(/\s+/g, " ").trim()
      .split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/);
    /* long sentences joined by "; " become separate actions */
    parts = parts.flatMap(p => p.length > 150 ? p.split(/;\s+/) : [p]).map(p => p.trim()).filter(Boolean);
    /* glue very short fragments ("Stir.") onto the previous action */
    const out = [];
    parts.forEach(p => {
      if (out.length && p.split(/\s+/).length < 4) out[out.length - 1] += " " + p;
      else out.push(p);
    });
    if (!out.length) out.push(s.title || "");
    beatsCache.set(i, out);
    return out;
  }

  /* ---------- ingredients written into the text ---------- */
  const STOP = new Set(["fresh", "dried", "ground", "chopped", "sliced", "diced", "large", "small", "medium", "ripe", "firm", "extra", "virgin", "fine", "freshly", "smooth", "light", "dark", "plain", "unsweetened", "frozen", "cooked", "dry", "tinned", "mixed", "variety", "mixed-variety", "baby", "whole", "of", "a", "and", "or", "the", "for", "to", "taste", "style", "plant", "based", "cloves", "clove"]);
  const GENERIC = /^(milk|oil|sauce|paste|juice|powder|stock|vinegar|cream|cheese|sugar|syrup|extract|flakes|seeds|leaves)$/;
  function ingredientTerms() {
    const groups = host.ingredientGroups() || [];
    const f = host.factor();
    const terms = [];
    groups.forEach((g, gi) => (g.items || []).forEach((it, ii) => {
      const name = String(it.text || "").replace(/\([^)]*\)|\[[^\]]*\]/g, "").replace(/,.*$/, "").toLowerCase().trim();
      const words = name.replace(/[^a-z\s-]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
      if (!words.length) return;
      const last = words[words.length - 1];
      const pair = words.length > 1 ? words.slice(-2).join(" ") : "";
      const variants = [];
      if (pair) variants.push(pair);
      /* generic words ("oil", "stock") only count on their own when the recipe has just one of them */
      const shared = groups.reduce((n, g2) => n + (g2.items || []).filter(x => new RegExp(`\\b${last}\\b`, "i").test(String(x.text || "").replace(/,.*$/, ""))).length, 0);
      if (!(pair && GENERIC.test(last)) || shared === 1) variants.push(last, last.replace(/(oes|s)$/, m => m === "oes" ? "o" : ""));
      const scaled = (it.amount || 0) * f;
      const amount = scaled > 0 ? `${host.formatAmount(scaled)}${it.unit ? " " + it.unit : ""}` : "";
      terms.push({ key: `${gi}-${ii}`, variants: [...new Set(variants.filter(v => v.length > 2))], amount, label: name });
    }));
    return terms;
  }

  function decorate(text, terms, stepTitle, used, seen) {
    /* find non-overlapping ingredient mentions + time mentions, then build HTML */
    const marks = [];
    const lower = text.toLowerCase();
    terms.slice().sort((a, b) => Math.max(...b.variants.map(v => v.length)) - Math.max(...a.variants.map(v => v.length))).forEach(t => {
      for (const v of t.variants) {
        const re = new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?\\b`, "i");
        const m = re.exec(lower);
        if (!m) continue;
        const start = m.index, end = m.index + m[0].length;
        if (marks.some(k => start < k.end && end > k.start)) continue;
        marks.push({ start, end, type: "ing", term: t });
        if (used) used.add(t.key);
        break;
      }
    });
    const timeRe = /\(?~?\s*(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?\s*(min(?:ute)?s?|hours?|hrs?)\b\)?/gi;
    let tm;
    while ((tm = timeRe.exec(text))) {
      const start = tm.index, end = tm.index + tm[0].length;
      if (marks.some(k => start < k.end && end > k.start)) continue;
      const hi = parseFloat(tm[2] || tm[1]);
      const mins = /^h/i.test(tm[3]) ? Math.round(hi * 60) : Math.round(hi);
      if (mins >= 1 && mins <= 240) marks.push({ start, end, type: "time", mins, raw: tm[0].replace(/^\(|\)$/g, "").trim() });
    }
    marks.sort((a, b) => a.start - b.start);
    let html = "", pos = 0;
    marks.forEach(mk => {
      html += esc(text.slice(pos, mk.start));
      const raw = text.slice(mk.start, mk.end);
      if (mk.type === "ing") {
        const first = !seen || !seen.has(mk.term.key);
        if (seen) seen.add(mk.term.key);
        html += `<span class="cf-ing">${esc(raw)}${mk.term.amount && first ? `<b>${esc(mk.term.amount)}</b>` : ""}</span>`;
      } else {
        const label = `${stepTitle}`;
        const running = host.timerRunning(label + " · " + mk.mins + " min");
        html += `<button type="button" class="cf-time${running ? " is-running" : ""}" data-timer="${mk.mins}" data-label="${esc(label + " · " + mk.mins + " min")}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"></circle><polyline points="12 9 12 13 14.5 15"></polyline><line x1="9" y1="2" x2="15" y2="2"></line></svg>
          ${esc(mk.raw.replace(/^~\s*/, ""))}<span class="sr-only"> — start a ${mk.mins} minute timer</span></button>`;
      }
      pos = mk.end;
    });
    html += esc(text.slice(pos));
    return html;
  }

  /* ---------- render ---------- */
  function render(stepIdx, opts) {
    const steps = host.steps();
    const s = steps[stepIdx];
    if (!s) return;
    if (stepIdx !== lastStep) {
      beat = (opts && opts.fromEnd) || pendingFromEnd ? beatsFor(stepIdx).length - 1 : 0;
      pendingFromEnd = false;
      lastStep = stepIdx;
    }
    const beats = beatsFor(stepIdx);
    beat = Math.max(0, Math.min(beats.length - 1, beat));
    const terms = ingredientTerms();
    const used = new Set(), seen = new Set();
    const beatsHtml = beats.map((b, i) => decorate(b, terms, s.title || `Step ${stepIdx + 1}`, used, seen));

    /* what you need for this step: the recipe's own mapping, plus anything we spotted in the text */
    const listed = (host.ingredientsForStep(s, stepIdx) || []).map(x => ({ text: x.text, amount: x.amountStr }));
    const spotted = terms.filter(t => used.has(t.key) && !listed.some(l => l.text.toLowerCase().includes(t.variants[t.variants.length - 1])))
      .map(t => ({ text: t.label, amount: t.amount }));
    const need = listed.concat(spotted);

    const next = steps[stepIdx + 1];
    const nextNeed = next ? (host.ingredientsForStep(next, stepIdx + 1) || []).slice(0, 4).map(x => x.text.replace(/,.*$/, "")) : [];
    const isLastBeat = beat === beats.length - 1;

    root.innerHTML = `
      <div class="cf" data-step="${stepIdx}">
        <div class="cf-stories" aria-hidden="true">
          ${storiesHtml(stepIdx, beat)}
        </div>

        <div class="cf-meta">
          <span class="cf-step">Step ${stepIdx + 1} of ${steps.length}</span>
          <span class="cf-dot" aria-hidden="true">·</span>
          <span class="cf-title">${esc(s.title || "")}</span>
          ${s.time ? `<span class="cf-dur">${s.time} min</span>` : ""}
          ${beats.length > 1 ? `
          <span class="cf-parts" aria-label="Part ${beat + 1} of ${beats.length} in this step">
            <span class="cf-parts-dots" aria-hidden="true">${beats.map((_, i) => `<i class="${i < beat ? "done" : i === beat ? "now" : ""}"></i>`).join("")}</span>
            Part ${beat + 1} of ${beats.length}
          </span>` : ""}
        </div>

        ${beat === 0 && need.length ? `
          <div class="cf-need" aria-label="You'll need for this step">
            ${need.slice(0, 8).map(n => `<span><b>${esc(n.amount || "")}</b> ${esc(n.text.replace(/,.*$/, ""))}</span>`).join("")}
          </div>` : ""}

        <ol class="cf-beats" aria-live="polite">
          ${beatsHtml.map((h, i) => `
            <li class="cf-beat ${i < beat ? "is-past" : i === beat ? "is-now" : "is-next"}"${i === beat ? ' aria-current="step"' : ""}>
              <span class="cf-beat-mark" aria-hidden="true">${i < beat ? "✓" : i + 1}</span>
              <div class="cf-beat-body">
                ${i === beat && beats.length > 1 ? `<span class="cf-beat-label">${i === beats.length - 1 ? "Last part of this step" : `Part ${i + 1} of ${beats.length}`}</span>` : ""}
                <p>${h}</p>
              </div>
            </li>`).join("")}
        </ol>

        ${s.tip && isLastBeat ? `<div class="cf-tip"><b>Tip</b> ${esc(s.tip)}</div>` : ""}

        ${!prefs.hinted && stepIdx === 0 && beat === 0 ? `<p class="cf-hint">Each step comes in short parts. Tap anywhere for the next part · tap the left edge to go back</p>` : ""}

        <div class="cf-peek">
          ${isLastBeat
            ? next
              ? `<span class="cf-peek-label">Up next</span><strong>${esc(next.title || `Step ${stepIdx + 2}`)}</strong>${nextNeed.length ? `<span class="cf-peek-need">Get ready: ${esc(nextNeed.join(", "))}</span>` : ""}`
              : `<span class="cf-peek-label">Last bit</span><strong>Then plate up</strong>`
            : `<span class="cf-peek-more">${beats.length - beat - 1 === 1 ? "1 more part" : `${beats.length - beat - 1} more parts`} before the next step</span>`}
        </div>
      </div>`;

    /* keep the current action in view on small screens */
    const now = root.querySelector(".cf-beat.is-now");
    if (now && now.scrollIntoView) now.scrollIntoView({ block: "center", behavior: reduce() ? "auto" : "smooth" });

    syncChrome();
    if (prefs.speak) speak(beats[beat]);
  }

  function storiesHtml(stepIdx, b, stepDone) {
    return host.steps().map((_, i) => {
      const n = beatsFor(i).length;
      const pieces = Array.from({ length: n }, (_, k) => {
        const on = i < stepIdx || (i === stepIdx && (stepDone || k <= b));
        const now = i === stepIdx && !stepDone && k === b;
        return `<i class="${on ? "on" : ""}${now ? " now" : ""}"></i>`;
      }).join("");
      return `<span class="cf-seg${i === stepIdx ? " is-current" : ""}">${pieces}</span>`;
    }).join("");
  }

  function renderCheckpoint(stepIdx) {
    const steps = host.steps();
    const s = steps[stepIdx], next = steps[stepIdx + 1];
    const need = (host.ingredientsForStep(next, stepIdx + 1) || []).slice(0, 6);
    root.innerHTML = `
      <div class="cf cf-check" data-step="${stepIdx}">
        <div class="cf-stories" aria-hidden="true">${storiesHtml(stepIdx, 0, true)}</div>
        <div class="cf-check-card" role="status">
          <span class="cf-check-tick" aria-hidden="true">✓</span>
          <p class="cf-check-done">Step ${stepIdx + 1} done · ${esc(s.title || "")}</p>
          <span class="cf-check-label">Next up · Step ${stepIdx + 2} of ${steps.length}</span>
          <h3>${esc(next.title || `Step ${stepIdx + 2}`)}</h3>
          <p class="cf-check-meta">${next.time ? `About ${next.time} min · ` : ""}${beatsFor(stepIdx + 1).length} part${beatsFor(stepIdx + 1).length === 1 ? "" : "s"}</p>
          ${need.length ? `
            <div class="cf-need cf-check-need" aria-label="Get ready">
              <span class="cf-check-ready">Get ready</span>
              ${need.map(n => `<span><b>${esc(n.amountStr || "")}</b> ${esc(String(n.text).replace(/,.*$/, ""))}</span>`).join("")}
            </div>` : ""}
          <div class="cf-check-actions">
            <button type="button" class="cf-check-go" data-continue>Start step ${stepIdx + 2}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            <button type="button" class="cf-check-back" data-backto>Back to step ${stepIdx + 1}</button>
          </div>
        </div>
      </div>`;
    syncChrome();
    if (prefs.speak) speak(`Step ${stepIdx + 1} done. Next up, ${next.title || ""}.`);
    const go = root.querySelector("[data-continue]");
    if (go) go.focus({ preventScroll: true });
  }

  function syncChrome() {
    const cm = document.getElementById("cookmode");
    if (cm) cm.classList.toggle("is-checkpoint", checkpoint);
    const steps = host.steps();
    const i = host.stepIndex();
    const beats = beatsFor(i);
    const atStart = i === 0 && beat === 0;
    const atEnd = i === steps.length - 1 && beat === beats.length - 1;
    const prev = document.getElementById("cookmodePrev");
    if (prev) prev.disabled = atStart;
    const label = document.getElementById("cookmodeNextLabel");
    if (label) {
      label.textContent = checkpoint ? `Start step ${i + 2}`
        : atEnd ? "Finish"
        : beat === beats.length - 1 ? `Finish step ${i + 1} ✓`
        : `Next part · ${beat + 2} of ${beats.length}`;
    }
    if (prev) prev.disabled = atStart && !checkpoint;
    const nextBtn = document.getElementById("cookmodeNext");
    if (nextBtn) {
      nextBtn.classList.toggle("is-finish", atEnd);
      nextBtn.classList.toggle("is-step-end", !checkpoint && !atEnd && beat === beats.length - 1);
      nextBtn.setAttribute("aria-label", label ? label.textContent : "Next");
    }
    const bar = document.getElementById("cookmodeBar");
    if (bar) {
      const total = steps.reduce((n, _, k) => n + beatsFor(k).length, 0);
      const done = steps.slice(0, i).reduce((n, _, k) => n + beatsFor(k).length, 0) + beat + 1;
      bar.style.width = Math.round(done / total * 100) + "%";
    }
    const v = document.getElementById("cfVoice"), r = document.getElementById("cfSpeak");
    if (v) { v.classList.toggle("is-on", !!prefs.voice); v.setAttribute("aria-pressed", !!prefs.voice); }
    if (r) { r.classList.toggle("is-on", !!prefs.speak); r.setAttribute("aria-pressed", !!prefs.speak); }
  }

  /* ---------- moving ---------- */
  function forward() {
    if (!prefs.hinted) { prefs.hinted = true; savePrefs(); }
    const i = host.stepIndex();
    if (!root.querySelector(".cf")) { host.nextStep(); return; } /* finish screen etc. */
    if (checkpoint) { checkpoint = false; host.nextStep(); return; } /* marks the step done, shows the next */
    if (beat < beatsFor(i).length - 1) { beat++; render(i); pulse("next"); return; }
    if (i < host.steps().length - 1) { checkpoint = true; renderCheckpoint(i); return; }
    host.nextStep(); /* last step: straight to the finish view */
  }
  function back() {
    const i = host.stepIndex();
    if (!root.querySelector(".cf")) { host.prevStep(); return; }
    if (checkpoint) { checkpoint = false; render(i); return; }
    if (beat > 0) { beat--; render(i); pulse("back"); return; }
    if (i > 0) { pendingFromEnd = true; host.prevStep(); }
  }
  function pulse(dir) {
    const now = root.querySelector(".cf-beat.is-now");
    if (!now || reduce()) return;
    now.classList.add(dir === "next" ? "in-next" : "in-back");
  }

  /* ---------- speech ---------- */
  function speak(text) {
    try {
      if (!("speechSynthesis" in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/~/g, "about ").replace(/(\d)-(\d)/g, "$1 to $2"));
      u.rate = 0.98; u.lang = document.documentElement.lang || "en-GB";
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  let rec = null;
  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { host.toast("Voice control isn't supported in this browser. Try Chrome or Safari."); prefs.voice = false; syncChrome(); return; }
    rec = new SR();
    rec.continuous = true; rec.interimResults = false; rec.lang = "en-GB";
    rec.onresult = e => {
      const said = e.results[e.results.length - 1][0].transcript.toLowerCase();
      flashHeard(said.trim());
      if (/\b(next|done|okay|ok|continue|go on|forward)\b/.test(said)) forward();
      else if (/\b(back|previous|go back)\b/.test(said)) back();
      else if (/\b(repeat|again|say that|read)\b/.test(said)) { const b = beatsFor(host.stepIndex())[beat]; speak(b); }
      else if (/\b(timer|time it|start)\b/.test(said)) { const t = root.querySelector(".cf-beat.is-now [data-timer]") || root.querySelector("[data-timer]"); if (t) t.click(); else host.toast("No timer in this bit"); }
    };
    rec.onend = () => { if (prefs.voice && document.getElementById("cookmode").classList.contains("open")) { try { rec.start(); } catch (e) {} } };
    rec.onerror = ev => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        prefs.voice = false; syncChrome(); host.toast("Microphone access was blocked");
      }
    };
    try { rec.start(); host.toast('Hands-free on. Say "next", "back", "repeat" or "timer"'); } catch (e) {}
  }
  function stopVoice() { try { if (rec) { rec.onend = null; rec.stop(); } } catch (e) {} rec = null; }
  function flashHeard(text) {
    const el = document.getElementById("cfHeard");
    if (!el) return;
    el.textContent = `“${text}”`;
    el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  }

  /* ---------- wiring ---------- */
  let touchX = null, touchY = null;
  function bind() {
    root.addEventListener("click", e => {
      const t = e.target.closest("[data-timer]");
      if (t) {
        e.stopPropagation();
        host.startTimer(t.dataset.label, parseInt(t.dataset.timer, 10));
        t.classList.add("is-running");
        return;
      }
      if (!root.querySelector(".cf")) return;
      if (e.target.closest("[data-continue]")) { forward(); return; }
      if (e.target.closest("[data-backto]")) { back(); return; }
      if (e.target.closest("button, a, input, textarea, .cf-need")) return;
      const rect = root.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width * 0.28) back(); else forward();
    });
    root.addEventListener("touchstart", e => { const p = e.touches[0]; touchX = p.clientX; touchY = p.clientY; }, { passive: true });
    root.addEventListener("touchend", e => {
      if (touchX == null || !root.querySelector(".cf")) return;
      const p = e.changedTouches[0];
      const dx = p.clientX - touchX, dy = p.clientY - touchY;
      touchX = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        e.preventDefault();
        if (dx < 0) forward(); else back();
      }
    });

    /* header controls: hands-free + read aloud */
    const head = document.querySelector(".cookmode-head");
    if (head && !document.getElementById("cfVoice")) {
      const box = document.createElement("div");
      box.className = "cf-controls";
      box.innerHTML = `
        <span class="cf-heard" id="cfHeard" aria-live="polite"></span>
        <button type="button" class="cf-ctrl" id="cfSpeak" aria-pressed="false" title="Read each step aloud">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M19 5a10 10 0 0 1 0 14"></path></svg>
          <span>Read aloud</span>
        </button>
        <button type="button" class="cf-ctrl" id="cfVoice" aria-pressed="false" title="Say next, back, repeat or timer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"></rect><path d="M5 10a7 7 0 0 0 14 0"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>
          <span>Hands-free</span>
        </button>`;
      const close = document.getElementById("cookmodeClose");
      head.insertBefore(box, close);
      box.addEventListener("click", e => {
        if (e.target.closest("#cfSpeak")) {
          prefs.speak = !prefs.speak; savePrefs(); syncChrome();
          if (prefs.speak) speak(beatsFor(host.stepIndex())[beat]); else try { speechSynthesis.cancel(); } catch (err) {}
        }
        if (e.target.closest("#cfVoice")) {
          prefs.voice = !prefs.voice; syncChrome();
          if (prefs.voice) startVoice(); else stopVoice();
        }
      });
    }
  }

  function onClose() {
    stopVoice(); prefs.voice = false; syncChrome();
    try { speechSynthesis.cancel(); } catch (e) {}
  }

  function mount(h) {
    host = h;
    root = document.getElementById("cookmodeStep");
    document.getElementById("cookmode").classList.add("is-flow");
    bind();
  }

  /* called when the recipe's servings change: amounts in the text update */
  function invalidate() { beatsCache.clear(); checkpoint = false; lastStep = -1; }

  window.RecipyCook = {
    mount, render, forward, back, onClose, invalidate,
    /* when stepping back into a previous step, start at its last action */
    renderFromEnd: i => { lastStep = -1; render(i, { fromEnd: true }); },
    _beats: beatsFor
  };
})();
