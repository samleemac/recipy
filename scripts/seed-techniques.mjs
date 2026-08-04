#!/usr/bin/env node
/**
 * Recipy — seed the Cookery School technique guides from techniques-data.js
 * into the Supabase `techniques` table.
 *
 * Usage:
 *   npm install @supabase/supabase-js
 *   SUPABASE_URL="https://xxxx.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="ey..." \
 *   npm run seed:techniques
 *
 * The service-role key is sensitive — keep it out of git and the browser.
 * Get it from Supabase → Project → Settings → API → "service_role / secret".
 *
 * The script is idempotent: re-running upserts by slug without duplicating rows.
 * Run scripts/techniques-migration.sql in the Supabase SQL editor first.
 */
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.\n" +
      "Get them from: Supabase → Project → Settings → API."
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

/* ------------------------------------------------------------
   1. Load techniques-data.js by evaluating it in a sandbox
------------------------------------------------------------ */
function loadTechniques() {
  const file = path.join(ROOT, "techniques-data.js");
  const code = fs.readFileSync(file, "utf-8");
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  if (!Array.isArray(ctx.window.TECHNIQUES)) {
    throw new Error("techniques-data.js did not populate window.TECHNIQUES");
  }
  return ctx.window.TECHNIQUES;
}

/* ------------------------------------------------------------
   2. Convert JS shape → DB row
------------------------------------------------------------ */
function toRow(t) {
  return {
    slug:                        t.slug,
    title:                       t.title,
    subtitle:                    t.subtitle || "",
    hero_photo:                  t.heroPhoto || "",
    icon:                        t.icon || "",
    skill_level:                 t.skillLevel || "Beginner",
    read_time:                   t.readTime || 5,
    tags:                        t.tags || [],
    intro:                       t.intro || "",
    fact:                        t.fact || null,
    methods:                     t.methods || [],
    seasoning_ideas:             t.seasoningIdeas || [],
    tools_needed:                t.toolsNeeded || [],
    top_tips:                    t.topTips || [],
    troubleshooting:             t.troubleshooting || [],
    methods_section_tag:         t.methodsSectionTag || null,
    methods_section_title:       t.methodsSectionTitle || null,
    methods_tablist_label:       t.methodsTablistLabel || null,
    related_ingredient_keywords: t.relatedIngredientKeywords || [],
  };
}

/* ------------------------------------------------------------
   3. Upsert by slug
------------------------------------------------------------ */
async function main() {
  console.log("→ loading techniques-data.js");
  const techniques = loadTechniques();
  console.log(`  found ${techniques.length} guides`);

  const rows = techniques.map(toRow);
  const { data, error } = await supabase
    .from("techniques")
    .upsert(rows, { onConflict: "slug" })
    .select("slug");
  if (error) throw error;

  console.log(`✔ upserted ${data.length} guides:`);
  data.forEach((r) => console.log(`   · ${r.slug}`));
  console.log("\nAll done. Admins can now edit guides from technique pages.");
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message || err);
  process.exit(1);
});
