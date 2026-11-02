/* ============================================================
   Recipy — shopping list panel + "Send list"
   Drives the #shopModal drawer on index.html using RecipyShop.
   host = {
     planEntries() → [{ id, recipe, servings }],
     setServings(id, n), checked() → Set, saveChecked(Set),
     recipes() → all recipes, addToPlan(ids), toast(msg), escapeHtml
   }
   ============================================================ */
(function () {
  const S = () => window.RecipyShop;
  let host, shared = null; // shared: { entries, from, checkKey }
  let sheetOpen = false;

  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const tidyTitle = t => String(t || "").replace(/\s*\(changes needed\)\s*$/i, "");

  /* ---------- state helpers ---------- */
  function entries() { return shared ? shared.entries : host.planEntries(); }
  function getChecked() {
    if (!shared) return host.checked();
    try { return new Set(JSON.parse(localStorage.getItem(shared.checkKey) || "[]")); } catch (e) { return new Set(); }
  }
  function saveChecked(set) {
    if (!shared) return host.saveChecked(set);
    try { localStorage.setItem(shared.checkKey, JSON.stringify([...set])); } catch (e) {}
  }
  function extras() { return shared ? shared.extras : S().getExtras(); }

  function currentList() { return S().build(entries(), extras()); }

  function shareLink() {
    const payload = {
      r: entries().filter(e => e.recipe && e.recipe.slug).map(e => [e.recipe.slug, e.servings]),
      x: extras()
    };
    const p = window.AppShell && window.AppShell.profile && window.AppShell.profile();
    const from = shared ? shared.from : (p && (p.display_name || p.username)) || "";
    if (from) payload.f = from.split(/\s+/)[0];
    return `${location.origin}${location.pathname}?list=${S().encode(payload)}`;
  }

  /* ---------- render ---------- */
  function render() {
    const body = $("#shopBody");
    const sub = $("#shopSubhead");
    const title = $("#shopModal h2");
    const ents = entries().filter(e => e.recipe);

    title.textContent = shared ? `${shared.from ? shared.from + "'s" : "A friend's"} shopping list` : "Shopping list";

    if (!ents.length && !extras().length) {
      sub.textContent = "Nothing on it yet";
      body.innerHTML = `
        <div class="shop-empty sl-empty">
          <span aria-hidden="true">🛒</span>
          <strong>Your list is empty</strong>
          <p>Tap <b>+</b> on any recipe card to add it. We'll merge the ingredients into one list, sorted by aisle.</p>
        </div>`;
      $("#shopSendBtn").disabled = true;
      return;
    }
    $("#shopSendBtn").disabled = false;

    const list = currentList();
    const checked = getChecked();
    const all = list.aisles.flatMap(a => a.items);
    const done = all.filter(i => checked.has(i.key)).length;
    const pct = all.length ? Math.round(done / all.length * 100) : 0;
    sub.textContent = `${all.length} item${all.length === 1 ? "" : "s"} · ${ents.length} recipe${ents.length === 1 ? "" : "s"}`;

    body.innerHTML = `
      ${shared ? `
        <div class="sl-shared">
          <p><b>Shared with you.</b> Tick things off as you shop; your ticks stay on this phone.</p>
          <button type="button" class="sl-btn-ghost" data-adopt>Add these recipes to my plan</button>
        </div>` : ""}

      <div class="sl-progress" aria-live="polite">
        <div class="sl-progress-bar"><span style="width:${pct}%"></span></div>
        <span>${done === all.length && all.length ? "All in the basket 🎉" : `${done} of ${all.length} in the basket`}</span>
      </div>

      <details class="sl-recipes"${shared ? " open" : ""}>
        <summary>
          <span>${ents.length} recipe${ents.length === 1 ? "" : "s"} · adjust servings</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </summary>
        ${ents.map(e => `
          <div class="shop-serving-row">
            <span class="sl-thumb" style="${e.recipe.photo ? `background-image:url(${esc(/unsplash\.com/.test(e.recipe.photo) ? e.recipe.photo + "?auto=format&fit=crop&w=120&q=60" : e.recipe.photo)})` : ""}" aria-hidden="true"></span>
            <span class="shop-serving-title">${esc(tidyTitle(e.recipe.title))}</span>
            <div class="shop-serving-stepper">
              <button class="shop-stepper-btn" data-serv="${esc(e.id)}" data-dir="-1" aria-label="Fewer servings of ${esc(tidyTitle(e.recipe.title))}" type="button">−</button>
              <span class="shop-stepper-val">${e.servings}</span>
              <button class="shop-stepper-btn" data-serv="${esc(e.id)}" data-dir="1" aria-label="More servings of ${esc(tidyTitle(e.recipe.title))}" type="button">+</button>
            </div>
          </div>`).join("")}
      </details>

      ${!shared ? `
      <form class="sl-add" data-add autocomplete="off">
        <label class="sr-only" for="slAddInput">Add your own item</label>
        <input id="slAddInput" type="text" maxlength="60" placeholder="Add anything else… e.g. oat milk, bin bags" />
        <button type="submit" aria-label="Add item">+</button>
      </form>` : ""}

      ${list.aisles.map(a => {
        const items = a.items.slice().sort((x, y) => (checked.has(x.key) - checked.has(y.key)));
        const left = items.filter(i => !checked.has(i.key)).length;
        return `
          <section class="shop-recipe-group sl-aisle${left === 0 ? " is-done" : ""}">
            <div class="shop-recipe-name"><span aria-hidden="true">${a.emoji}</span> ${esc(a.label)} <em>${left ? left : "✓"}</em></div>
            ${items.map(i => `
              <div class="shop-item sl-item${checked.has(i.key) ? " is-checked" : ""}" role="checkbox" tabindex="0" aria-checked="${checked.has(i.key)}" data-key="${esc(i.key)}">
                <span class="shop-item-check" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                <span class="sl-item-text">
                  <span class="sl-item-main">${i.amount ? `<span class="shop-amount">${esc(i.amount)}</span> ` : ""}${esc(i.name)}${i.optional ? ` <span class="sl-opt">optional</span>` : ""}</span>
                  ${i.recipes.length && ents.length > 1 ? `<span class="sl-for">for ${esc(i.recipes.map(t => t.split(/\s+/).slice(0, 3).join(" ")).join(", "))}</span>` : ""}
                </span>
                ${i.extra && !shared ? `<button type="button" class="sl-remove" data-remove="${esc(i.name)}" aria-label="Remove ${esc(i.name)}">×</button>` : ""}
              </div>`).join("")}
          </section>`;
      }).join("")}

      ${list.staples.length ? `
        <details class="sl-cupboard">
          <summary><span aria-hidden="true">🧂</span> Check the cupboard <em>${list.staples.length} staples</em>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </summary>
          <p>Most kitchens have these. Tap any you've run out of to put it on the list.</p>
          <div class="sl-staples">
            ${list.staples.map(s => `<button type="button" class="sl-staple${checked.has("need|" + s.key) ? " is-on" : ""}" aria-pressed="${checked.has("need|" + s.key)}" data-need="${esc(s.key)}">${esc(s.name)}${s.amount ? ` <small>${esc(s.amount)}</small>` : ""}</button>`).join("")}
          </div>
        </details>` : ""}`;

    if (sheetOpen) renderSheet();
  }

  /* staples the shopper flagged as "run out" are listed in shared text too */
  function neededStaples(list) {
    const checked = getChecked();
    return list.staples.filter(s => checked.has("need|" + s.key));
  }

  /* ---------- send sheet ---------- */
  function shareText(opts) {
    const list = currentList();
    const checked = getChecked();
    const need = neededStaples(list);
    const copy = {
      aisles: list.aisles.map(a => Object.assign({}, a)),
      staples: opts.cupboard ? list.staples.filter(s => !checked.has("need|" + s.key)) : []
    };
    if (need.length) copy.aisles.push({ label: "From the cupboard", emoji: "🧂", items: need });
    return S().toText(copy, {
      recipes: entries().filter(e => e.recipe).map(e => ({ title: e.recipe.title, servings: e.servings })),
      checked,
      skipChecked: opts.skipTicked,
      checkboxes: opts.checkboxes,
      link: opts.link ? shareLink() : ""
    });
  }

  function sheetOpts() {
    const box = $("#shopSheet");
    return {
      skipTicked: !!(box && box.querySelector("[data-opt=skip]") && box.querySelector("[data-opt=skip]").checked),
      cupboard: !!(box && box.querySelector("[data-opt=cupboard]") && box.querySelector("[data-opt=cupboard]").checked)
    };
  }

  function renderSheet() {
    const sheet = $("#shopSheet");
    const anyTicked = currentList().aisles.some(a => a.items.some(i => getChecked().has(i.key)));
    const prev = sheet.dataset.ready ? sheetOpts() : { skipTicked: true, cupboard: true };
    sheet.dataset.ready = "1";
    sheet.innerHTML = `
      <div class="sl-sheet-head">
        <h3>Send this list</h3>
        <button type="button" class="sl-sheet-close" data-sheet-close aria-label="Back to the list">×</button>
      </div>
      ${navigator.share ? `
        <button type="button" class="sl-share-main" data-send="native">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
          Share… <small>Notes, Reminders, WhatsApp, anywhere</small>
        </button>` : ""}
      <div class="sl-share-grid">
        <a class="sl-share" data-send="whatsapp" href="#" target="_blank" rel="noopener"><span class="sl-ico wa" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8.1 8.1 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-1-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.4 13.4 0 0 0 5.2 4.6c.7.3 1.3.5 1.7.6a4.2 4.2 0 0 0 1.9.1 3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.3-.6-.4M12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.8 9.8 0 1 1 8.3 4.6M20.5 3.5A11.8 11.8 0 0 0 1.9 17.7L.2 24l6.4-1.7A11.8 11.8 0 0 0 24 12a11.7 11.7 0 0 0-3.5-8.5"/></svg>
        </span>WhatsApp</a>
        <a class="sl-share" data-send="sms" href="#"><span class="sl-ico sms" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.5l1.5-4.6A8.4 8.4 0 1 1 21 11.5z"/></svg>
        </span>Messages</a>
        <a class="sl-share" data-send="email" href="#"><span class="sl-ico mail" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 6 12 13 2 6"/></svg>
        </span>Email</a>
        <button type="button" class="sl-share" data-send="notes"><span class="sl-ico notes" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>
        </span>Copy for Notes</button>
        <button type="button" class="sl-share" data-send="link"><span class="sl-ico link" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>
        </span>Copy live link</button>
        <button type="button" class="sl-share" data-send="print"><span class="sl-ico print" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        </span>Print</button>
      </div>
      <div class="sl-opts">
        ${anyTicked ? `<label><input type="checkbox" data-opt="skip"${prev.skipTicked ? " checked" : ""}> Leave out what's already in the basket</label>` : ""}
        <label><input type="checkbox" data-opt="cupboard"${prev.cupboard ? " checked" : ""}> Add a "check the cupboard" reminder</label>
      </div>
      <p class="sl-hint">Messages include a live link: your friend opens it and gets this exact list to tick off, with the servings you chose.</p>
      <details class="sl-preview"><summary>Preview the message</summary><pre data-preview></pre></details>`;
    updatePreview();
  }

  function updatePreview() {
    const pre = document.querySelector("#shopSheet [data-preview]");
    if (pre) pre.textContent = shareText(Object.assign(sheetOpts(), { link: true }));
  }

  function openSheet() {
    sheetOpen = true;
    const sheet = $("#shopSheet");
    renderSheet();
    sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add("open"));
    const first = sheet.querySelector("[data-send]");
    if (first) first.focus();
  }
  function closeSheet() {
    sheetOpen = false;
    const sheet = $("#shopSheet");
    sheet.classList.remove("open");
    setTimeout(() => { if (!sheetOpen) sheet.hidden = true; }, 250);
    $("#shopSendBtn").focus();
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (err) {}
      ta.remove(); return ok;
    }
  }

  async function send(kind, el) {
    const o = sheetOpts();
    const withLink = shareText(Object.assign({}, o, { link: true }));
    const enc = encodeURIComponent(withLink);
    if (kind === "native") {
      try { await navigator.share({ title: "Shopping list", text: shareText(Object.assign({}, o, { link: false })), url: shareLink() }); } catch (e) {}
      return;
    }
    if (kind === "whatsapp") { el.href = `https://wa.me/?text=${enc}`; return "follow"; }
    if (kind === "sms") { el.href = `sms:?&body=${enc}`; return "follow"; }
    if (kind === "email") { el.href = `mailto:?subject=${encodeURIComponent("Shopping list")}&body=${enc}`; return "follow"; }
    if (kind === "notes") {
      const ok = await copy(shareText(Object.assign({}, o, { link: false })));
      host.toast(ok ? "Copied. Paste into Notes, then tap the checklist button to make it tickable" : "Couldn't copy, try the preview below");
      return;
    }
    if (kind === "link") {
      const ok = await copy(shareLink());
      host.toast(ok ? "Live link copied. Anyone with it can open and tick off this list" : "Couldn't copy the link");
      return;
    }
    if (kind === "print") {
      printList(o);
    }
  }

  function printList(o) {
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) { host.toast("Allow pop-ups to print the list"); return; }
    const text = shareText(Object.assign({}, o, { link: false }));
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Shopping list</title>
      <style>body{font:15px/1.6 -apple-system,Segoe UI,Inter,sans-serif;margin:32px;color:#222}pre{white-space:pre-wrap;font:inherit}h1{font:700 22px Georgia,serif;margin:0 0 12px}</style>
      </head><body><h1>Shopping list</h1><pre>${esc(text.split("\n").slice(1).join("\n"))}</pre><script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  }

  /* ---------- events ---------- */
  function bind() {
    const modal = $("#shopModal");
    modal.addEventListener("click", async e => {
      const t = e.target;
      const item = t.closest(".sl-item");
      if (item && !t.closest("[data-remove]")) { toggleItem(item.dataset.key); return; }
      const rm = t.closest("[data-remove]");
      if (rm) {
        S().setExtras(S().getExtras().filter(x => x !== rm.dataset.remove));
        render(); return;
      }
      const sv = t.closest("[data-serv]");
      if (sv) {
        const ent = entries().find(x => String(x.id) === sv.dataset.serv);
        if (!ent) return;
        const n = Math.max(1, Math.min(20, ent.servings + parseInt(sv.dataset.dir, 10)));
        if (shared) ent.servings = n; else host.setServings(ent.id, n);
        const open = !!$(".sl-recipes[open]", modal);
        render();
        const det = $(".sl-recipes", modal); if (det && open) det.open = true;
        const again = modal.querySelector(`[data-serv="${CSS.escape(sv.dataset.serv)}"][data-dir="${sv.dataset.dir}"]`);
        if (again) again.focus();
        return;
      }
      const need = t.closest("[data-need]");
      if (need) {
        const k = "need|" + need.dataset.need;
        const set = getChecked(); if (set.has(k)) set.delete(k); else set.add(k); saveChecked(set);
        need.classList.toggle("is-on", set.has(k)); need.setAttribute("aria-pressed", set.has(k));
        if (sheetOpen) updatePreview();
        return;
      }
      if (t.closest("[data-adopt]")) {
        host.addToPlan(shared.entries);
        host.toast("Added to your plan");
        exitShared();
        return;
      }
      if (t.closest("#shopSendBtn")) { openSheet(); return; }
      if (t.closest("[data-sheet-close]")) { closeSheet(); return; }
      const s = t.closest("[data-send]");
      if (s) {
        const r = await send(s.dataset.send, s);
        if (r !== "follow") e.preventDefault();
      }
    });
    /* links need their href before the browser follows them */
    modal.addEventListener("pointerdown", e => {
      const s = e.target.closest("a[data-send]");
      if (s) send(s.dataset.send, s);
    });
    modal.addEventListener("keydown", e => {
      const s = e.target.closest("a[data-send]");
      if (s && e.key === "Enter") send(s.dataset.send, s);
      const item = e.target.closest(".sl-item");
      if (item && (e.key === " " || e.key === "Enter")) { e.preventDefault(); toggleItem(item.dataset.key, true); }
      if (e.key === "Escape" && sheetOpen) { e.stopPropagation(); closeSheet(); }
    });
    modal.addEventListener("change", e => { if (e.target.matches("[data-opt]")) updatePreview(); });
    modal.addEventListener("submit", e => {
      if (!e.target.matches("[data-add]")) return;
      e.preventDefault();
      const input = e.target.querySelector("input");
      const v = (input.value || "").trim().replace(/\s+/g, " ");
      if (!v) return;
      const list = S().getExtras();
      v.split(/,\s*/).forEach(x => { if (x && !list.includes(x)) list.push(x.charAt(0).toUpperCase() + x.slice(1)); });
      S().setExtras(list.slice(0, 40));
      render();
      const again = $("#slAddInput"); if (again) again.focus();
    });
  }

  function toggleItem(key, keepFocus) {
    const set = getChecked();
    if (set.has(key)) set.delete(key); else set.add(key);
    saveChecked(set);
    const scroller = $("#shopBody");
    const top = scroller.scrollTop;
    const openRecipes = !!$(".sl-recipes[open]");
    const openCupboard = !!$(".sl-cupboard[open]");
    render();
    scroller.scrollTop = top;
    if (openRecipes) { const d = $(".sl-recipes"); if (d) d.open = true; }
    if (openCupboard) { const d = $(".sl-cupboard"); if (d) d.open = true; }
    if (keepFocus) { const el = document.querySelector(`.sl-item[data-key="${CSS.escape(key)}"]`); if (el) el.focus(); }
  }

  /* ---------- shared links ---------- */
  function openShared(decoded, recipes) {
    const bySlug = new Map((recipes || []).map(r => [r.slug, r]));
    const ents = decoded.r.map(([slug, n]) => ({ id: "shared:" + slug, recipe: bySlug.get(slug), servings: n })).filter(e => e.recipe);
    if (!ents.length && !decoded.x.length) return false;
    shared = {
      entries: ents,
      extras: decoded.x,
      from: decoded.f || "",
      checkKey: "recipy.sharedchecked." + S().encode(decoded).slice(0, 48)
    };
    return true;
  }
  function exitShared() {
    shared = null;
    try {
      const u = new URL(location.href); u.searchParams.delete("list");
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (e) {}
    render();
  }
  function isShared() { return !!shared; }

  function mount(h) { host = h; bind(); }

  window.RecipyShopUI = { mount, render, openShared, exitShared, isShared, closeSheet: () => { if (sheetOpen) closeSheet(); } };
})();
