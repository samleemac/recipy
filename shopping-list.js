/* ============================================================
   Recipy — smart shopping list
   - merges the same ingredient across recipes (salt / fine salt,
     garlic / garlic cloves / cloves of garlic …)
   - shop-friendly amounts: whole onions, ½ tsp, 1.2 kg, 2 tins
   - real aisles, with a "check the cupboard" section for staples
   - drops water, keeps notes like "(optional)" out of the way
   - your own extra items
   - send it: share sheet, WhatsApp, Messages, email, copy for
     Notes, or a live link a friend can open and tick off
   Pure list-building lives in RecipyShop.build() (no DOM).
   ============================================================ */
(function (root) {
  const EXTRA_KEY = "recipy.shopextra";

  /* ---------- names ---------- */
  const DROP = /^(?:(?:cold|boiling|hot|warm|ice-cold|starchy|reserved)\s+)?(?:pasta\s+)?water$/i;

  const CANON = [
    [/^(?:salt and (?:black )?pepper|(?:black )?pepper and salt)(?: to taste)?$/i, "Salt & black pepper"],
    [/^(?:fine |sea |flaky |table )?salt$/i, "Salt"],
    [/^(?:freshly )?(?:ground |cracked |freshly cracked )?black pepper$|^pepper$/i, "Black pepper"],
    [/^(?:garlic cloves?|cloves? of garlic|garlic|small clove of garlic)$/i, "Garlic"],
    [/^(?:olive oil)$/i, "Olive oil"],
    [/^(?:vegetable stock(?: or water)?)$/i, "Vegetable stock"],
    [/^(?:soy sauce or tamari|soy sauce|tamari)$/i, "Soy sauce or tamari"],
    [/^(?:tomato pur[eé]e)$/i, "Tomato purée"],
    [/^(?:spring onions?)$/i, "Spring onions"],
    [/^(?:sweet potato(?:es)?)$/i, "Sweet potatoes"],
    [/^(?:carrots?)$/i, "Carrots"],
    [/^(?:lemon juice)$/i, "Lemon juice"],
    [/^(?:lime juice)$/i, "Lime juice"],
    [/^(?:peanut butter|smooth peanut butter)$/i, "Peanut butter"]
  ];

  function cleanName(text) {
    let raw = String(text || "").trim();
    const notes = [];
    const optional = /\[optional\]|\(optional\)/i.test(raw);
    raw = raw.replace(/\[[^\]]*\]/g, "").replace(/\(([^)]*)\)?/g, (_, n) => { if (n && !/optional/i.test(n)) notes.push(n.trim()); return ""; });
    const comma = raw.indexOf(",");
    if (comma > -1) { notes.push(raw.slice(comma + 1).trim()); raw = raw.slice(0, comma); }
    raw = raw.replace(/^of\s+/i, "").replace(/['"]/g, "").replace(/\s+/g, " ").trim();
    /* "Asparagus Tips" → "Asparagus tips", keeping proper nouns */
    let name = raw.toLowerCase().replace(/\b(dijon|quorn|italian|greek|thai|cajun|granny smith|massaman|jasmine|basmati|puy|kalamata|oatly|baharat|portobello|tenderstem|chestnut|msg)\b/g, w => w === "msg" ? "MSG" : w.replace(/\b\w/g, ch => ch.toUpperCase()));
    name = name.charAt(0).toUpperCase() + name.slice(1);
    for (const [re, canon] of CANON) { if (re.test(raw)) { name = canon; break; } }
    return { name, notes: notes.filter(Boolean), optional };
  }

  function keyOf(name) {
    return name.toLowerCase().replace(/oes\b/g, "o").replace(/([^s])s\b/g, "$1").replace(/[^a-z0-9 ]/g, "").trim();
  }

  /* ---------- units ---------- */
  const UNIT_MAP = [
    [/^(?:g|grams?|gr)$/, "g"], [/^kg$/, "kg"], [/^(?:ml|millilit(?:re|er)s?)$/, "ml"], [/^l$/, "l"],
    [/^(?:tsps?|teaspoons?)$/, "tsp"], [/^(?:tbsps?|tbso|tbs|tablespoons?)$/, "tbsp"], [/^cups?$/, "cup"],
    [/^(?:small |large )?cloves?$/, "clove"], [/^(?:x\s*400g\s*(?:tins?|cans?)|tins?|cans?)$/, "tin"],
    [/^(?:small |large )?handfuls?$/, "handful"], [/^pinch(?:es)?$/, "pinch"], [/^splash(?:es)?$/, "splash"],
    [/^drizzles?$/, "drizzle"], [/^ladles?$/, "ladle"], [/^nests?$/, "nest"], [/^packs?$/, "pack"],
    [/^heads?$/, "head"], [/^bunch(?:es)?$/, "bunch"], [/^cobs?$/, "cob"], [/^cubes?$/, "cube"], [/^cm$/, "cm"],
    [/^large$/, ""], [/^$/, ""]
  ];
  function normUnit(u) {
    const s = String(u || "").toLowerCase().trim();
    for (const [re, out] of UNIT_MAP) if (re.test(s)) return out;
    return s;
  }

  const SPOON = new Set(["tsp", "tbsp", "cup"]);
  const COUNT = new Set(["", "clove", "tin", "nest", "pack", "head", "bunch", "cob", "cube", "handful", "pinch", "splash", "drizzle", "ladle"]);
  const PLURAL = { clove: "cloves", tin: "tins", nest: "nests", pack: "packs", head: "heads", bunch: "bunches", cob: "cobs", cube: "cubes", handful: "handfuls", pinch: "pinches", splash: "splashes", drizzle: "drizzles", ladle: "ladles", cup: "cups" };

  function frac(n) {
    const q = Math.max(0.25, Math.round(n * 4) / 4);
    const whole = Math.floor(q), f = q - whole;
    const sym = f === 0.25 ? "¼" : f === 0.5 ? "½" : f === 0.75 ? "¾" : "";
    return (whole ? String(whole) : "") + sym || "¼";
  }
  function metric(n, unit) {
    if (unit === "g" && n >= 1000) return { n: Math.round(n / 100) / 10, unit: "kg" };
    if (unit === "ml" && n >= 1000) return { n: Math.round(n / 100) / 10, unit: "l" };
    const r = n >= 200 ? Math.round(n / 10) * 10 : n >= 50 ? Math.round(n / 5) * 5 : n >= 10 ? Math.round(n) : Math.round(n * 2) / 2;
    return { n: r || 1, unit };
  }
  function formatAmount(n, unit) {
    if (!n) return "";
    if (unit === "g" || unit === "ml" || unit === "kg" || unit === "l") {
      const m = metric(n, unit);
      return `${m.n} ${m.unit}`;
    }
    if (SPOON.has(unit)) {
      const f = frac(n);
      return `${f} ${unit === "cup" && n > 1.01 ? "cups" : unit}`;
    }
    if (COUNT.has(unit)) {
      /* you can't buy half an onion: round up (with a little tolerance for float noise) */
      const c = Math.max(1, Math.ceil(n - 0.05));
      return unit ? `${c} ${c > 1 ? (PLURAL[unit] || unit) : unit}` : String(c);
    }
    return `${Math.round(n * 10) / 10} ${unit}`.trim();
  }

  /* ---------- aisles ---------- */
  const STAPLE = /^(?:salt$|black pepper$|salt & black pepper$|olive oil|oil|neutral oil|vegetable oil|sunflower oil|(?:toasted )?sesame oil|vegetable stock(?: paste| cube| powder(?:\/paste)?)?|stock powder|red wine stock paste|ground |dried (?:oregano|basil|thyme|basil or thyme)|smoked paprika|paprika|chilli flakes|chilli powder|cayenne|(?:ground )?turmeric|curry powder|garam masala|cajun|baharat|jerk|sumac|fennel seeds|msg|garlic (?:granules|powder)|baking powder|cornflour|plain flour|self-raising flour|caster sugar|sugar|vanilla extract|.*vinegar|soy sauce or tamari|tomato purée|dijon mustard|nutritional yeast|.*seasoning|.*spice mix)/i;

  const AISLES = [
    ["Fruit & veg", "🥬", /\b(onions?|shallots?|garlic|ginger|lemon|lime|(?<!chopped |tinned |sun-?dried |sundried )tomato(?:es)?(?! (?:purée|puree|paste|passata))|potato(?:es)?|carrots?|parsnips?|peppers?(?! flakes)|courgettes?|aubergines?|mushrooms?|spinach|kale|cabbage|greens|lettuce|leeks?|broccoli|cauliflower|celery|cucumber|avocados?|spring onions|coriander|parsley|basil|sage|chives|mint|rosemary|herbs|rocket|salad|asparagus|mangetout|pumpkin|squash|mango|watermelon|kiwis?|bananas?|apples?|raspberries|blueberries|berries|chillies|chilli(?! (?:flakes|powder|paste|jam|sauce))|cress|sprouted|radish)\b/i],
    ["Tofu, beans & protein", "🫘", /\b(tofu|tempeh|quorn|plant[- ]based chicken|chicken pieces|seitan|paneer|salmon)\b/i],
    ["Fridge", "🧈", /\b((?<!peanut )butter(?! beans)|(?<!coconut )cream|(?<!coconut )milk|cheese|cheddar|feta|halloumi|burrata|mozzarella|parmesan|yog(?:h)?urt|mayonnaise|egg whites?|eggs?|oatly)\b/i],
    ["Frozen", "🧊", /\b(frozen|edamame)\b/i],
    ["Pasta, rice & grains", "🍝", /\b(pasta|spaghetti|penne|fusilli|farfalle|conchiglie|linguine|macaroni|noodles?|rice(?! (?:vinegar|wine))|quinoa|bulgur|couscous|oats|split chickpeas|(?:red )?split lentils|red lentils|green lentils|dry .*lentils|panko|breadcrumbs)\b/i],
    ["Tins & jars", "🥫", /\b(tins?|tinned|chopped tomatoes|passata|coconut milk|beans|chickpeas|puy lentils|olives|sun-?dried tomato|curry paste|harissa|chipotle|gochujang|miso|tahini|peanut butter|soy sauce|sriracha|hot sauce|barbecue sauce|chilli (?:jam|paste)|masala paste|curry paste|onion marmalade|stock|mustard|tomato purée|lemongrass paste|wasabi|sushi ginger|nori)\b/i],
    ["Bread & wraps", "🥖", /\b(bread|wraps?|tortillas?|naans?|ciabatta|pittas?|buns?)\b/i],
    ["Baking & sweet", "🍫", /\b(cocoa|chocolate|icing sugar|sugar|flour|baking powder|vanilla|maple|agave|honey|cranberries|goji|cornflour|nutritional yeast)\b/i],
    ["Nuts & seeds", "🥜", /\b(nuts?|almonds?|cashews?|pistachios?|peanuts|pine nuts|seeds)\b/i],
    ["Herbs & spices", "🧂", /\b(ground|dried|paprika|cumin|turmeric|cinnamon|cayenne|chilli flakes|chilli powder|curry powder|garam|seasoning|spice|sumac|fenugreek|fennel seeds|msg|salt|pepper|granules)\b/i],
    ["Oils, vinegars & drinks", "🫒", /\b(oil|vinegar|mirin|sherry|wine|whisky)\b/i]
  ];
  const OTHER = ["Everything else", "🧺"];

  function aisleOf(name) {
    /* spices and dried herbs first, so "ground ginger" isn't fresh produce */
    if (/^ground |^dried (?:oregano|basil|thyme|herbs|mint|rosemary|sage|chilli|basil or thyme)|(?:chilli|curry|garlic|onion|cayenne|mustard) powder$|chilli flakes$|^smoked paprika|^salt(?:$| &)|black pepper|seasoning|spice mix/i.test(name)) return ["Herbs & spices", "🧂"];
    if (/^frozen /i.test(name)) return ["Frozen", "🧊"];
    if (/juice$/i.test(name)) return ["Fruit & veg", "🥬"];
    for (const [label, emoji, re] of AISLES) if (re.test(name)) return [label, emoji];
    return OTHER;
  }
  const AISLE_ORDER = AISLES.map(a => a[0]).concat(OTHER[0]);

  /* ---------- build ---------- */
  /* entries: [{ recipe, servings }] → { aisles: [{label, emoji, items}], staples: [...], count } */
  function build(entries, extras) {
    const map = new Map();
    entries.forEach(({ recipe, servings }) => {
      if (!recipe) return;
      const factor = (servings || recipe.baseServings || 2) / (recipe.baseServings || 2);
      (recipe.ingredientGroups || []).forEach(g => (g.items || []).forEach(item => {
        const { name, notes, optional } = cleanName(item.text);
        if (!name || DROP.test(name)) return;
        const k = keyOf(name);
        if (!map.has(k)) map.set(k, { key: "i|" + k, name, amounts: new Map(), notes: new Set(), recipes: new Set(), optional: true });
        const e = map.get(k);
        let unit = normUnit(item.unit);
        /* "3 garlic" means cloves; "1 lime juice" means the juice of a lime */
        if (k === "garlic" && unit === "") unit = "clove";
        let amt = parseFloat(item.amount);
        if (!isFinite(amt) || amt <= 0) amt = 0;
        if (unit === "kg") { e.amounts.set("g", (e.amounts.get("g") || 0) + amt * 1000 * factor); }
        else if (unit === "l") { e.amounts.set("ml", (e.amounts.get("ml") || 0) + amt * 1000 * factor); }
        else e.amounts.set(unit, (e.amounts.get(unit) || 0) + amt * factor);
        notes.forEach(n => { if (n.length < 40 && !/not given|split|for /i.test(n)) e.notes.add(n); });
        e.recipes.add(recipe.title.replace(/\s*\(changes needed\)\s*$/i, ""));
        if (!optional) e.optional = false;
      }));
    });

    const aisles = new Map(), staples = [];
    [...map.values()].forEach(e => {
      const parts = [...e.amounts.entries()].filter(([, n]) => n > 0).map(([u, n]) => formatAmount(n, u)).filter(Boolean);
      let displayName = e.name;
      if (/^(lime|lemon) juice$/i.test(e.name) && e.amounts.has("") && e.amounts.size === 1) {
        displayName = e.name.replace(/ juice$/i, "") + " (for juice)";
        e.amounts = new Map([["", e.amounts.get("")]]);
      }
      /* "3 Red pepper" → "3 Red peppers" for everyday countables */
      const onlyCount = e.amounts.size === 1 && e.amounts.has("") && Math.ceil(e.amounts.get("") - 0.05) > 1;
      if (onlyCount) {
        displayName = displayName.replace(/\b(pepper|onion|lemon|lime|carrot|apple|banana|courgette|aubergine|cucumber|shallot|avocado|tomato|potato|mango|chilli)$/i,
          w => /(tomato|potato|mango)$/i.test(w) ? w + "es" : /chilli$/i.test(w) ? w + "es" : w + "s");
      }
      const item = {
        key: e.key, name: displayName,
        amount: parts.join(" + "),
        note: [...e.notes][0] || "",
        recipes: [...e.recipes],
        optional: e.optional
      };
      if (STAPLE.test(e.name)) { staples.push(item); return; }
      const [label, emoji] = aisleOf(e.name);
      if (!aisles.has(label)) aisles.set(label, { label, emoji, items: [] });
      aisles.get(label).items.push(item);
    });
    const ordered = AISLE_ORDER.filter(l => aisles.has(l)).map(l => {
      const a = aisles.get(l);
      a.items.sort((x, y) => x.name.localeCompare(y.name));
      return a;
    });
    staples.sort((x, y) => x.name.localeCompare(y.name));
    const ex = (extras || []).map(t => ({ key: "x|" + keyOf(t), name: t, amount: "", note: "", recipes: [], extra: true }));
    if (ex.length) ordered.unshift({ label: "Your extras", emoji: "📝", items: ex });
    const count = ordered.reduce((s, a) => s + a.items.length, 0);
    return { aisles: ordered, staples, count };
  }

  /* ---------- text for sharing ---------- */
  function toText(list, opts) {
    const o = opts || {};
    const checked = o.checked || new Set();
    const lines = [];
    lines.push(`🛒 Shopping list${o.recipes && o.recipes.length ? ` · ${o.recipes.length} recipe${o.recipes.length === 1 ? "" : "s"}` : ""}`);
    if (o.recipes && o.recipes.length) lines.push(o.recipes.map(r => `${String(r.title).replace(/\s*\(changes needed\)\s*$/i, "")} (serves ${r.servings})`).join(", "));
    list.aisles.forEach(a => {
      const items = a.items.filter(i => !(o.skipChecked && checked.has(i.key)));
      if (!items.length) return;
      lines.push("", `${a.emoji} ${a.label.toUpperCase()}`);
      items.forEach(i => lines.push(`${o.checkboxes === false ? "•" : "☐"} ${i.amount ? i.amount + " " : ""}${i.name}${i.optional ? " (optional)" : ""}`));
    });
    if (list.staples.length) {
      lines.push("", "🧂 CHECK THE CUPBOARD");
      lines.push(list.staples.map(s => s.name).join(", "));
    }
    if (o.link) lines.push("", `Tick it off on your phone: ${o.link}`);
    return lines.join("\n");
  }

  /* ---------- share links ---------- */
  function b64(str) { return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function unb64(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return decodeURIComponent(escape(atob(s))); }

  function encode(payload) { return b64(JSON.stringify(payload)); }
  function decode(str) {
    try {
      const p = JSON.parse(unb64(str));
      if (!p || !Array.isArray(p.r)) return null;
      return {
        r: p.r.filter(x => Array.isArray(x) && typeof x[0] === "string").slice(0, 30).map(([s, n]) => [s, Math.max(1, Math.min(40, parseInt(n, 10) || 2))]),
        x: Array.isArray(p.x) ? p.x.filter(t => typeof t === "string").slice(0, 40).map(t => t.slice(0, 60)) : [],
        f: typeof p.f === "string" ? p.f.slice(0, 40) : ""
      };
    } catch (e) { return null; }
  }

  /* ---------- extras ---------- */
  function getExtras() { try { const a = JSON.parse(localStorage.getItem(EXTRA_KEY) || "[]"); return Array.isArray(a) ? a.slice(0, 40) : []; } catch (e) { return []; } }
  function setExtras(a) { try { localStorage.setItem(EXTRA_KEY, JSON.stringify(a)); } catch (e) {} }

  const api = { build, toText, encode, decode, cleanName, formatAmount, aisleOf, getExtras, setExtras };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.RecipyShop = api;
})(typeof window !== "undefined" ? window : globalThis);
