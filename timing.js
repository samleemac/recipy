/* ============================================================
   Recipy — "Plan dinner" reverse scheduler
   Pick when you want to eat; we work backwards through the
   recipe's step timings to tell you when to start each step,
   and can drop the whole plan into your calendar with a reminder.
   ============================================================ */
(function () {
  const STORE_KEY = "recipy-eat-at";
  const SLOT_MINUTES = 30;

  let root, heroChip, recipe, getServings, eatAt = null; // eatAt: Date
  let customOpen = false;

  /* ---------- time helpers ---------- */
  const pad = n => String(n).padStart(2, "0");

  function fmt(d) {
    let h = d.getHours();
    const m = d.getMinutes();
    const suf = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return h + (m ? ":" + pad(m) : "") + suf;
  }

  function fmtDuration(mins) {
    if (mins < 60) return mins + " min";
    const h = Math.floor(mins / 60), m = mins % 60;
    return h + " hr" + (m ? " " + m + " min" : "");
  }

  function addMin(d, m) { return new Date(d.getTime() + m * 60000); }

  function totalMinutes() {
    const steps = (recipe && recipe.steps) || [];
    const sum = steps.reduce((t, s) => t + (Number(s.time) || 0), 0);
    return sum || Number(recipe && recipe.time) || 30;
  }

  /* Eat-time slots: the next five half-hours you could realistically make */
  function slots() {
    const now = new Date();
    const earliest = addMin(now, totalMinutes());
    const first = new Date(earliest);
    first.setSeconds(0, 0);
    const rem = first.getMinutes() % SLOT_MINUTES;
    if (rem) first.setMinutes(first.getMinutes() + (SLOT_MINUTES - rem));
    /* Evening default: if it's before 4pm, start offering from 6pm */
    const sixPm = new Date(now); sixPm.setHours(18, 0, 0, 0);
    const start = now.getHours() < 16 && sixPm > first ? sixPm : first;
    return Array.from({ length: 5 }, (_, i) => addMin(start, i * SLOT_MINUTES));
  }

  function sameMinute(a, b) { return a && b && Math.abs(a - b) < 60000; }

  function loadPreferred() {
    try {
      const v = localStorage.getItem(STORE_KEY);
      if (!v || !/^\d{2}:\d{2}$/.test(v)) return null;
      const [h, m] = v.split(":").map(Number);
      const d = new Date(); d.setHours(h, m, 0, 0);
      /* if that time today is no longer reachable, use tomorrow */
      if (addMin(d, -totalMinutes()) < addMin(new Date(), -5)) d.setDate(d.getDate() + 1);
      return d;
    } catch (e) { return null; }
  }

  function savePreferred(d) {
    try { localStorage.setItem(STORE_KEY, pad(d.getHours()) + ":" + pad(d.getMinutes())); } catch (e) {}
  }

  /* Schedule: each step with its start time, working back from eatAt */
  function schedule() {
    const steps = (recipe.steps || []).map(s => ({ title: s.title || "Step", mins: Number(s.time) || 0 }));
    const start = addMin(eatAt, -totalMinutes());
    let t = start;
    return {
      start,
      steps: steps.map((s, i) => {
        const at = t;
        t = addMin(t, s.mins);
        return { n: i + 1, title: s.title, mins: s.mins, at };
      })
    };
  }

  function dayWord(d) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const that = new Date(d); that.setHours(0, 0, 0, 0);
    const diff = Math.round((that - today) / 86400000);
    if (diff === 0) return "today";
    if (diff === 1) return "tomorrow";
    return d.toLocaleDateString(undefined, { weekday: "long" });
  }

  function countdown(start) {
    const mins = Math.round((start - new Date()) / 60000);
    if (mins <= 0) return { late: true, text: "Start now" };
    if (mins < 60) return { late: false, text: "in " + mins + " min" };
    const h = Math.floor(mins / 60), m = mins % 60;
    if (h >= 3) {
      const w = dayWord(start);
      return { late: false, text: w === "today" ? (start.getHours() >= 17 ? "this evening" : "later today") : w };
    }
    return { late: false, text: "in " + h + " hr" + (m ? " " + m + " min" : "") };
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- calendar (.ics) ---------- */
  function icsStamp(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00";
  }

  function icsEscape(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  function foldLine(line) {
    /* RFC 5545: fold lines longer than 75 octets (count UTF-8 bytes, not characters) */
    const out = [];
    let cur = "", bytes = 0;
    for (const ch of line) {
      const b = new TextEncoder().encode(ch).length;
      if (bytes + b > 74) { out.push(cur); cur = " "; bytes = 1; }
      cur += ch; bytes += b;
    }
    out.push(cur);
    return out.join("\r\n");
  }

  function fmtAmount(a) {
    if (!a) return "";
    const r = Math.round(a * 4) / 4;
    const whole = Math.floor(r), frac = r - whole;
    const f = frac === 0.25 ? "¼" : frac === 0.5 ? "½" : frac === 0.75 ? "¾" : "";
    return (whole || !f ? whole : "") + f;
  }

  function ingredientLines() {
    const base = recipe.baseServings || 2;
    const n = (getServings && getServings()) || base;
    const factor = n / base;
    const lines = [];
    (recipe.ingredientGroups || []).forEach(g => (g.items || []).forEach(it => {
      const amt = fmtAmount((it.amount || 0) * factor);
      lines.push("• " + [amt, it.unit, it.text].filter(Boolean).join(" ").trim());
    }));
    return { n, lines };
  }

  function downloadIcs() {
    const plan = schedule();
    const ing = ingredientLines();
    const url = location.href.split("#")[0];
    const desc = [
      "Eat at " + fmt(eatAt) + ". Here's your timeline:",
      ...plan.steps.map(s => fmt(s.at) + " · " + s.title + " (" + s.mins + " min)"),
      "",
      "You'll need (serves " + ing.n + "):",
      ...ing.lines,
      "",
      "Full recipe: " + url
    ].join("\n");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Recipy//Plan dinner//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "-" + (recipe.slug || recipe.id) + "@recipy",
      "DTSTAMP:" + icsStamp(new Date()),
      "DTSTART:" + icsStamp(plan.start),
      "DTEND:" + icsStamp(eatAt),
      "SUMMARY:" + icsEscape("Cook: " + recipe.title),
      "DESCRIPTION:" + icsEscape(desc),
      "URL:" + url,
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      "DESCRIPTION:" + icsEscape("Time to start " + recipe.title + " in 15 minutes"),
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].map(foldLine).join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (recipe.slug || "recipe") + "-dinner-plan.ics";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);

    const note = root.querySelector("[data-cal-note]");
    if (note) note.textContent = "Added. Open the file to save it to your calendar, with a reminder 15 min before.";
  }

  /* ---------- render ---------- */
  function renderHeroChip() {
    if (!heroChip) return;
    const plan = schedule();
    const c = countdown(plan.start);
    heroChip.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>' +
      (c.late ? "Start now to eat at <strong>" + fmt(eatAt) + "</strong>"
              : "Eat at " + fmt(eatAt) + "? Start <strong>" + fmt(plan.start) + "</strong>");
  }

  function render() {
    if (!root || !recipe) return;
    const plan = schedule();
    const total = totalMinutes();
    const c = countdown(plan.start);
    const opts = slots();
    const custom = !opts.some(o => sameMinute(o, eatAt));
    const timeVal = pad(eatAt.getHours()) + ":" + pad(eatAt.getMinutes());

    root.innerHTML = `
      <span class="r-section-tag">Plan dinner</span>
      <div class="plan">
        <div class="plan__head">
          <h2>When do you want to eat?</h2>
          <div class="plan__picker" role="group" aria-label="Choose when you want to eat">
            ${opts.map(o => `<button type="button" class="plan__slot${sameMinute(o, eatAt) ? " is-on" : ""}" aria-pressed="${sameMinute(o, eatAt)}" data-slot="${o.getTime()}">${fmt(o)}</button>`).join("")}
            ${custom || customOpen
              ? `<label class="plan__custom${custom ? " is-on" : ""}">
                  <span class="sr-only">Pick another time</span>
                  <input type="time" value="${timeVal}" step="300" data-custom />
                </label>`
              : `<button type="button" class="plan__slot plan__slot--other" data-other>Other time</button>`}
          </div>
        </div>

        <div class="plan__answer${c.late ? " is-late" : ""}">
          <div class="plan__start">
            <span class="plan__label">${c.late ? "You're cutting it fine" : "Start cooking at"}</span>
            <strong class="plan__time">${c.late ? "Now" : fmt(plan.start)}</strong>
            <span class="plan__in">${c.late ? "Begin straight away to eat at " + fmt(eatAt) : c.text + " · " + fmtDuration(total) + " from first chop to table"}</span>
          </div>
          <div class="plan__cta">
            <button type="button" class="plan__btn plan__btn--primary" data-cal>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="10" y1="16" x2="14" y2="16"></line></svg>
              Add to my calendar
            </button>
            <button type="button" class="plan__btn" data-cook>Start Cook Mode</button>
            <p class="plan__note" data-cal-note aria-live="polite">Includes the timeline, the shopping list and a reminder 15 min before.</p>
          </div>
        </div>

        <ol class="plan__line" aria-label="Your cooking timeline">
          ${plan.steps.map(s => `
            <li class="plan__step" style="--grow:${Math.max(s.mins, 3)}">
              <span class="plan__bar" aria-hidden="true"></span>
              <span class="plan__clock">${fmt(s.at)}</span>
              <span class="plan__what"><b>${s.n}.</b> ${esc(s.title)}</span>
              <span class="plan__mins">${s.mins} min</span>
            </li>`).join("")}
          <li class="plan__step plan__step--eat">
            <span class="plan__bar" aria-hidden="true"></span>
            <span class="plan__clock">${fmt(eatAt)}</span>
            <span class="plan__what">Dinner's up</span>
          </li>
        </ol>
      </div>`;
    renderHeroChip();
  }

  function setEatAt(d) {
    eatAt = d;
    savePreferred(d);
    const active = document.activeElement;
    const focusSlot = active && root.contains(active) && active.dataset.slot;
    render();
    if (focusSlot) {
      const el = root.querySelector(`[data-slot="${d.getTime()}"]`);
      if (el) el.focus();
    }
  }

  function bind() {
    root.addEventListener("click", e => {
      const slot = e.target.closest("[data-slot]");
      if (slot && slot.dataset.slot) { customOpen = false; setEatAt(new Date(Number(slot.dataset.slot))); return; }
      if (e.target.closest("[data-cal]")) { downloadIcs(); return; }
      if (e.target.closest("[data-other]")) {
        customOpen = true;
        render();
        const input = root.querySelector("[data-custom]");
        if (input) { input.focus(); try { input.showPicker && input.showPicker(); } catch (err) {} }
        return;
      }
      if (e.target.closest("[data-cook]")) {
        const btn = document.getElementById("cookModeBtn");
        if (btn) btn.click();
      }
    });
    root.addEventListener("change", e => {
      if (!e.target.matches("[data-custom]")) return;
      const [h, m] = (e.target.value || "").split(":").map(Number);
      if (isNaN(h)) return;
      const d = new Date(); d.setHours(h, m || 0, 0, 0);
      if (addMin(d, -totalMinutes()) < addMin(new Date(), -5)) d.setDate(d.getDate() + 1);
      setEatAt(d);
    });
    if (heroChip) {
      heroChip.addEventListener("click", () => {
        root.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      });
    }
    /* keep "in 25 min" honest */
    setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (root.contains(document.activeElement)) { renderHeroChip(); return; }
      render();
    }, 60000);
  }

  let bound = false;
  function mount(el, chip, rec, servingsGetter) {
    root = el; heroChip = chip; recipe = rec; getServings = servingsGetter;
    if (!recipe || !(recipe.steps || []).length) { root.hidden = true; if (chip) chip.hidden = true; return; }
    root.hidden = false; if (chip) chip.hidden = false;
    if (!eatAt) eatAt = loadPreferred() || slots()[0];
    render();
    if (!bound) {
      bind(); bound = true;
      /* arriving from "Cook it tonight" (recipe.html#timing): the section only exists now */
      if (location.hash === "#timing") requestAnimationFrame(() => root.scrollIntoView({ block: "start" }));
    }
  }

  window.RecipyTiming = { mount };
})();
