#!/usr/bin/env node
/**
 * Assign ingredientKeys to every step in recipes-data.js so cook mode
 * always lists ingredients (with amounts) per step.
 */
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RECIPES_FILE = path.join(ROOT, "recipes-data.js");

const STOP = new Set([
  "with", "into", "from", "diced", "sliced", "small", "large", "fresh", "dried",
  "melted", "softened", "roughly", "finely", "chopped", "grated", "torn", "peeled",
  "minced", "halved", "quartered", "beaten", "cooked", "plain", "dark", "light",
  "extra", "good", "warm", "cold", "room", "temp", "more", "some", "your", "then",
  "serve", "optional", "needed", "about", "until", "once", "over", "under", "that",
  "thinly", "bite", "size", "halved", "drained", "rinsed", "soft", "hard", "style",
  "split", "baby", "mild", "block", "thumb", "piece", "parts", "green", "white",
]);

const CARRY_FORWARD = /\b(heat|warm|flip|bake|roast|simmer|stir|repeat|finish|swirl|pour|crisp|glaze|rest|plate|stack|top|devour|combine|assemble)\b/i;

function loadRecipes() {
  const code = fs.readFileSync(RECIPES_FILE, "utf-8");
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return { recipes: ctx.window.RECIPES, code };
}

function wordsFrom(text) {
  return text.toLowerCase().replace(/,.*$/, "").split(/[\s\-\/()]+/)
    .filter((w) => w.length >= 3 && !STOP.has(w) && !/^\d/.test(w));
}

function scoreStep(step, group, item) {
  const hay = (step.title + " " + step.desc + " " + (step.tip || "")).toLowerCase();
  let score = 0;
  const gname = (group.name || "").toLowerCase();
  const gwords = wordsFrom(gname);
  if (gwords.length && gwords.every((w) => hay.includes(w) || hay.includes(w.replace(/s$/, "")))) {
    score += 12;
  }
  if (gname.length >= 5 && hay.includes(gname)) score += 10;

  for (const w of wordsFrom(item.text)) {
    if (hay.includes(w)) score += w.length >= 5 ? 4 : 2;
    else if (w.length >= 5 && hay.includes(w.replace(/s$/, ""))) score += 3;
    else if (w.length >= 4 && new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(hay)) score += 3;
  }
  return score;
}

function assignRecipe(recipe) {
  const groups = recipe.ingredientGroups || [];
  const steps = recipe.steps || [];
  const items = [];
  groups.forEach((g, gi) => g.items.forEach((item, ii) => items.push({ gi, ii, group: g, item })));

  const stepKeys = steps.map(() => []);

  for (const { gi, ii, group, item } of items) {
    let best = 0;
    let bestScore = 0;
    steps.forEach((step, si) => {
      const s = scoreStep(step, group, item);
      if (s > bestScore) {
        bestScore = s;
        best = si;
      }
    });
    if (bestScore > 0) stepKeys[best].push(`${gi}-${ii}`);
  }

  /* Orphans → last step that mentions "serve" or final step */
  const assigned = new Set(stepKeys.flat());
  const orphans = items.filter(({ gi, ii }) => !assigned.has(`${gi}-${ii}`));
  const serveStep = steps.findIndex((s) => /\b(serve|plate|top|devour|finish|bring it together)\b/i.test(s.title + s.desc));
  const fallbackStep = serveStep >= 0 ? serveStep : steps.length - 1;

  for (const { gi, ii } of orphans) {
    stepKeys[fallbackStep].push(`${gi}-${ii}`);
  }

  /* Empty steps: carry forward from previous, or first step with keys */
  for (let si = 0; si < steps.length; si++) {
    if (stepKeys[si].length) continue;
    if (CARRY_FORWARD.test(steps[si].title) || CARRY_FORWARD.test(steps[si].desc)) {
      for (let j = si - 1; j >= 0; j--) {
        if (stepKeys[j].length) {
          stepKeys[si] = [...stepKeys[j]];
          break;
        }
      }
    }
    if (!stepKeys[si].length && si > 0 && stepKeys[si - 1].length) {
      stepKeys[si] = [...stepKeys[si - 1]];
    }
  }

  /* Still empty → assign whole groups mentioned in title */
  steps.forEach((step, si) => {
    if (stepKeys[si].length) return;
    const hay = (step.title + " " + step.desc).toLowerCase();
    groups.forEach((g, gi) => {
      const gn = (g.name || "").toLowerCase();
      if (gn.length >= 5 && hay.includes(gn)) {
        g.items.forEach((_, ii) => stepKeys[si].push(`${gi}-${ii}`));
      }
    });
  });

  /* Every step must list at least one ingredient (carry forward for heat / flip / bake steps) */
  for (let si = 0; si < steps.length; si++) {
    if (stepKeys[si].length) continue;
    for (let j = si - 1; j >= 0; j--) {
      if (stepKeys[j].length) {
        stepKeys[si] = [...stepKeys[j]];
        break;
      }
    }
  }

  steps.forEach((step, si) => {
    const keys = [...new Set(stepKeys[si])];
    if (keys.length) step.ingredientKeys = keys;
    else delete step.ingredientKeys;
    if (!step.ingredientGroupNames?.length) delete step.ingredientGroupNames;
  });
}

function serializeRecipes(recipes) {
  return JSON.stringify(recipes, null, 2)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/\n/g, "\n    ")
    .replace(/^    /, "");
}

/* Patch recipes-data.js in place by re-evaluating and writing is risky; use regex on steps sections.
   Simpler: write full file from template - too big.
   Instead: run assign on recipes, write recipes-data.generated.js and swap - OR use JSON patch per recipe.

   Best: read file, vm load, assign, then write back using JSON.stringify for RECIPES array only
*/
function main() {
  const { recipes } = loadRecipes();
  recipes.forEach(assignRecipe);

  /* Preserve hand-tuned group names where they exist */
  const tempeh = recipes.find((r) => r.slug === "tempeh-teriyaki-rice-bowl");
  if (tempeh) {
    const s2 = tempeh.steps[1];
    delete s2.ingredientKeys;
    s2.ingredientGroupNames = ["Quick teriyaki-style sauce"];
  }

  const outPath = path.join(ROOT, "recipes-data.patched.json");
  fs.writeFileSync(outPath, JSON.stringify(recipes, null, 2));
  console.log("Wrote", outPath, "— merging into recipes-data.js via node...");

  /* Merge: read recipes-data.js as text, replace window.RECIPES = [...] with generated */
  let src = fs.readFileSync(RECIPES_FILE, "utf-8");
  const start = src.indexOf("window.RECIPES = [");
  const end = src.lastIndexOf("];");
  if (start < 0 || end < 0) throw new Error("Could not find RECIPES array");

  const header = src.slice(0, start);
  const footer = src.slice(end + 2);

  function formatRecipe(r, index) {
    const lines = [];
    lines.push(`  /* ============================================================ ${index}. ${r.title} ============================================================ */`);
    lines.push("  {");
    const skip = new Set(["ingredientGroups", "steps"]);
    for (const [k, v] of Object.entries(r)) {
      if (skip.has(k)) continue;
      if (k === "id") lines.push(`    id: ${v},`);
      else if (typeof v === "string") lines.push(`    ${k}: ${JSON.stringify(v)},`);
      else if (typeof v === "number") lines.push(`    ${k}: ${v},`);
      else lines.push(`    ${k}: ${JSON.stringify(v)},`);
    }
    lines.push("    ingredientGroups: " + JSON.stringify(r.ingredientGroups, null, 2).replace(/\n/g, "\n    ").replace(/^    /, ""));
    lines.push(",");
    lines.push("    steps: " + JSON.stringify(r.steps, null, 2).replace(/\n/g, "\n    ").replace(/^    /, ""));
    lines.push("  }");
    return lines.join("\n");
  }

  const body = recipes.map((r, i) => formatRecipe(r, i)).join(",\n");
  const count = recipes.length;
  const newSrc = header.replace(/^\d+ recipes/, `${count} recipes`) + `window.RECIPES = [\n${body}\n];` + footer;
  fs.writeFileSync(RECIPES_FILE, newSrc);
  console.log(`Updated ${RECIPES_FILE} (${count} recipes)`);
}

main();
