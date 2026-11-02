/* ============================================================
   Recipy — recipe importer
   Turns a pasted recipe (from a Word doc, notes app, email or
   website) into the structure the submit form uses: title,
   servings, time, ingredient groups, steps with timers,
   nutrition, equipment and a "did you know" fact.

   Pure parsing lives in RecipyImport.parse(text) and has no DOM
   dependencies, so it can be tested in Node.
   ============================================================ */
(function (root) {
  const FRACTIONS = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875 };
  const FRAC_CHARS = Object.keys(FRACTIONS).join("");

  const UNITS = [
    ["kg", /^(kg|kgs|kilos?|kilograms?)\b/i],
    ["g", /^(g|gr|grams?|grammes?)\b/i],
    ["mg", /^mg\b/i],
    ["ml", /^(ml|millilit(re|er)s?)\b/i],
    ["l", /^(l|lit(re|er)s?)\b/i],
    ["tsp", /^(tsp|tsps|teaspoons?)\b\.?/i],
    ["tbsp", /^(tbsp|tbsps|tbs|tablespoons?)\b\.?/i],
    ["cup", /^cups?\b/i],
    ["oz", /^(oz|ounces?)\b/i],
    ["lb", /^(lb|lbs|pounds?)\b/i],
    ["cloves", /^cloves?\b/i],
    ["tin", /^(tins?|cans?)\b/i],
    ["jar", /^jars?\b/i],
    ["pinch", /^pinch(es)?\b/i],
    ["handful", /^handfuls?\b/i],
    ["bunch", /^bunch(es)?\b/i],
    ["slices", /^slices?\b/i],
    ["sprigs", /^sprigs?\b/i],
    ["pack", /^(packs?|packets?)\b/i],
    ["cm", /^cm\b/i]
  ];

  const HEAD = {
    ingredients: /^(ingredients?|you(?:'|’)?ll need|what you(?:'|’)?ll need|what you need|shopping list)\s*:?$/i,
    method: /^(method|instructions|directions|steps|how to make( it)?|to make)\s*:?$/i,
    nutrition: /^nutrition(al)?(\s+info(rmation)?)?\b.*$/i,
    fact: /^(did you know\??|fun fact|why this works)\s*:?$/i,
    equipment: /^(equipment|tools|kit|you(?:'|’)?ll also need)\s*:?$/i,
    notes: /^(notes?|tips?|top tips?|cook(?:'|’)?s notes?)\s*:?$/i,
    ignore: /^(inspired by\b.*|good for\s*:?.*|star rating\s*:?.*|enjoy!*|bon app[eé]tit!*|rating\s*:?.*)$/i
  };

  const NUTRIENTS = [
    ["calories", /^(calories|energy|kcal)\b/i],
    ["carbs", /^(carb(ohydrate)?s?)\b/i],
    ["protein", /^protein\b/i],
    ["fat", /^(total )?fat\b/i],
    ["fibre", /^fib(re|er)\b/i],
    ["sugar", /^sugars?\b/i]
  ];

  /* ---------- text cleanup ---------- */
  function normalise(text) {
    return String(text || "")
      .replace(/\r\n?/g, "\n")
      .replace(/ /g, " ")
      .replace(/[‘’]/g, "'")
      .replace(/\t/g, " ")
      .replace(/^(method|ingredients|instructions)\s*(?=step\s*\d)/gim, "$1\n")
      .split("\n")
      .map(l => l.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  /* Word docs exported via text boxes often repeat whole blocks
     back to back. Remove any run of 2+ lines immediately repeated,
     and immediately repeated heading-style single lines. */
  function dedupe(lines) {
    const out = lines.slice();
    let changed = true;
    while (changed) {
      changed = false;
      outer: for (let i = 0; i < out.length; i++) {
        const maxL = Math.min(60, Math.floor((out.length - i) / 2));
        for (let L = maxL; L >= 1; L--) {
          let same = true;
          for (let k = 0; k < L; k++) {
            if (out[i + k] !== out[i + L + k]) { same = false; break; }
          }
          if (!same) continue;
          if (L === 1 && !isHeading(out[i]) && out[i].length > 40) continue;
          out.splice(i + L, L);
          changed = true;
          break outer;
        }
      }
    }
    return out;
  }

  function sectionOf(line) {
    const bare = line.replace(/^[#*\s]+|[*\s]+$/g, "").replace(/\s*\(.*\)\s*:?$/, "");
    for (const key of ["ingredients", "method", "fact", "equipment", "notes", "ignore"]) {
      if (HEAD[key].test(bare)) return key;
    }
    if (HEAD.nutrition.test(bare) && bare.length < 60) return "nutrition";
    return null;
  }

  function isHeading(line) { return !!sectionOf(line) || /^step\s*\d+/i.test(line); }

  /* ---------- numbers ---------- */
  function parseNumber(str) {
    if (!str) return null;
    const s = str.trim();
    let m = s.match(new RegExp("^(\\d+)\\s*([" + FRAC_CHARS + "])$"));
    if (m) return +m[1] + FRACTIONS[m[2]];
    if (FRACTIONS[s] != null) return FRACTIONS[s];
    m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) return +m[1] + (+m[2] / +m[3]);
    m = s.match(/^(\d+)\/(\d+)$/);
    if (m) return +m[1] / +m[2];
    m = s.match(/^\d+(?:[.,]\d+)?$/);
    if (m) return parseFloat(s.replace(",", "."));
    return null;
  }

  function tidyAmount(n) {
    if (n == null) return "";
    const r = Math.round(n * 100) / 100;
    return String(r);
  }

  /* ---------- ingredients ---------- */
  const AMOUNT_RE = new RegExp(
    "^(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d*\\s*[" + FRAC_CHARS + "]|\\d+(?:[.,]\\d+)?)" + // amount
    "(?:\\s*(?:-|–|to)\\s*(\\d+(?:[.,]\\d+)?))?"                                       // optional range
  );

  function parseIngredient(rawLine) {
    let line = rawLine.replace(/^[-•*▪◦·–]\s*/, "").replace(/^\(?[a-z0-9]\)\s+/i, "").trim();
    const flagged = /\?{2,}|\.\.\s*\w+\?|\btbc\b|\btbd\b/i.test(line);
    let amount = "", unit = "";

    const m = line.match(AMOUNT_RE);
    if (m && !/^\d+\s*(?:x|×)\b/.test(line)) {
      const n = parseNumber(m[1].replace(/\s+/g, m[1].match(/^\d+\s+\d/) ? " " : ""));
      if (n != null) {
        /* for ranges like "2-3 cloves" keep the upper figure: safer to have enough */
        const upper = m[2] ? parseNumber(m[2]) : null;
        amount = tidyAmount(upper != null && upper > n ? upper : n);
        line = line.slice(m[0].length).trim();
        for (const [u, re] of UNITS) {
          const um = line.match(re);
          if (um) { unit = u; line = line.slice(um[0].length).trim(); break; }
        }
        line = line.replace(/^(x|×)\s+/i, "").replace(/^of\s+/i, "").trim();
      }
    }
    /* "Salt and pepper, to taste" etc. stays as text with no amount */
    line = line.replace(/\s+/g, " ").replace(/^[,;:\-–]\s*/, "").replace(/\*+$/, "").trim();
    return { amount, unit, text: line, flagged };
  }

  function groupHeading(line) {
    const bare = line.replace(/^[#*\s]+|[*\s]+$/g, "");
    if (/^for the\s+.+/i.test(bare) && bare.length < 50 && !/\d/.test(bare)) {
      return bare.replace(/^for the\s+/i, "").replace(/:$/, "").replace(/^\w/, c => c.toUpperCase());
    }
    if (/:$/.test(bare) && bare.length < 40 && !/\d/.test(bare)) {
      return bare.replace(/:$/, "").trim();
    }
    return null;
  }

  /* ---------- steps ---------- */
  const TIME_RE = /(\d+(?:\.\d+)?)\s*(?:(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*)?(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/gi;

  function timesIn(text) {
    const found = [];
    let m;
    TIME_RE.lastIndex = 0;
    while ((m = TIME_RE.exec(text))) {
      const lo = parseFloat(m[1]);
      const hi = m[2] ? parseFloat(m[2]) : lo;
      const unit = m[3].toLowerCase();
      let mins = unit.startsWith("h") ? hi * 60 : unit.startsWith("s") ? hi / 60 : hi;
      found.push({ mins, index: m.index });
    }
    return found;
  }

  function sentenceAround(text, index) {
    const start = Math.max(text.lastIndexOf(".", index - 1), text.lastIndexOf("!", index - 1)) + 1;
    let end = text.indexOf(".", index);
    if (end === -1) end = text.length;
    return text.slice(start, end).replace(/\(?~?\s*\d+.*$/, "").replace(/\s+/g, " ").trim().replace(/[,(~]+$/, "").trim();
  }

  function deriveTitle(desc) {
    /* "Smash the cucumbers with a rolling pin…" → "Smash the cucumbers" */
    const first = desc.split(/[.!;,]/)[0].replace(/\(.*?\)/g, "").trim();
    let words = first.split(" ").slice(0, 4);
    const stop = /^(the|a|an|and|with|to|of|in|on|for|until|into|your|some|it|then|once|over|at|from|by)$/i;
    while (words.length > 2 && stop.test(words[words.length - 1])) words.pop();
    return words.join(" ");
  }

  function finishStep(step) {
    const desc = step.lines.join(" ").replace(/\s+/g, " ").trim();
    const times = timesIn(desc);
    const timers = times.filter(t => t.mins >= 1).map(t => ({
      mins: String(Math.round(t.mins)),
      context: sentenceAround(desc, t.index).slice(0, 60)
    }));
    const timerTotal = times.reduce((s, t) => s + t.mins, 0);
    /* step duration: the timed bits, plus a little for the untimed hands-on work */
    const sentences = desc.split(/[.!?]+\s/).filter(Boolean).length;
    const estimate = Math.round(timerTotal + Math.max(0, sentences - times.length) * 1.5);
    return {
      title: step.title || deriveTitle(desc),
      time: String(Math.max(estimate, desc ? 2 : 0) || ""),
      desc,
      tip: step.tip || "",
      timers
    };
  }

  /* ---------- main ---------- */
  function parse(text, opts) {
    const options = opts || {};
    const lines = dedupe(normalise(text));
    const recipe = {
      title: "", intro: "", time: "", baseServings: "",
      ingredientGroups: [], steps: [], macros: {}, equipment: [], fact: null, tags: []
    };
    const warnings = [];
    const flaggedLines = [];

    let section = "head";
    let group = null;
    let step = null;
    const rawSteps = [];
    const notes = [];
    let factLines = [];

    const pushStep = () => { if (step && step.lines.length) rawSteps.push(step); step = null; };

    for (const line of lines) {
      /* metadata that can appear anywhere */
      const serves = line.match(/^(?:serves|servings|portions|makes|yield)\s*:?\s*(\d+)/i) || line.match(/^(\d+)\s+(?:servings|portions)$/i);
      if (serves) { recipe.baseServings = serves[1]; continue; }
      const total = line.match(/^(?:total(?: time)?|time|ready in|takes)\s*:?\s*(\d+)\s*(h|hr|hrs|hours?|m|mins?|minutes?)\b/i);
      if (total && section !== "method") {
        recipe.time = String(/^h/i.test(total[2]) ? +total[1] * 60 : +total[1]);
        continue;
      }
      const prepCook = line.match(/^(prep|cook)(?:ing)?(?: time)?\s*:?\s*(\d+)\s*(h|hr|hrs|hours?|m|mins?|minutes?)\b/i);
      if (prepCook && section !== "method") {
        const mins = /^h/i.test(prepCook[3]) ? +prepCook[2] * 60 : +prepCook[2];
        recipe._prepCook = (recipe._prepCook || 0) + mins;
        continue;
      }

      const sec = sectionOf(line);
      if (sec === "ignore") continue; /* "Enjoy!", "Good for:", "Inspired by" — skip, keep the section */
      if (sec) {
        const inner = line.match(/\((?:makes|serves)\s*~?\s*(\d+)[^)]*\)/i);
        if (inner && !recipe.baseServings) recipe.baseServings = inner[1];
        if (section === "method") pushStep();
        if (section === "fact" && factLines.length) { recipe.fact = recipe.fact || { body: factLines.join(" ") }; factLines = []; }
        section = sec;
        if (sec === "ingredients") group = null;
        continue;
      }

      switch (section) {
        case "head": {
          if (!recipe.title && line.length <= 90 && !/[.!?]$/.test(line)) {
            const t = line.replace(/^#+\s*/, "").replace(/\s*inspired by.*$/i, "").trim();
            if (t) { recipe.title = t; break; }
          }
          if (!recipe.intro && line.length > 30) { recipe.intro = line.slice(0, 280); break; }
          break;
        }
        case "ingredients": {
          const gh = groupHeading(line);
          if (gh) { group = { name: gh, items: [] }; recipe.ingredientGroups.push(group); break; }
          if (!group) { group = { name: "", items: [] }; recipe.ingredientGroups.push(group); }
          const item = parseIngredient(line);
          if (!item.text && !item.amount) break;
          if (item.flagged) flaggedLines.push(line);
          delete item.flagged;
          group.items.push(item);
          break;
        }
        case "method": {
          const sh = line.match(/^step\s*(\d+)\s*(?:[-–—:.)]\s*(.*))?$/i);
          if (sh) { pushStep(); step = { num: +sh[1], title: (sh[2] || "").trim(), lines: [] }; break; }
          const num = line.match(/^(\d+)[.)]\s+(.+)$/);
          if (num) { pushStep(); step = { num: +num[1], title: "", lines: [num[2]] }; break; }
          const tip = line.match(/^(?:tip|top tip|note)\s*:\s*(.+)$/i);
          if (tip && step) { step.tip = tip[1]; break; }
          if (!step) {
            step = { title: "", lines: [line] };
            /* un-numbered method pasted from the web: one paragraph per step */
            if (line.length > 60) pushStep();
            break;
          }
          step.lines.push(line);
          break;
        }
        case "nutrition": {
          const bare = line.replace(/^[-•*]\s*/, "");
          let matched = false;
          for (const [key, re] of NUTRIENTS) {
            if (!re.test(bare)) continue;
            const nums = (bare.match(/\d+(?:[.,]\d+)?/g) || []).map(n => parseFloat(n.replace(",", ".")));
            /* "Total / Per serving" → the last figure is per serving */
            matched = true;
            if (nums.length) {
              recipe.macros[key] = nums[nums.length - 1];
              if (key === "calories" && nums.length >= 2 && nums[1] > 0) recipe._servingsFromNutrition = Math.round(nums[0] / nums[1]);
            }
            break;
          }
          if (!matched) section = "head-after";
          break;
        }
        case "fact": {
          factLines.push(line.replace(/^["“”']+|["“”']+$/g, "").trim());
          break;
        }
        case "equipment": {
          recipe.equipment.push(line.replace(/^[-•*▪◦·]\s*/, ""));
          break;
        }
        case "notes": {
          notes.push(line.replace(/^[-•*▪◦·]\s*/, ""));
          break;
        }
        default: break;
      }
    }
    if (section === "method") pushStep();
    if (factLines.length && !recipe.fact) recipe.fact = { body: factLines.join(" ") };

    /* fact: drop placeholders like “FUN FACT ABOUT THE SPICE BLEND!” */
    if (recipe.fact) {
      const body = recipe.fact.body.trim();
      const letters = body.replace(/[^a-z]/gi, "");
      if (!body || (letters.length && letters === letters.toUpperCase())) {
        warnings.push("The \"Did you know?\" looks like a placeholder, so we left it out.");
        recipe.fact = null;
      } else {
        recipe.fact = { title: "Did you know?", body: body.slice(0, 400) };
      }
    }

    /* Word docs sometimes store numbered steps out of order */
    if (rawSteps.length > 1 && rawSteps.every(s => s.num != null)) {
      const nums = rawSteps.map(s => s.num);
      if (new Set(nums).size === nums.length) rawSteps.sort((a, b) => a.num - b.num);
    }
    recipe.steps = rawSteps.map(finishStep);
    if (notes.length && recipe.steps.length) {
      const last = recipe.steps[recipe.steps.length - 1];
      if (!last.tip) last.tip = notes.join(" ").slice(0, 240);
    }

    recipe.ingredientGroups = recipe.ingredientGroups.filter(g => g.items.length);

    if (!recipe.time) {
      const stepSum = recipe.steps.reduce((s, st) => s + (parseInt(st.time, 10) || 0), 0);
      const t = recipe._prepCook || stepSum;
      if (t) recipe.time = String(Math.max(5, Math.round(t / 5) * 5));
    }
    delete recipe._prepCook;

    if (options.fileName) {
      const fromFile = options.fileName.replace(/\.(docx|txt|md|rtf)$/i, "").replace(/\s+copy$/i, "").replace(/_+/g, " ").replace(/\s+/g, " ").trim();
      /* a fragment of the file name ("Bean") is worse than the file name itself */
      if (!recipe.title || (recipe.title.length < fromFile.length && fromFile.toLowerCase().startsWith(recipe.title.toLowerCase()) && recipe.title.split(" ").length < 3)) {
        recipe.title = fromFile;
      }
    }
    if (!recipe.baseServings && recipe._servingsFromNutrition > 0 && recipe._servingsFromNutrition <= 12) {
      recipe.baseServings = String(recipe._servingsFromNutrition);
    }
    delete recipe._servingsFromNutrition;

    /* ---------- report ---------- */
    if (!recipe.title) warnings.push("We couldn't spot a title. Add one at the top.");
    if (!recipe.ingredientGroups.length) warnings.push("No ingredients found. Start the list with a line that says \"Ingredients\".");
    if (!recipe.steps.length) warnings.push("No method found. Start the steps with a line that says \"Method\".");
    flaggedLines.forEach(l => warnings.push(`Check this ingredient, it looks unfinished: "${l}"`));
    if (!recipe.baseServings) warnings.push("We couldn't find how many it serves. Check \"Serves\".");

    const ingredientCount = recipe.ingredientGroups.reduce((s, g) => s + g.items.length, 0);
    const timerCount = recipe.steps.reduce((s, st) => s + st.timers.length, 0);
    const found = [];
    if (recipe.title) found.push({ key: "title", label: "Title", value: recipe.title });
    if (ingredientCount) found.push({ key: "ingredients", label: "Ingredients", value: ingredientCount + (recipe.ingredientGroups.length > 1 ? ` in ${recipe.ingredientGroups.length} groups` : "") });
    if (recipe.steps.length) found.push({ key: "steps", label: "Steps", value: recipe.steps.length + (timerCount ? ` · ${timerCount} timer${timerCount === 1 ? "" : "s"}` : "") });
    if (recipe.time) found.push({ key: "time", label: "Time", value: recipe.time + " min" });
    if (recipe.baseServings) found.push({ key: "servings", label: "Serves", value: recipe.baseServings });
    const macroCount = Object.keys(recipe.macros).length;
    if (macroCount) found.push({ key: "macros", label: "Nutrition", value: macroCount + " values" });
    if (recipe.equipment.length) found.push({ key: "equipment", label: "Equipment", value: recipe.equipment.length + " items" });
    if (recipe.fact) found.push({ key: "fact", label: "Fun fact", value: "Yes" });

    return { recipe, found, warnings, ingredientCount };
  }

  /* ============================================================
     UI: "Paste your recipe" panel for upload.html
     host = { apply(recipe), snapshot(), restore(state) }
     ============================================================ */
  const MAMMOTH = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js";
  let mammothLoading = null;
  function loadMammoth() {
    if (root.mammoth) return Promise.resolve(root.mammoth);
    if (!mammothLoading) {
      mammothLoading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = MAMMOTH;
        s.onload = () => resolve(root.mammoth);
        s.onerror = () => { mammothLoading = null; reject(new Error("Couldn't load the Word reader")); };
        document.head.appendChild(s);
      });
    }
    return mammothLoading;
  }

  async function readFile(file) {
    const name = file.name || "";
    if (/\.docx$/i.test(name)) {
      const m = await loadMammoth();
      const buf = await file.arrayBuffer();
      const out = await m.extractRawText({ arrayBuffer: buf });
      return out.value || "";
    }
    if (/\.(txt|md|text)$/i.test(name) || /^text\//.test(file.type)) return file.text();
    throw new Error("That file type isn't supported. Use a Word (.docx) or text file, or paste the text.");
  }

  const EXAMPLE = [
    "Smashed Cucumber & Tahini Salad",
    "A cool, crunchy salad with a nutty tahini dressing. Perfect on hot evenings.",
    "Serves 2",
    "",
    "Ingredients",
    "For the salad:",
    "2 cucumbers",
    "½ red onion, thinly sliced",
    "1 tbsp sesame seeds",
    "For the dressing:",
    "3 tbsp tahini",
    "1 clove garlic, grated",
    "Juice of 1 lemon",
    "",
    "Method",
    "1. Smash the cucumbers with a rolling pin and tear into chunks. Salt and leave to drain for 10 minutes.",
    "2. Toast the sesame seeds in a dry pan for 2-3 minutes until golden.",
    "3. Whisk the tahini, garlic and lemon with 3 tbsp water until smooth.",
    "4. Toss everything together and serve straight away.",
    "",
    "Nutrition per serving",
    "Calories 210",
    "Protein 6g"
  ].join("\n");

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function mountUI(el, host) {
    let undoState = null;
    let fileName = "";

    el.innerHTML = `
      <div class="importer__head">
        <span class="importer__badge" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M19 3v4M21 5h-4M5 17v3M6.5 18.5h-3"/></svg>
        </span>
        <div>
          <h2 class="importer__title">Already written it down? Paste it in.</h2>
          <p class="importer__sub">Copy your recipe from a Word doc, your notes app or a website, or drop the file here. We'll fill in the whole form for you: ingredients, steps, timers and nutrition.</p>
        </div>
      </div>
      <div class="importer__drop" data-drop>
        <label class="sr-only" for="importText">Paste your recipe</label>
        <textarea id="importText" class="importer__text" rows="7" spellcheck="false"
          placeholder="Mushroom Stroganoff&#10;Serves 2&#10;&#10;Ingredients&#10;200g fusilli pasta&#10;350g mushrooms&#10;…&#10;&#10;Method&#10;1. Boil the kettle…"></textarea>
        <div class="importer__dropmsg" aria-hidden="true">Drop your Word or text file</div>
      </div>
      <div class="importer__actions">
        <button type="button" class="btn btn-primary importer__go" data-go disabled>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/></svg>
          Fill the form
        </button>
        <label class="btn btn-secondary importer__file">
          <input type="file" accept=".docx,.txt,.md,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden data-file />
          Choose a file
        </label>
        <button type="button" class="importer__link" data-example>Try an example</button>
      </div>
      <div class="importer__result" data-result aria-live="polite" hidden></div>`;

    const ta = el.querySelector("#importText");
    const go = el.querySelector("[data-go]");
    const drop = el.querySelector("[data-drop]");
    const result = el.querySelector("[data-result]");
    const fileInput = el.querySelector("[data-file]");

    const sync = () => { go.disabled = ta.value.trim().length < 20; };
    ta.addEventListener("input", () => { fileName = ""; sync(); });

    function showError(msg) {
      result.hidden = false;
      result.className = "importer__result is-error";
      result.innerHTML = `<p>${escapeHtml(msg)}</p>`;
    }

    function run() {
      const text = ta.value;
      if (text.trim().length < 20) return;
      const out = parse(text, { fileName });
      if (!out.ingredientCount && !out.recipe.steps.length) {
        showError("We couldn't find ingredients or steps in that. Make sure the text includes an \"Ingredients\" heading and a \"Method\" heading.");
        return;
      }
      undoState = host.snapshot();
      host.apply(out.recipe);

      result.hidden = false;
      result.className = "importer__result";
      result.innerHTML = `
        <div class="importer__done">
          <strong>Done. We filled in:</strong>
          <ul class="importer__found">
            ${out.found.map(f => `<li><span aria-hidden="true">✓</span> ${escapeHtml(f.label)} <em>${escapeHtml(f.value)}</em></li>`).join("")}
          </ul>
        </div>
        ${out.warnings.length ? `
          <div class="importer__warn">
            <strong>Worth a quick check</strong>
            <ul>${out.warnings.map(w => `<li>${escapeHtml(w)}</li>`).join("")}</ul>
          </div>` : ""}
        <div class="importer__after">
          <button type="button" class="btn btn-primary" data-review>Review the form</button>
          <button type="button" class="importer__link" data-undo>Undo</button>
          <span class="importer__hint">Times are estimated from the method, so give them a once-over. Add a photo below.</span>
        </div>`;
      el.classList.add("is-done");
    }

    go.addEventListener("click", run);

    el.addEventListener("click", e => {
      if (e.target.closest("[data-example]")) {
        ta.value = EXAMPLE; fileName = ""; sync(); ta.focus();
        return;
      }
      if (e.target.closest("[data-review]")) {
        const first = document.getElementById("title");
        if (first) {
          first.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
          setTimeout(() => first.focus({ preventScroll: true }), 400);
        }
        return;
      }
      if (e.target.closest("[data-undo]")) {
        if (undoState) host.restore(undoState);
        undoState = null;
        result.hidden = true;
        el.classList.remove("is-done");
        ta.focus();
      }
    });

    async function takeFile(file) {
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { showError("That file is over 5 MB. Try copying the text instead."); return; }
      result.hidden = false;
      result.className = "importer__result";
      result.innerHTML = `<p>Reading ${escapeHtml(file.name)}…</p>`;
      try {
        const text = await readFile(file);
        ta.value = text.trim();
        fileName = file.name;
        sync();
        run();
      } catch (err) {
        showError(err.message || "We couldn't read that file.");
      }
    }

    fileInput.addEventListener("change", () => { takeFile(fileInput.files[0]); fileInput.value = ""; });

    ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => {
      if (e.dataTransfer && [...e.dataTransfer.types].includes("Files")) { e.preventDefault(); drop.classList.add("is-over"); }
    }));
    ["dragleave", "dragend"].forEach(ev => drop.addEventListener(ev, () => drop.classList.remove("is-over")));
    drop.addEventListener("drop", e => {
      if (!e.dataTransfer || !e.dataTransfer.files.length) return;
      e.preventDefault();
      drop.classList.remove("is-over");
      takeFile(e.dataTransfer.files[0]);
    });
  }

  const api = { parse, parseIngredient, mountUI, _dedupe: dedupe };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.RecipyImport = api;
})(typeof window !== "undefined" ? window : globalThis);
