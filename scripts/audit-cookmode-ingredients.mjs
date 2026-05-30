#!/usr/bin/env node
/**
 * Audit cook-mode ingredient coverage (mirrors recipe.html ingredientsForStep).
 * Exit 1 if any step has zero ingredients or any ingredient is never shown.
 *
 *   node scripts/audit-cookmode-ingredients.mjs
 */
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function loadRecipes() {
  const code = fs.readFileSync(path.join(ROOT, "recipes-data.js"), "utf-8");
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx.window.RECIPES;
}

const STOP = new Set([
  "with", "into", "from", "diced", "sliced", "small", "large", "fresh", "dried",
  "melted", "softened", "roughly", "finely", "chopped", "grated", "torn", "peeled",
  "minced", "halved", "quartered", "beaten", "cooked", "plain", "dark", "light",
  "extra", "good", "warm", "cold", "room", "temp", "more", "some", "your", "then",
]);

function itemKey(gi, ii) {
  return `${gi}-${ii}`;
}

function ingredientsForStep(step, ingredientGroups) {
  const matched = [];
  const seen = new Set();
  const push = (gi, ii, item) => {
    const k = itemKey(gi, ii);
    if (seen.has(k)) return;
    seen.add(k);
    matched.push({ gi, ii, text: item.text });
  };

  if (step.ingredientKeys?.length) {
    for (const key of step.ingredientKeys) {
      const [gi, ii] = String(key).split("-").map(Number);
      const item = ingredientGroups[gi]?.items[ii];
      if (item) push(gi, ii, item);
    }
    if (matched.length) return matched;
  }

  if (step.ingredientGroupNames?.length) {
    const names = new Set(step.ingredientGroupNames.map((n) => String(n).toLowerCase()));
    ingredientGroups.forEach((group, gi) => {
      if (!names.has((group.name || "").toLowerCase())) return;
      group.items.forEach((item, ii) => push(gi, ii, item));
    });
    if (matched.length) return matched;
  }

  const haystack = (step.title + " " + step.desc + (step.tip || "")).toLowerCase();

  ingredientGroups.forEach((group, gi) => {
    const gname = (group.name || "").toLowerCase();
    if (gname.length >= 5 && haystack.includes(gname)) {
      group.items.forEach((item, ii) => push(gi, ii, item));
    }
  });
  if (matched.length) return matched;

  ingredientGroups.forEach((group, gi) => {
    group.items.forEach((item, ii) => {
      const cleanText = item.text.toLowerCase().replace(/,.*$/, "");
      const words = cleanText.split(/[\s\-\/]+/)
        .filter((w) => w.length >= 4 && !STOP.has(w) && !/^\d/.test(w));
      if (words.length === 0) return;
      const hit = words.some((w) => {
        const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp("\\b" + escaped + "\\b").test(haystack)) return true;
        if (w.length >= 5 && haystack.includes(w.replace(/s$/, ""))) return true;
        return false;
      });
      if (hit) push(gi, ii, item);
    });
  });

  return matched;
}

const recipes = loadRecipes();
const emptySteps = [];
const orphanIngredients = [];

for (const r of recipes) {
  const groups = r.ingredientGroups || [];
  const steps = r.steps || [];
  const usedKeys = new Set();

  steps.forEach((step, si) => {
    const matched = ingredientsForStep(step, groups);
    matched.forEach((m) => usedKeys.add(itemKey(m.gi, m.ii)));
    if (matched.length === 0) {
      emptySteps.push({ slug: r.slug, step: si + 1, title: step.title });
    }
  });

  groups.forEach((g, gi) => {
    g.items.forEach((item, ii) => {
      if (!usedKeys.has(itemKey(gi, ii))) {
        orphanIngredients.push({ slug: r.slug, group: g.name, text: item.text });
      }
    });
  });
}

if (emptySteps.length) {
  console.log("EMPTY STEPS (no ingredients in cook mode):");
  emptySteps.forEach((e) => console.log(`  ${e.slug} #${e.step} "${e.title}"`));
}
if (orphanIngredients.length) {
  console.log("\nORPHAN INGREDIENTS (never shown in any step):");
  orphanIngredients.forEach((o) => console.log(`  ${o.slug} [${o.group}] ${o.text}`));
}

const issues = emptySteps.length + orphanIngredients.length;
console.log(`\nTotal issues: ${issues}`);
process.exit(issues > 0 ? 1 : 0);
