/* ============================================================
   Recipy — Monday to Sunday meal week.
   Slots live in localStorage under recipy.week.
   Recipes already on the shopping list (recipy.plan) can be
   dropped onto a slot, or placed with Add to week.
   ============================================================ */
(function () {
  "use strict";

  const KEY = "recipy.week";
  const PLAN_KEY = "recipy.plan";

  const DAYS = [
    ["mon", "Monday", "Mon"],
    ["tue", "Tuesday", "Tue"],
    ["wed", "Wednesday", "Wed"],
    ["thu", "Thursday", "Thu"],
    ["fri", "Friday", "Fri"],
    ["sat", "Saturday", "Sat"],
    ["sun", "Sunday", "Sun"]
  ];
  const MEALS = [
    ["breakfast", "Breakfast"],
    ["lunch", "Lunch"],
    ["dinner", "Dinner"],
    ["dessert", "Dessert"],
    ["snack", "Snacks"]
  ];
  const DAY_INDEX = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };

  let catalog = [];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  function tidy(t) {
    return String(t || "").replace(/\s*\(changes needed\)\s*$/i, "");
  }
  function iso(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }
  function parseIso(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  function mondayOf(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    return d;
  }
  function thisMonday() { return iso(mondayOf(new Date())); }

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "{}");
      return data && typeof data === "object" ? data : {};
    } catch (e) {
      return {};
    }
  }
  function write(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }
  function blankWeek() {
    const slots = {};
    DAYS.forEach(([day]) => {
      slots[day] = {};
      MEALS.forEach(([meal]) => { slots[day][meal] = null; });
    });
    return slots;
  }
  function normaliseWeek(raw) {
    const slots = blankWeek();
    if (!raw || typeof raw !== "object") return slots;
    DAYS.forEach(([day]) => {
      const src = raw[day] || {};
      MEALS.forEach(([meal]) => {
        slots[day][meal] = src[meal] ? String(src[meal]) : null;
      });
    });
    return slots;
  }
  function focusMonday() {
    const data = read();
    if (data.focus && parseIso(data.focus)) return data.focus;
    return thisMonday();
  }
  function setFocus(start) {
    const data = read();
    data.focus = start;
    data.weeks = data.weeks || {};
    if (!data.weeks[start]) data.weeks[start] = blankWeek();
    write(data);
  }
  function getSlots(start) {
    const data = read();
    return normaliseWeek(data.weeks && data.weeks[start]);
  }
  function saveSlots(start, slots) {
    const data = read();
    data.focus = start;
    data.weeks = data.weeks || {};
    data.weeks[start] = slots;
    write(data);
  }

  function findRecipe(id) {
    const key = String(id);
    const lists = [catalog, window.RECIPES || []];
    for (let i = 0; i < lists.length; i++) {
      const hit = lists[i].find(r => String(r.id) === key);
      if (hit) return hit;
    }
    const idx = parseInt(key, 10);
    if (Number.isFinite(idx) && window.RECIPES && window.RECIPES[idx]) return window.RECIPES[idx];
    return null;
  }

  function addToShoppingList(id) {
    const key = String(id);
    let ids = [];
    try { ids = JSON.parse(localStorage.getItem(PLAN_KEY) || "[]"); } catch (e) { ids = []; }
    if (!Array.isArray(ids)) ids = [];
    if (!ids.map(String).includes(key)) {
      ids.push(key);
      localStorage.setItem(PLAN_KEY, JSON.stringify(ids));
    }
  }

  function planIds() {
    try {
      const ids = JSON.parse(localStorage.getItem(PLAN_KEY) || "[]");
      return Array.isArray(ids) ? ids.map(String) : [];
    } catch (e) {
      return [];
    }
  }

  function preferMeal(recipe) {
    const tags = ((recipe && recipe.tags) || []).map(t => String(t).toLowerCase());
    if (tags.some(t => t.includes("breakfast"))) return "breakfast";
    if (tags.some(t => t.includes("sweet"))) return "dessert";
    if (tags.some(t => t.includes("snack"))) return "snack";
    return "dinner";
  }

  function dayOrder(startIso) {
    const start = parseIso(startIso) || mondayOf(new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const names = DAYS.map(d => d[0]);
    if (iso(start) !== thisMonday()) return names;
    const idx = Math.min(6, Math.max(0, Math.round((today - start) / 86400000)));
    return names.slice(idx).concat(names.slice(0, idx));
  }

  /* Puts the recipe in the next open slot. Breakfast and sweet recipes
     land in those rows; everything else starts at dinner. */
  function placeNext(id, recipeHint) {
    const key = String(id);
    const start = focusMonday();
    const slots = getSlots(start);
    const recipe = recipeHint || findRecipe(key);
    const preferred = preferMeal(recipe);
    const order = [preferred].concat(MEALS.map(m => m[0]).filter(m => m !== preferred));
    const days = dayOrder(start);
    for (let i = 0; i < order.length; i++) {
      const meal = order[i];
      for (let d = 0; d < days.length; d++) {
        const day = days[d];
        if (!slots[day][meal]) {
          slots[day][meal] = key;
          saveSlots(start, slots);
          return placedInfo(day, meal);
        }
      }
    }
    return null;
  }

  function placedInfo(day, meal) {
    const d = DAYS.find(x => x[0] === day);
    const m = MEALS.find(x => x[0] === meal);
    return { day: day, dayLabel: d ? d[1] : day, meal: meal, mealLabel: m ? m[1] : meal };
  }
  function placedMessage(placed) {
    if (!placed) return "This week is full. Open your week and drag the meal onto a slot.";
    return "Added to " + placed.dayLabel + " " + placed.mealLabel.toLowerCase();
  }

  function assignments(start, id) {
    const slots = getSlots(start);
    const out = [];
    DAYS.forEach(([day, label, short]) => {
      MEALS.forEach(([meal, mealLabel]) => {
        if (slots[day][meal] === String(id)) out.push({ day: day, short: short, label: label, meal: meal, mealLabel: mealLabel });
      });
    });
    return out;
  }

  window.RecipyWeek = {
    DAYS: DAYS,
    MEALS: MEALS,
    addToShoppingList: addToShoppingList,
    placeNext: placeNext,
    placedMessage: placedMessage,
    findRecipe: findRecipe
  };

  /* ---------- week page ---------- */
  function photo(r) {
    if (!r || !r.photo) return "";
    return /unsplash\.com/.test(r.photo) ? r.photo + "?auto=format&fit=crop&w=280&q=60" : r.photo;
  }
  function href(r) {
    if (r && r.slug) return "recipe.html?slug=" + encodeURIComponent(r.slug);
    return "index.html";
  }

  let focus = thisMonday();
  let drag = null;

  function rangeLabel(startIso) {
    const start = parseIso(startIso);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const month = end.toLocaleDateString("en-GB", { month: "long" });
    if (start.getMonth() === end.getMonth()) return start.getDate() + "–" + end.getDate() + " " + month;
    const a = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const b = end.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return a + " – " + b;
  }

  function render() {
    const root = document.getElementById("weekApp");
    if (!root) return;
    const scroller = document.getElementById("weekScroll");
    const keep = scroller ? scroller.scrollLeft : 0;
    const slots = getSlots(focus);
    const todayIso = iso(new Date());
    const monday = parseIso(focus);
    const planned = planIds().map(id => findRecipe(id)).filter(Boolean);
    const count = DAYS.reduce((n, [day]) => n + MEALS.filter(([meal]) => slots[day][meal]).length, 0);

    const heads = DAYS.map(([day, , short], i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const isToday = iso(date) === todayIso;
      return `<div class="wk-dayhead${isToday ? " is-today" : ""}" role="columnheader">${short}<small>${date.getDate()}</small></div>`;
    }).join("");

    const rows = MEALS.map(([meal, label]) => {
      const cells = DAYS.map(([day, dayLabel]) => {
        const id = slots[day][meal];
        const recipe = id ? findRecipe(id) : null;
        const name = recipe ? tidy(recipe.title) : (id ? "Recipe unavailable" : "");
        return `
          <div class="wk-slot${id ? " is-filled" : ""}" data-day="${day}" data-meal="${meal}" role="gridcell" aria-label="${esc(dayLabel)} ${esc(label)}${name ? ", " + esc(name) : ", empty"}">
            ${id ? `
              <article class="wk-card" data-from="slot" data-id="${esc(id)}" data-day="${day}" data-meal="${meal}">
                ${recipe && recipe.photo ? `<img src="${esc(photo(recipe))}" alt="" />` : `<span class="wk-ph" aria-hidden="true"></span>`}
                <a href="${recipe ? href(recipe) : "index.html"}">${esc(name)}</a>
                <button type="button" class="wk-clear" data-clear="${day}:${meal}" aria-label="Remove from ${esc(dayLabel)} ${esc(label)}">×</button>
              </article>` : `<span class="wk-hint">Drop here</span>`}
          </div>`;
      }).join("");
      return `<div class="wk-meal" role="rowheader">${label}</div>${cells}`;
    }).join("");

    const chips = planned.length ? planned.map(r => {
      const where = assignments(focus, r.id);
      const note = where.length
        ? where.slice(0, 2).map(w => w.short + " " + w.mealLabel.toLowerCase()).join(", ") + (where.length > 2 ? "…" : "")
        : "Drag onto a day";
      return `
        <article class="wk-chip" data-from="tray" data-id="${esc(r.id)}">
          ${r.photo ? `<img src="${esc(photo(r))}" alt="" />` : `<span class="wk-ph" aria-hidden="true"></span>`}
          <span class="wk-chip-copy">
            <strong>${esc(tidy(r.title))}</strong>
            <small>${esc(note)}</small>
          </span>
          <button type="button" class="wk-add" data-add="${esc(r.id)}">Add</button>
        </article>`;
    }).join("") : `
      <p class="wk-empty">Nothing on the shopping list yet. Choose a few recipes, then drag them onto the week.</p>
      <a class="wk-go" href="index.html">Choose recipes</a>`;

    root.innerHTML = `
      <header class="wk-head">
        <div>
          <p class="wk-kicker">Your week</p>
          <h1>${esc(rangeLabel(focus))}</h1>
          <p class="wk-lead">${count ? count + (count === 1 ? " meal" : " meals") + " planned." : "Nothing planned yet."} Drag a recipe from your shopping list into breakfast, lunch, dinner, dessert or snacks.</p>
        </div>
        <div class="wk-switch">
          <button type="button" id="weekPrev" aria-label="Previous week">←</button>
          <button type="button" id="weekThis"${focus === thisMonday() ? " hidden" : ""}>This week</button>
          <button type="button" id="weekNext" aria-label="Next week">→</button>
        </div>
      </header>
      <section class="wk-tray" aria-label="Recipes on your shopping list">
        <div class="wk-tray-head">
          <h2>On your shopping list</h2>
          <p>Hold and drag, or tap Add and we'll use the next open slot.</p>
        </div>
        <div class="wk-chips">${chips}</div>
      </section>
      <div class="wk-scroll" id="weekScroll">
        <div class="wk-board" role="grid" aria-label="Meal plan">${`<div class="wk-corner"></div>` + heads + rows}</div>
      </div>`;

    const nextScroll = document.getElementById("weekScroll");
    if (nextScroll) nextScroll.scrollLeft = keep;
    bind();
  }

  function shiftWeek(delta) {
    const d = parseIso(focus) || mondayOf(new Date());
    d.setDate(d.getDate() + delta * 7);
    focus = iso(d);
    setFocus(focus);
    render();
  }

  function bind() {
    const prev = document.getElementById("weekPrev");
    const next = document.getElementById("weekNext");
    const now = document.getElementById("weekThis");
    if (prev) prev.addEventListener("click", () => shiftWeek(-1));
    if (next) next.addEventListener("click", () => shiftWeek(1));
    if (now) now.addEventListener("click", () => { focus = thisMonday(); setFocus(focus); render(); });

    document.querySelectorAll("[data-add]").forEach(btn => {
      btn.addEventListener("click", () => {
        const recipe = findRecipe(btn.dataset.add);
        const placed = placeNext(btn.dataset.add, recipe);
        toast(placedMessage(placed));
        render();
      });
    });
    document.querySelectorAll("[data-clear]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const parts = btn.dataset.clear.split(":");
        const slots = getSlots(focus);
        if (slots[parts[0]]) slots[parts[0]][parts[1]] = null;
        saveSlots(focus, slots);
        render();
      });
    });
    document.querySelectorAll(".wk-chip, .wk-card").forEach(el => makeDraggable(el));
  }

  function toast(msg) {
    if (window.AppShell && window.AppShell.toast) window.AppShell.toast(msg);
  }

  function makeDraggable(el) {
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      if (e.target.closest("a, button")) return;
      const startX = e.clientX;
      const startY = e.clientY;
      const pid = e.pointerId;
      let active = false;
      let ghost = null;

      const move = (ev) => {
        if (ev.pointerId !== pid) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!active && Math.hypot(dx, dy) < 8) return;
        if (!active) {
          active = true;
          el.classList.add("is-dragging");
          try { el.setPointerCapture(pid); } catch (err) {}
          ghost = document.createElement("div");
          ghost.className = "wk-ghost";
          ghost.textContent = (el.querySelector("strong, a") || el).textContent.trim();
          document.body.appendChild(ghost);
        }
        ev.preventDefault();
        ghost.style.left = ev.clientX + 12 + "px";
        ghost.style.top = ev.clientY + 12 + "px";
        markDrop(ev.clientX, ev.clientY);
      };
      const up = (ev) => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
        document.querySelectorAll(".wk-slot.is-drop").forEach(s => s.classList.remove("is-drop"));
        if (ghost) ghost.remove();
        el.classList.remove("is-dragging");
        if (!active) return;
        const slot = slotAt(ev.clientX, ev.clientY);
        if (slot) dropOn(el, slot);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    });
  }

  function slotAt(x, y) {
    const stack = document.elementsFromPoint(x, y);
    for (let i = 0; i < stack.length; i++) {
      const slot = stack[i].closest && stack[i].closest(".wk-slot");
      if (slot) return slot;
    }
    return null;
  }
  function markDrop(x, y) {
    document.querySelectorAll(".wk-slot.is-drop").forEach(s => s.classList.remove("is-drop"));
    const slot = slotAt(x, y);
    if (slot) slot.classList.add("is-drop");
  }

  function dropOn(el, slot) {
    const day = slot.dataset.day;
    const meal = slot.dataset.meal;
    const slots = getSlots(focus);
    const id = String(el.dataset.id);
    if (el.dataset.from === "slot") {
      const fromDay = el.dataset.day;
      const fromMeal = el.dataset.meal;
      if (fromDay === day && fromMeal === meal) return;
      const moving = slots[fromDay][fromMeal];
      const occupant = slots[day][meal];
      slots[fromDay][fromMeal] = occupant;
      slots[day][meal] = moving;
    } else {
      slots[day][meal] = id;
    }
    saveSlots(focus, slots);
    render();
  }

  async function loadCatalog() {
    try {
      if (window.RECIPY && window.RECIPY.recipes) {
        const list = await window.RECIPY.recipes.getAll({ fresh: true });
        if (list && list.length) catalog = list.slice();
      }
    } catch (e) {}
    if (!catalog.length) catalog = (window.RECIPES || []).slice();
  }

  async function boot() {
    if (!document.getElementById("weekApp")) return;
    focus = focusMonday();
    setFocus(focus);
    await loadCatalog();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
