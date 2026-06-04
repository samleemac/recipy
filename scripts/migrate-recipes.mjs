#!/usr/bin/env node
/**
 * Recipy — migrate the seed 22 recipes from recipes-data.js into Supabase.
 *
 * Usage:
 *   npm install @supabase/supabase-js
 *   SUPABASE_URL="https://xxxx.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="ey..." \
 *   node scripts/migrate-recipes.mjs
 *
 * The service-role key is sensitive — keep it out of git and the browser.
 * Get it from Supabase → Project → Settings → API → "service_role / secret".
 *
 * The script is idempotent: re-running it will upsert by slug and update fields,
 * but won't duplicate rows or recreate the system user.
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
   1. Load recipes-data.js by evaluating it in a sandbox
------------------------------------------------------------ */
function loadRecipes() {
  const file = path.join(ROOT, "recipes-data.js");
  const code = fs.readFileSync(file, "utf-8");
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  if (!Array.isArray(ctx.window.RECIPES)) {
    throw new Error("recipes-data.js did not populate window.RECIPES");
  }
  return ctx.window.RECIPES;
}

/* ------------------------------------------------------------
   2. Ensure the system "Mackinley Kitchen" user exists
------------------------------------------------------------ */
const SYSTEM_EMAIL    = "mackinley-kitchen@recipy.local";
const SYSTEM_USERNAME = "mackinley-kitchen";
const SYSTEM_NAME     = "The Mackinley Kitchen";
const SYSTEM_BIO      = "Sara & Sam Mackinley · the system kitchen behind Recipy's launch library.";

async function ensureSystemUser() {
  // Look for an existing profile first
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", SYSTEM_USERNAME)
    .maybeSingle();
  if (existing) {
    console.log(`✔ system user @${SYSTEM_USERNAME} already exists (id: ${existing.id})`);
    return existing.id;
  }

  // Create via admin API; the on_auth_user_created trigger spawns the profile
  const { data, error } = await supabase.auth.admin.createUser({
    email: SYSTEM_EMAIL,
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: {
      username: SYSTEM_USERNAME,
      display_name: SYSTEM_NAME,
    },
  });
  if (error) throw error;
  const userId = data.user.id;
  console.log(`✔ created system user @${SYSTEM_USERNAME} (id: ${userId})`);

  // Set bio on the profile (trigger only sets username/display_name)
  await supabase.from("profiles").update({ bio: SYSTEM_BIO }).eq("id", userId);
  return userId;
}

/* ------------------------------------------------------------
   3. Convert JS shape → DB row
------------------------------------------------------------ */
function toRow(r, authorId) {
  return {
    slug:              r.slug,
    title:             r.title,
    intro:             r.intro || "",
    cuisine:           r.cuisine || "",
    time:              r.time || 0,
    difficulty:        r.difficulty || 1,
    base_servings:     r.baseServings || 2,
    serving_noun:      r.servingNoun || "serving",
    tags:              r.tags || [],
    photo_url:         r.photo || null,
    fact:              r.fact || null,
    macros:            r.macros || null,
    equipment:         r.equipment || [],
    ingredient_groups: r.ingredientGroups || [],
    steps:             r.steps || [],
    status:            "published",
    author_id:         authorId,
    published_at:      new Date().toISOString(),
    language:           r.language || "en",
    is_limited_edition: !!r.isLimitedEdition,
    variant_group:      r.variantGroup || null,
    is_primary:         r.isPrimary !== false,
  };
}

/* ------------------------------------------------------------
   4. Upsert recipes by slug
------------------------------------------------------------ */
async function importRecipes(authorId, recipes) {
  const rows = recipes.map((r) => toRow(r, authorId));
  const { error, data } = await supabase
    .from("recipes")
    .upsert(rows, { onConflict: "slug" })
    .select("slug");
  if (error) throw error;
  console.log(`✔ upserted ${data.length} recipes`);
  return data;
}

/* ------------------------------------------------------------
   Main
------------------------------------------------------------ */
async function main() {
  console.log("→ loading recipes-data.js");
  const recipes = loadRecipes();
  console.log(`  found ${recipes.length} recipes`);

  console.log("→ ensuring system user");
  const authorId = await ensureSystemUser();

  console.log("→ importing recipes");
  await importRecipes(authorId, recipes);

  console.log("\nAll done.");
  console.log("Next steps:");
  console.log("  1. Sign up your own account through the site.");
  console.log("  2. In Supabase SQL editor, promote yourself to admin:");
  console.log("       update public.profiles set role = 'admin' where username = '<your-username>';");
  console.log("  3. Once happy, delete recipes-data.js so the site only reads from the DB.");
}

main().catch((err) => {
  console.error("\nMigration failed:", err.message || err);
  process.exit(1);
});
