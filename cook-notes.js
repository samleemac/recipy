/* ============================================================
   Recipy — private cook notes (Cook Mode)
   Notes you leave for yourself, pinned to the exact part of a
   step (or the whole step, or the whole recipe). Next time you
   cook, each note quietly appears right where it matters.

   Signed in  → saved to your account (Supabase, owner-only RLS)
   Signed out → saved on this device, with a nudge to sign in
   Table missing (migration not run yet) → falls back to device
   ============================================================ */
(function () {
  const MAX = 500;
  const QUICK = [
    "Took longer than it says",
    "Needed more seasoning",
    "Hob runs hot: lower the heat",
    "Make double next time",
    "Swap worked well",
    "Everyone loved this"
  ];

  let host, panel, btn;
  let notes = [];              // current recipe's notes, newest first
  let mode = "device";         // "account" | "device"
  let reason = "";             // why we're on device: "signed-out" | "no-table" | "no-backend" | "error"
  let deviceCount = 0;         // device notes waiting to move to the account
  let loadedFor = "";
  let pin = "part";            // "part" | "step" | "recipe"
  let draft = "";
  let editing = null, confirmDel = null, confirmTimer = null;
  let busy = false;

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const C = () => window.RecipyCook;
  const api = () => window.RECIPY && window.RECIPY.cookNotes;

  /* ---------- device storage ---------- */
  const devKey = slug => `recipy.cooknotes.${slug}`;
  function devRead(slug) { try { const a = JSON.parse(localStorage.getItem(devKey(slug)) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function devWrite(slug, arr) { try { localStorage.setItem(devKey(slug), JSON.stringify(arr.slice(0, 200))); } catch (e) {} }

  /* ---------- loading ---------- */
  async function load(force) {
    const slug = host.slug();
    if (!slug) return;
    if (!force && loadedFor === slug && mode === "account") { paint(); return; }
    loadedFor = slug;
    const local = devRead(slug);
    if (api()) {
      try {
        notes = await api().list(slug);
        mode = "account"; reason = "";
        deviceCount = local.length;
        paint(); return;
      } catch (e) {
        reason = e.code || "error";
        if (e.code !== "signed-out" && e.code !== "no-table" && e.code !== "no-backend") console.warn("cook notes", e);
      }
    } else reason = "no-backend";
    mode = "device";
    notes = local.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    deviceCount = 0;
    paint();
  }

  /* ---------- CRUD (account or device) ---------- */
  async function add(body, where) {
    body = String(body || "").trim().slice(0, MAX);
    if (!body) return null;
    const slug = host.slug();
    const rec = { step: where.step, part: where.part, body, slug };
    if (mode === "account") {
      try { const n = await api().add(rec); notes.unshift(n); return n; }
      catch (e) { if (e.code !== "no-table") { host.toast("Couldn't save that note. Check your connection."); return null; } mode = "device"; reason = "no-table"; }
    }
    const n = { id: "local-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), recipe_slug: slug, step_index: where.step, part_index: where.part, body, created_at: new Date().toISOString() };
    const all = devRead(slug); all.unshift(n); devWrite(slug, all);
    notes.unshift(n);
    return n;
  }
  async function update(id, body) {
    body = String(body || "").trim().slice(0, MAX);
    if (!body) return;
    const n = notes.find(x => x.id === id); if (!n) return;
    if (mode === "account" && !String(id).startsWith("local-")) {
      try { const u = await api().update(id, body); Object.assign(n, u); } catch (e) { host.toast("Couldn't update that note"); }
      return;
    }
    n.body = body;
    devWrite(host.slug(), devRead(host.slug()).map(x => x.id === id ? Object.assign(x, { body }) : x));
  }
  async function remove(id) {
    if (mode === "account" && !String(id).startsWith("local-")) {
      try { await api().remove(id); } catch (e) { host.toast("Couldn't delete that note"); return; }
    } else devWrite(host.slug(), devRead(host.slug()).filter(x => x.id !== id));
    notes = notes.filter(x => x.id !== id);
  }
  async function moveDeviceNotes() {
    const slug = host.slug(), local = devRead(slug);
    let moved = 0;
    for (const n of local.slice().reverse()) {
      try { const r = await api().add({ slug, step: n.step_index, part: n.part_index, body: n.body }); notes.unshift(r); moved++; } catch (e) { break; }
    }
    if (moved === local.length) devWrite(slug, []); else devWrite(slug, local.slice(0, local.length - moved));
    deviceCount = devRead(slug).length;
    notes.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    host.toast(moved ? `Moved ${moved} note${moved === 1 ? "" : "s"} to your account` : "Couldn't move your notes");
  }

  /* ---------- helpers ---------- */
  function when(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const now = new Date();
    const opts = { day: "numeric", month: "short" };
    if (d.getFullYear() !== now.getFullYear()) opts.year = "numeric";
    const days = Math.floor((now - d) / 86400000);
    if (days === 0 && now.getDate() === d.getDate()) return "Today";
    if (days < 2 && new Date(now - 86400000).getDate() === d.getDate()) return "Yesterday";
    return d.toLocaleDateString(undefined, opts);
  }
  function where(n) {
    if (n.step_index == null) return "Whole recipe";
    const t = C() ? C().stepTitle(n.step_index) : "";
    return `Step ${n.step_index + 1}${n.part_index != null ? ` · part ${n.part_index + 1}` : ""}${t ? ` · ${t}` : ""}`;
  }
  function here() {
    const p = C() ? C().position() : { gather: true };
    if (p.gather || p.checkpoint) return { step: null, part: null, label: "Whole recipe", at: p };
    return { step: p.step, part: p.part, at: p };
  }
  function pinTarget() {
    const h = here();
    if (h.step == null || pin === "recipe") return { step: null, part: null };
    if (pin === "step") return { step: h.step, part: null };
    return { step: h.step, part: h.part };
  }
  const forPart = (s, p) => notes.filter(n => n.step_index === s && (n.part_index === p || (n.part_index == null && p === 0)));

  /* ---------- inline (inside Cook Mode content) ---------- */
  function noteCard(n, cls) {
    return `<button type="button" class="cn-stick${cls ? " " + cls : ""}" data-cn-open="${esc(n.id)}">
      <span class="cn-stick-head"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>Your note · ${esc(when(n.created_at))}</span>
      <span class="cn-stick-body">${esc(n.body)}</span>
    </button>`;
  }
  function inlineHtml(step, part) {
    const list = forPart(step, part);
    if (!list.length) return "";
    return `<div class="cn-inline">${list.slice(0, 2).map(n => noteCard(n)).join("")}${list.length > 2 ? `<button type="button" class="cn-more" data-cn-open>+${list.length - 2} more note${list.length - 2 === 1 ? "" : "s"}</button>` : ""}</div>`;
  }
  function stepHtml(step) {
    const list = notes.filter(n => n.step_index === step);
    if (!list.length) return "";
    return `<div class="cn-heads"><span class="cn-heads-label">Heads up · your note${list.length > 1 ? "s" : ""} on this step</span>${list.slice(0, 2).map(n => noteCard(n)).join("")}</div>`;
  }
  function gatherHtml() {
    if (!notes.length) return "";
    const top = notes.slice(0, 3);
    return `<section class="cn-gather" aria-label="Your notes">
      <div class="cn-gather-head"><span>📝 Your notes from last time</span>${notes.length > 3 ? `<button type="button" class="cn-link" data-cn-open>See all ${notes.length}</button>` : ""}</div>
      ${top.map(n => `<button type="button" class="cn-gather-note" data-cn-open="${esc(n.id)}"><b>${esc(where(n).split(" · ").slice(0, 2).join(" · "))}</b> ${esc(n.body)}</button>`).join("")}
    </section>`;
  }

  /* ---------- header button ---------- */
  function paintButton() {
    if (!btn) return;
    btn.querySelector(".cn-count").textContent = notes.length ? notes.length : "";
    btn.classList.toggle("has-notes", notes.length > 0);
    btn.setAttribute("aria-label", notes.length ? `Your notes (${notes.length})` : "Add a note");
  }
  function ensureButton() {
    if (btn && document.contains(btn)) return;
    const box = document.querySelector(".cf-controls");
    if (!box) return;
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cf-ctrl cn-btn";
    btn.id = "cnBtn";
    btn.title = "Private notes for this recipe";
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.5 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"></path><path d="M15 3v5h5"></path><line x1="8" y1="13" x2="15" y2="13"></line><line x1="8" y1="17" x2="12" y2="17"></line></svg><span>Notes</span><b class="cn-count"></b>`;
    box.insertBefore(btn, box.querySelector("#cfSpeak"));
    btn.addEventListener("click", () => (panel && panel.classList.contains("open") ? close() : open()));
  }

  /* ---------- panel ---------- */
  function ensurePanel() {
    if (panel) return;
    panel = document.createElement("aside");
    panel.className = "cn-panel";
    panel.id = "cnPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Your private notes");
    panel.hidden = true;
    document.getElementById("cookmode").appendChild(panel);
    panel.addEventListener("click", onPanelClick);
    panel.addEventListener("input", e => {
      if (e.target.id === "cnText") { draft = e.target.value; const c = panel.querySelector(".cn-chars"); if (c) c.textContent = `${draft.length}/${MAX}`; panel.querySelector("[data-cn-save]").disabled = !draft.trim(); }
    });
    panel.addEventListener("keydown", e => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (e.target.id === "cnText") { e.preventDefault(); save(); }
        if (e.target.matches("[data-cn-edit-text]")) { e.preventDefault(); const b = panel.querySelector("[data-cn-edit-save]"); if (b) b.click(); }
      }
    });
  }

  function paintPanel() {
    if (!panel || panel.hidden) return;
    const h = here();
    const atStep = h.step != null;
    if (!atStep) pin = "recipe";
    const target = pinTarget();
    const keepFocus = document.activeElement && panel.contains(document.activeElement) ? document.activeElement.id : null;

    const groups = [];
    if (atStep) {
      const hereList = notes.filter(n => n.step_index === h.step && (n.part_index === h.part || n.part_index == null));
      if (hereList.length) groups.push(["Right here", hereList]);
    }
    const shown = new Set(groups.flatMap(g => g[1].map(n => n.id)));
    const whole = notes.filter(n => n.step_index == null && !shown.has(n.id));
    if (whole.length) groups.push(["Whole recipe", whole]);
    const rest = notes.filter(n => n.step_index != null && !shown.has(n.id))
      .sort((a, b) => (a.step_index - b.step_index) || ((a.part_index ?? -1) - (b.part_index ?? -1)));
    if (rest.length) groups.push([atStep ? "Other steps" : "By step", rest]);

    const status = mode === "account"
      ? `<span class="cn-lock"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>Private · only you can see these</span>`
      : `<span class="cn-lock is-device">Saved on this device only</span>`;

    panel.innerHTML = `
      <div class="cn-head">
        <div><h3>Your notes</h3>${status}</div>
        <button type="button" class="cn-x" data-cn-close aria-label="Close notes">×</button>
      </div>

      ${mode === "device" && reason === "signed-out" ? `<div class="cn-banner"><span>Sign in to keep notes private to your account and see them on any device.</span><button type="button" data-cn-signin>Sign in</button></div>` : ""}
      ${mode === "account" && deviceCount ? `<div class="cn-banner"><span>${deviceCount} note${deviceCount === 1 ? " is" : "s are"} saved on this device from before you signed in.</span><button type="button" data-cn-move>Move to my account</button></div>` : ""}

      <div class="cn-compose">
        <label class="cn-label" for="cnText">${atStep ? `New note` : "New note for this recipe"}</label>
        ${atStep ? `
        <div class="cn-pins" role="radiogroup" aria-label="Pin this note to">
          <button type="button" role="radio" aria-checked="${pin === "part"}" class="${pin === "part" ? "is-on" : ""}" data-cn-pin="part">This part</button>
          <button type="button" role="radio" aria-checked="${pin === "step"}" class="${pin === "step" ? "is-on" : ""}" data-cn-pin="step">Step ${h.step + 1}</button>
          <button type="button" role="radio" aria-checked="${pin === "recipe"}" class="${pin === "recipe" ? "is-on" : ""}" data-cn-pin="recipe">Whole recipe</button>
        </div>
        ${pin === "part" ? `<p class="cn-context">“${esc(C().partText(h.step, h.part).slice(0, 90))}${C().partText(h.step, h.part).length > 90 ? "…" : ""}”</p>` : ""}` : ""}
        <textarea id="cnText" rows="3" maxlength="${MAX}" placeholder="${atStep ? "e.g. 8 min, not 6 — my hob runs cool" : "e.g. Halve the chilli for the kids"}">${esc(draft)}</textarea>
        <div class="cn-quick">${QUICK.map(q => `<button type="button" data-cn-quick="${esc(q)}">${esc(q)}</button>`).join("")}</div>
        <div class="cn-compose-foot">
          <span class="cn-chars">${draft.length}/${MAX}</span>
          <button type="button" class="cn-save" data-cn-save ${draft.trim() && !busy ? "" : "disabled"}>Save note</button>
        </div>
      </div>

      <div class="cn-list">
        ${!notes.length ? `<p class="cn-empty">No notes yet. Jot down anything you'd want to know next time: timings that ran long, swaps, how spicy it came out. Each note shows up again at the exact moment it's useful.</p>` : ""}
        ${groups.map(([label, list]) => `
          <section class="cn-group"><h4>${esc(label)}</h4>
            ${list.map(n => editing === n.id ? `
              <div class="cn-note is-editing">
                <textarea data-cn-edit-text maxlength="${MAX}" rows="3">${esc(n.body)}</textarea>
                <div class="cn-note-actions"><button type="button" data-cn-edit-cancel>Cancel</button><button type="button" class="cn-save" data-cn-edit-save="${esc(n.id)}">Save</button></div>
              </div>` : `
              <div class="cn-note">
                <p>${esc(n.body)}</p>
                <div class="cn-note-meta">
                  ${n.step_index != null ? `<button type="button" class="cn-jump" data-cn-goto="${n.step_index}" data-part="${n.part_index ?? 0}">${esc(where(n))} →</button>` : `<span>Whole recipe</span>`}
                  <span>· ${esc(when(n.created_at))}</span>
                  <span class="cn-note-actions">
                    <button type="button" data-cn-edit="${esc(n.id)}">Edit</button>
                    <button type="button" class="${confirmDel === n.id ? "is-confirm" : ""}" data-cn-del="${esc(n.id)}">${confirmDel === n.id ? "Tap again to delete" : "Delete"}</button>
                  </span>
                </div>
              </div>`).join("")}
          </section>`).join("")}
      </div>`;
    if (keepFocus) { const el = panel.querySelector("#" + keepFocus); if (el) el.focus(); }
    const et = panel.querySelector("[data-cn-edit-text]"); if (et && document.activeElement !== et) { et.focus(); et.setSelectionRange(et.value.length, et.value.length); }
    void target;
  }

  function paint() {
    ensureButton(); paintButton(); paintPanel();
    if (C()) C().rerender();
  }

  async function save() {
    if (busy || !draft.trim()) return;
    busy = true;
    const target = pinTarget();
    const n = await add(draft, target);
    busy = false;
    if (n) {
      draft = "";
      host.toast(target.step == null ? "Note saved to this recipe" : `Note pinned to step ${target.step + 1}`);
    }
    paint();
    const t = panel && panel.querySelector("#cnText"); if (t) t.focus();
  }

  async function quickAdd(text) {
    const h = here();
    const n = await add(text, { step: h.step, part: h.part });
    if (n) host.toast(`📝 Noted${h.step != null ? ` on step ${h.step + 1}` : ""}: “${text.slice(0, 40)}”`);
    paint();
  }

  async function onPanelClick(e) {
    const t = e.target;
    if (t.closest("[data-cn-close]")) { close(); return; }
    const p = t.closest("[data-cn-pin]"); if (p) { pin = p.dataset.cnPin; paintPanel(); return; }
    const q = t.closest("[data-cn-quick]");
    if (q) {
      draft = (draft.trim() ? draft.trim().replace(/[.!]?$/, ". ") : "") + q.dataset.cnQuick;
      paintPanel();
      const ta = panel.querySelector("#cnText"); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
      return;
    }
    if (t.closest("[data-cn-save]")) { save(); return; }
    const ed = t.closest("[data-cn-edit]"); if (ed) { editing = ed.dataset.cnEdit; paintPanel(); return; }
    if (t.closest("[data-cn-edit-cancel]")) { editing = null; paintPanel(); return; }
    const es = t.closest("[data-cn-edit-save]");
    if (es) { const v = panel.querySelector("[data-cn-edit-text]").value; await update(es.dataset.cnEditSave, v); editing = null; paint(); return; }
    const del = t.closest("[data-cn-del]");
    if (del) {
      const id = del.dataset.cnDel;
      if (confirmDel === id) { clearTimeout(confirmTimer); confirmDel = null; await remove(id); paint(); host.toast("Note deleted"); return; }
      confirmDel = id; paintPanel();
      clearTimeout(confirmTimer); confirmTimer = setTimeout(() => { confirmDel = null; paintPanel(); }, 3500);
      return;
    }
    const go = t.closest("[data-cn-goto]");
    if (go && C()) {
      C().goTo(parseInt(go.dataset.cnGoto, 10), parseInt(go.dataset.part, 10) || 0);
      if (matchMedia("(max-width: 760px)").matches) close(); else paintPanel();
      return;
    }
    if (t.closest("[data-cn-signin]")) { close(); if (window.AppShell) window.AppShell.openAuthModal("signin"); return; }
    if (t.closest("[data-cn-move]")) { t.closest("[data-cn-move]").disabled = true; await moveDeviceNotes(); paint(); }
  }

  function open() {
    ensurePanel();
    const h = here();
    pin = h.step == null ? "recipe" : "part";
    panel.hidden = false;
    paintPanel();
    requestAnimationFrame(() => panel.classList.add("open"));
    if (btn) btn.setAttribute("aria-expanded", "true");
    const ta = panel.querySelector("#cnText");
    if (ta && !matchMedia("(pointer: coarse)").matches) ta.focus({ preventScroll: true });
  }
  function close() {
    if (!panel || panel.hidden) return;
    panel.classList.remove("open");
    editing = null;
    if (btn) { btn.setAttribute("aria-expanded", "false"); btn.focus({ preventScroll: true }); }
    setTimeout(() => { if (!panel.classList.contains("open")) panel.hidden = true; }, 220);
  }

  function mount(h) {
    host = h;
    /* open the panel from note cards inside the cook stage */
    document.addEventListener("click", e => {
      const o = e.target.closest("[data-cn-open]");
      if (o && document.getElementById("cookmode").contains(o)) { e.stopPropagation(); open(); }
    });
    /* Escape closes the notes panel, not Cook Mode */
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && panel && panel.classList.contains("open")) { e.stopPropagation(); e.preventDefault(); close(); }
    }, true);
    ensureButton();
  }

  /* called whenever Cook Mode opens, and after sign-in/out */
  function onOpen() { ensureButton(); load(true); }
  function onClose() { close(); }

  window.RecipyNotes = { mount, onOpen, onClose, inlineHtml, gatherHtml, stepHtml, quickAdd, reload: () => load(true), _state: () => ({ mode, reason, notes: notes.length }) };
})();
