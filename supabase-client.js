/* ============================================================
   Recipy — Supabase client wrapper
   Exposes window.RECIPY with everything the pages need.

   Loads after config.js + the supabase-js UMD bundle, e.g.:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
     <script src="config.js"></script>
     <script src="supabase-client.js"></script>

   Graceful fallback:
     If config.js still has empty strings the client runs in
     "offline mode" — recipe reads return window.RECIPES, auth
     functions return clear "not configured" errors. This lets
     the site keep working while you set Supabase up.
   ============================================================ */
(function () {
  "use strict";

  const cfg = window.RECIPY_CONFIG || {};
  const CONFIGURED = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);

  const sb = CONFIGURED
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

  /* ------------------------------------------------------------
     Recipe row ⇄ legacy JS shape
     The render code in index.html / recipe.html expects:
       { id, slug, title, author, role, cuisine, time, difficulty,
         baseServings, servingNoun, tags, photo, fact, intro, macros,
         equipment, ingredientGroups, steps, status, authorId,
         authorUsername }
  ------------------------------------------------------------ */
  function rowToRecipe(row, authorMap = {}) {
    if (!row) return null;
    const author = row.author_id ? authorMap[row.author_id] : null;
    return {
      id:              row.id,
      slug:            row.slug,
      title:           row.title,
      intro:           row.intro || "",
      cuisine:         row.cuisine || "",
      time:            row.time || 0,
      difficulty:      row.difficulty || 1,
      baseServings:    row.base_servings || 2,
      servingNoun:     row.serving_noun || "serving",
      tags:            row.tags || [],
      photo:           row.photo_url || "",
      fact:            row.fact || null,
      macros:          row.macros || { calories: 0, carbs: 0, protein: 0, fat: 0, fibre: 0, sugar: 0 },
      equipment:       row.equipment || [],
      ingredientGroups: row.ingredient_groups || [],
      steps:           row.steps || [],
      status:          row.status,
      rejectReason:    row.reject_reason || "",
      authorId:        row.author_id || null,
      authorUsername:  author?.username || "",
      author:          author?.display_name || author?.username || "Recipy",
      role:            author?.bio || "Recipe Developer",
      publishedAt:     row.published_at,
      createdAt:       row.created_at,
      pendingChanges:  row.pending_changes || null,
      pendingPhoto:    row.pending_photo_url || "",
      editRejectReason: row.edit_reject_reason || "",
      language:        row.language || "en",
      isLimitedEdition: !!row.is_limited_edition,
      variantGroup:    row.variant_group || null,
      isPrimary:       row.is_primary !== false,
    };
  }

  async function statsGetSiteStats() {
    if (!CONFIGURED) {
      const list = window.RECIPES || [];
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const newThisWeek = list.filter(r => {
        const t = r.createdAt ? new Date(r.createdAt).getTime() : 0;
        return t >= weekAgo;
      }).length;
      return { recipeCount: list.length, cookCount: 0, newThisWeek };
    }
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [recipesRes, profilesRes, newRes] = await Promise.all([
      sb.from("recipes").select("*", { count: "exact", head: true }).eq("status", "published"),
      sb.from("profiles").select("*", { count: "exact", head: true }),
      sb.from("recipes").select("*", { count: "exact", head: true })
        .eq("status", "published")
        .gte("created_at", weekAgo),
    ]);
    return {
      recipeCount: recipesRes.count ?? 0,
      cookCount:   profilesRes.count ?? 0,
      newThisWeek: newRes.count ?? 0,
    };
  }

  function recipeToRow(r) {
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
    };
  }

  /* ------------------------------------------------------------
     Session-scoped cache for the published recipe list.
  ------------------------------------------------------------ */
  const CACHE_KEY = "recipy.cache.recipes.v4";
  let recipesCache = null;
  try {
    sessionStorage.removeItem("recipy.cache.recipes.v1");
    sessionStorage.removeItem("recipy.cache.recipes.v2");
    sessionStorage.removeItem("recipy.cache.recipes.v3");
  } catch (_) {}

  function readCache() {
    if (recipesCache) return recipesCache;
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) recipesCache = JSON.parse(raw);
    } catch (_) {}
    return recipesCache;
  }
  function writeCache(list) {
    recipesCache = list;
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(list)); } catch (_) {}
  }
  function clearCache() {
    recipesCache = null;
    try { sessionStorage.removeItem(CACHE_KEY); } catch (_) {}
  }

  /* ------------------------------------------------------------
     Author lookup: map author_ids to public profile rows.
  ------------------------------------------------------------ */
  async function loadAuthors(ids) {
    if (!ids.length) return {};
    const { data } = await sb
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio")
      .in("id", ids);
    const map = {};
    (data || []).forEach((p) => (map[p.id] = p));
    return map;
  }

  /* ------------------------------------------------------------
     RECIPES
  ------------------------------------------------------------ */
  /* Only primary rows appear in listings — language variants of a limited
     edition (is_primary === false) are hidden from home/search/related. */
  function staticListable() {
    return (window.RECIPES || []).filter((r) => r.isPrimary !== false);
  }

  async function recipesGetAll(opts = {}) {
    if (!CONFIGURED) return staticListable().slice();

    const cached = !opts.fresh && readCache();
    if (cached) return cached;

    const { data, error } = await sb
      .from("recipes")
      .select("*")
      .eq("status", "published")
      .eq("is_primary", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("recipesGetAll", error);
      return staticListable().slice();
    }

    const ids = [...new Set((data || []).map((r) => r.author_id).filter(Boolean))];
    const authors = await loadAuthors(ids);
    const list = (data || []).map((r) => rowToRecipe(r, authors));
    writeCache(list);
    return list;
  }

  async function recipesGetBySlug(slug) {
    if (!CONFIGURED) {
      return (window.RECIPES || []).find((r) => r.slug === slug) || null;
    }
    const { data, error } = await sb
      .from("recipes")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    const authors = data.author_id ? await loadAuthors([data.author_id]) : {};
    return rowToRecipe(data, authors);
  }

  async function recipesGetByAuthor(authorId, includePending = false) {
    if (!CONFIGURED) return [];
    const statuses = includePending
      ? ["published", "pending", "draft", "rejected"]
      : ["published"];
    const { data } = await sb
      .from("recipes")
      .select("*")
      .eq("author_id", authorId)
      .eq("is_primary", true)
      .in("status", statuses)
      .order("created_at", { ascending: false });
    const authors = authorId ? await loadAuthors([authorId]) : {};
    return (data || []).map((r) => rowToRecipe(r, authors));
  }

  /* Fetch all published language siblings of a limited edition recipe,
     including non-primary variants, so the recipe page can offer a
     language toggle. Returns app-shape recipe objects. */
  async function recipesGetVariants(group) {
    if (!group) return [];
    if (!CONFIGURED) {
      return (window.RECIPES || []).filter((r) => r.variantGroup === group);
    }
    const { data, error } = await sb
      .from("recipes")
      .select("*")
      .eq("variant_group", group)
      .eq("status", "published");
    if (error) {
      console.warn("recipesGetVariants", error);
      return [];
    }
    const ids = [...new Set((data || []).map((r) => r.author_id).filter(Boolean))];
    const authors = await loadAuthors(ids);
    return (data || []).map((r) => rowToRecipe(r, authors));
  }

  /* Apply a snake_case pending_changes payload onto an app-shape recipe
     object so the admin queue can preview the proposed content. */
  function applyPendingChanges(recipe, row) {
    const pc = row.pending_changes;
    if (!pc) return recipe;
    return {
      ...recipe,
      title:           pc.title ?? recipe.title,
      intro:           pc.intro ?? recipe.intro,
      cuisine:         pc.cuisine ?? recipe.cuisine,
      time:            pc.time ?? recipe.time,
      difficulty:      pc.difficulty ?? recipe.difficulty,
      baseServings:    pc.base_servings ?? recipe.baseServings,
      servingNoun:     pc.serving_noun ?? recipe.servingNoun,
      tags:            pc.tags ?? recipe.tags,
      fact:            "fact" in pc ? pc.fact : recipe.fact,
      macros:          "macros" in pc ? pc.macros : recipe.macros,
      equipment:       pc.equipment ?? recipe.equipment,
      ingredientGroups: pc.ingredient_groups ?? recipe.ingredientGroups,
      steps:           pc.steps ?? recipe.steps,
      photo:           row.pending_photo_url || recipe.photo,
    };
  }

  async function recipesGetPending() {
    if (!CONFIGURED) return [];
    const { data, error } = await sb
      .from("recipes")
      .select("*")
      .or("status.eq.pending,pending_changes.not.is.null")
      .order("created_at", { ascending: true });
    if (error) return [];
    const ids = [...new Set((data || []).map((r) => r.author_id).filter(Boolean))];
    const authors = await loadAuthors(ids);
    return (data || []).map((r) => {
      const base = rowToRecipe(r, authors);
      const isEdit = !!r.pending_changes;
      if (!isEdit) return { ...base, isEdit: false };
      // For edits, show the proposed content but keep a copy of what's live.
      const proposed = applyPendingChanges(base, r);
      return { ...proposed, isEdit: true, liveTitle: base.title };
    });
  }

  async function recipesGetByIds(ids) {
    if (!ids || !ids.length) return [];
    if (!CONFIGURED) {
      return (window.RECIPES || []).filter((r) => ids.includes(r.id));
    }
    const { data, error } = await sb
      .from("recipes")
      .select("*")
      .in("id", ids)
      .eq("status", "published");
    if (error) {
      console.warn("recipesGetByIds", error);
      return [];
    }
    const authorIds = [...new Set((data || []).map((r) => r.author_id).filter(Boolean))];
    const authors = await loadAuthors(authorIds);
    return (data || []).map((r) => rowToRecipe(r, authors));
  }

  async function recipesSubmit(recipe, photoFile) {
    if (!CONFIGURED) throw new Error("Supabase is not configured.");
    const user = await authGetUser();
    if (!user) throw new Error("Sign in to submit a recipe.");

    let photoUrl = recipe.photo || null;
    if (photoFile) {
      const ext = (photoFile.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const up = await sb.storage.from("recipes").upload(path, photoFile, {
        cacheControl: "3600",
        upsert: false,
      });
      if (up.error) throw up.error;
      photoUrl = sb.storage.from("recipes").getPublicUrl(path).data.publicUrl;
    }

    const row = recipeToRow({ ...recipe, photo: photoUrl });
    row.author_id = user.id;
    row.status = "pending";
    row.slug = await uniqueSlug(row.slug || slugify(row.title));

    const { data, error } = await sb.from("recipes").insert(row).select().single();
    if (error) throw error;
    return data;
  }

  /* Edit an existing recipe. The proposed changes are stored as
     pending_changes (the live recipe is untouched) and enter the admin
     queue. Callable by the recipe's author or an admin (enforced by the
     submit_recipe_edit RPC). */
  async function recipesUpdate(id, recipe, photoFile) {
    if (!CONFIGURED) throw new Error("Supabase is not configured.");
    const user = await authGetUser();
    if (!user) throw new Error("Sign in to edit a recipe.");

    let photoUrl = recipe.photo || null;
    if (photoFile) {
      const ext = (photoFile.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const up = await sb.storage.from("recipes").upload(path, photoFile, {
        cacheControl: "3600",
        upsert: false,
      });
      if (up.error) throw up.error;
      photoUrl = sb.storage.from("recipes").getPublicUrl(path).data.publicUrl;
    }

    // Build the proposed payload. Keep slug stable (omit it) so existing
    // links and bookmarks keep working.
    const row = recipeToRow({ ...recipe, photo: photoUrl });
    delete row.photo_url;
    delete row.slug;

    const { error } = await sb.rpc("submit_recipe_edit", {
      p_recipe_id: id,
      p_changes: row,
      p_photo_url: photoUrl,
    });
    if (error) throw error;
    clearCache();
  }

  async function uniqueSlug(base) {
    let candidate = base;
    let i = 0;
    while (true) {
      const { data } = await sb.from("recipes").select("id").eq("slug", candidate).maybeSingle();
      if (!data) return candidate;
      i += 1;
      candidate = `${base}-${i}`;
    }
  }

  function slugify(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || `recipe-${Date.now().toString(36)}`;
  }

  async function recipesApprove(id) {
    if (!CONFIGURED) throw new Error("Supabase is not configured.");
    const { error } = await sb.rpc("approve_recipe", { p_recipe_id: id });
    if (error) throw error;
    clearCache();
  }

  async function recipesReject(id, reason) {
    if (!CONFIGURED) throw new Error("Supabase is not configured.");
    const { error } = await sb.rpc("reject_recipe", { p_recipe_id: id, p_reason: reason || "" });
    if (error) throw error;
    clearCache();
  }

  /* ------------------------------------------------------------
     AUTH
  ------------------------------------------------------------ */
  async function authGetUser() {
    if (!CONFIGURED) return null;
    /* getSession is synchronous/cached — check it first, then validate */
    const { data: sd } = await sb.auth.getSession();
    if (sd?.session?.user) return sd.session.user;
    const { data } = await sb.auth.getUser();
    return data?.user || null;
  }

  async function authGetSession() {
    if (!CONFIGURED) return null;
    const { data } = await sb.auth.getSession();
    return data?.session || null;
  }

  async function authGetProfile(user) {
    if (!CONFIGURED) return null;
    const u = user || (await authGetUser());
    if (!u) return null;
    /* Retry up to 3 times with a short delay — on first Google sign-up
       the handle_new_user trigger may not have committed yet when this runs */
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 800));
      const { data } = await sb
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio, role")
        .eq("id", u.id)
        .maybeSingle();
      if (data) return data;
    }
    /* Still no profile — synthesise a minimal one from auth metadata so
       the user doesn't appear signed out while the trigger catches up */
    const meta = u.user_metadata || {};
    return {
      id:           u.id,
      username:     (meta.username || u.email?.split("@")[0] || "user").toLowerCase().replace(/[^a-z0-9_-]/g, ""),
      display_name: meta.full_name || meta.name || meta.display_name || u.email || "User",
      avatar_url:   meta.picture || meta.avatar_url || null,
      bio:          "",
      role:         "user",
    };
  }

  async function authSignUp(email, password, username, displayName) {
    if (!CONFIGURED) throw new Error("Supabase is not configured.");
    const cleanUsername = (username || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (cleanUsername.length < 3) throw new Error("Username must be at least 3 characters (a-z, 0-9, _ or -).");
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
          display_name: displayName || cleanUsername,
        },
      },
    });
    if (error) throw error;
    return data;
  }

  async function authSignIn(email, password) {
    if (!CONFIGURED) throw new Error("Supabase is not configured.");
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function authSignInWithGoogle() {
    if (!CONFIGURED) throw new Error("Supabase is not configured.");
    /* Use only the page's origin + pathname — no query/hash — so the URL
       is predictable and matches the Supabase Redirect URLs allow-list */
    const redirectTo = window.location.origin + window.location.pathname;
    const { data, error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { access_type: "offline", prompt: "select_account" },
      },
    });
    if (error) throw error;
    return data;
  }

  async function authSignOut() {
    if (!CONFIGURED) return;
    await sb.auth.signOut();
    clearCache();
  }

  async function authUpdateTheme(theme) {
    if (!CONFIGURED) return;
    const user = await authGetUser();
    if (!user) return;
    const next = theme === "dark" ? "dark" : "light";
    const { error } = await sb.auth.updateUser({
      data: { ...(user.user_metadata || {}), theme: next },
    });
    if (error) throw error;
  }

  function authOnChange(cb) {
    if (!CONFIGURED) return () => {};
    const { data } = sb.auth.onAuthStateChange((evt, session) => {
      cb(session?.user || null, evt);
    });
    return () => data.subscription.unsubscribe();
  }

  /* ------------------------------------------------------------
     PROFILES
  ------------------------------------------------------------ */
  async function profileByUsername(username) {
    if (!CONFIGURED) return null;
    const { data } = await sb
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, role, created_at")
      .eq("username", (username || "").toLowerCase())
      .maybeSingle();
    return data || null;
  }

  async function profileSearch(q, limit = 20) {
    if (!CONFIGURED) return [];
    const needle = (q || "").trim().replace(/[%_,]/g, "");
    if (!needle) return [];
    const like = `%${needle}%`;
    const { data, error } = await sb
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio")
      .or(`username.ilike.${like},display_name.ilike.${like}`)
      .order("username", { ascending: true })
      .limit(limit);
    if (error) {
      console.warn("profileSearch", error);
      return [];
    }
    return data || [];
  }

  async function profileUpdate(patch) {
    if (!CONFIGURED) throw new Error("Supabase is not configured.");
    const user = await authGetUser();
    if (!user) throw new Error("Sign in required.");
    const { error } = await sb.from("profiles").update(patch).eq("id", user.id);
    if (error) throw error;
  }

  /* Resize an image File to a max edge (default 256px), centre-crop to square,
     return a JPEG data URL. Keeps avatars tiny (~10–30 KB) so we can stash
     them straight in profiles.avatar_url and skip storage policy management. */
  async function resizeAvatarToDataUrl(file, maxEdge = 256, quality = 0.85) {
    const bitmap = await createImageBitmap(file).catch(async () => {
      /* Fallback for older browsers: use <img> */
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
      URL.revokeObjectURL(url);
      return img;
    });
    const srcW = bitmap.width || bitmap.naturalWidth;
    const srcH = bitmap.height || bitmap.naturalHeight;
    const side = Math.min(srcW, srcH);
    const sx = (srcW - side) / 2;
    const sy = (srcH - side) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = maxEdge;
    canvas.height = maxEdge;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, maxEdge, maxEdge);
    return canvas.toDataURL("image/jpeg", quality);
  }

  async function profileUploadAvatar(file) {
    if (!CONFIGURED) throw new Error("Supabase is not configured.");
    const user = await authGetUser();
    if (!user) throw new Error("Sign in required.");
    if (!file || !file.type || !file.type.startsWith("image/")) {
      throw new Error("Please choose an image file.");
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error("Photo must be 8 MB or smaller.");
    }
    const dataUrl = await resizeAvatarToDataUrl(file, 256, 0.85);
    const { error } = await sb.from("profiles").update({ avatar_url: dataUrl }).eq("id", user.id);
    if (error) throw error;
    return dataUrl;
  }

  /* ------------------------------------------------------------
     BOOKMARKS
  ------------------------------------------------------------ */
  async function bookmarksList() {
    if (!CONFIGURED) return [];
    const user = await authGetUser();
    if (!user) return [];
    const { data } = await sb.from("bookmarks").select("recipe_id").eq("user_id", user.id);
    return (data || []).map((b) => b.recipe_id);
  }

  async function bookmarksAdd(recipeId) {
    if (!CONFIGURED) throw new Error("Sign in required.");
    const user = await authGetUser();
    if (!user) throw new Error("Sign in required.");
    const { error } = await sb.from("bookmarks").upsert({ user_id: user.id, recipe_id: recipeId });
    if (error) throw error;
  }

  async function bookmarksRemove(recipeId) {
    if (!CONFIGURED) throw new Error("Sign in required.");
    const user = await authGetUser();
    if (!user) throw new Error("Sign in required.");
    const { error } = await sb
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId);
    if (error) throw error;
  }

  /* ------------------------------------------------------------
     FOLLOWS
  ------------------------------------------------------------ */
  async function followsIsFollowing(followeeId) {
    if (!CONFIGURED) return false;
    const user = await authGetUser();
    if (!user || user.id === followeeId) return false;
    const { data } = await sb
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("followee_id", followeeId)
      .maybeSingle();
    return !!data;
  }

  async function followsToggle(followeeId) {
    if (!CONFIGURED) throw new Error("Sign in required.");
    const user = await authGetUser();
    if (!user) throw new Error("Sign in required.");
    if (user.id === followeeId) throw new Error("You can't follow yourself.");
    const already = await followsIsFollowing(followeeId);
    if (already) {
      await sb.from("follows").delete().eq("follower_id", user.id).eq("followee_id", followeeId);
      return false;
    }
    await sb.from("follows").insert({ follower_id: user.id, followee_id: followeeId });
    return true;
  }

  async function followsCounts(profileId) {
    if (!CONFIGURED) return { followers: 0, following: 0 };
    const [{ count: followers }, { count: following }] = await Promise.all([
      sb.from("follows").select("*", { count: "exact", head: true }).eq("followee_id", profileId),
      sb.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profileId),
    ]);
    return { followers: followers || 0, following: following || 0 };
  }

  async function followsFolloweeIds(userId) {
    if (!CONFIGURED) return [];
    const { data } = await sb.from("follows").select("followee_id").eq("follower_id", userId);
    return (data || []).map((r) => r.followee_id);
  }

  /* ------------------------------------------------------------
     COOKED POSTS
  ------------------------------------------------------------ */
  async function postsUploadPhoto(file) {
    if (!CONFIGURED) throw new Error("Supabase is not configured.");
    const user = await authGetUser();
    if (!user) throw new Error("Sign in required.");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const up = await sb.storage.from("cooks").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (up.error) throw up.error;
    return sb.storage.from("cooks").getPublicUrl(path).data.publicUrl;
  }

  async function postsCreate({ recipeId, caption, photoUrl }) {
    if (!CONFIGURED) throw new Error("Sign in required.");
    const user = await authGetUser();
    if (!user) throw new Error("Sign in required.");
    const { data, error } = await sb
      .from("cooked_posts")
      .insert({
        user_id: user.id,
        recipe_id: recipeId,
        caption: caption || "",
        photo_url: photoUrl || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function postsFeed({ scope = "following", limit = 50 } = {}) {
    if (!CONFIGURED) return [];
    const user = await authGetUser();
    let query = sb
      .from("cooked_posts")
      .select("id, user_id, recipe_id, caption, photo_url, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (scope === "following" && user) {
      const ids = await followsFolloweeIds(user.id);
      ids.push(user.id);
      query = query.in("user_id", ids);
    }
    const { data, error } = await query;
    if (error) return [];

    const posts = data || [];
    const userIds   = [...new Set(posts.map((p) => p.user_id))];
    const recipeIds = [...new Set(posts.map((p) => p.recipe_id))];

    const [profilesRes, recipesRes, likesRes] = await Promise.all([
      userIds.length
        ? sb.from("profiles").select("id, username, display_name, avatar_url").in("id", userIds)
        : Promise.resolve({ data: [] }),
      recipeIds.length
        ? sb.from("recipes").select("id, slug, title, photo_url").in("id", recipeIds)
        : Promise.resolve({ data: [] }),
      user && posts.length
        ? sb.from("cooked_likes").select("post_id").eq("user_id", user.id)
            .in("post_id", posts.map((p) => p.id))
        : Promise.resolve({ data: [] }),
    ]);

    const pmap = {};
    (profilesRes.data || []).forEach((p) => (pmap[p.id] = p));
    const rmap = {};
    (recipesRes.data || []).forEach((r) => (rmap[r.id] = r));
    const liked = new Set((likesRes.data || []).map((l) => l.post_id));

    const countsRes = posts.length
      ? await Promise.all(
          posts.map((p) =>
            sb.from("cooked_likes").select("*", { count: "exact", head: true }).eq("post_id", p.id)
          )
        )
      : [];

    return posts.map((p, i) => ({
      id:        p.id,
      caption:   p.caption,
      photoUrl:  p.photo_url,
      createdAt: p.created_at,
      author:    pmap[p.user_id] || null,
      recipe:    rmap[p.recipe_id] || null,
      likes:     countsRes[i]?.count || 0,
      likedByMe: liked.has(p.id),
    }));
  }

  async function postsLikeToggle(postId) {
    if (!CONFIGURED) throw new Error("Sign in required.");
    const user = await authGetUser();
    if (!user) throw new Error("Sign in required.");
    const { data: existing } = await sb
      .from("cooked_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .maybeSingle();
    if (existing) {
      await sb.from("cooked_likes").delete().eq("user_id", user.id).eq("post_id", postId);
      return false;
    }
    await sb.from("cooked_likes").insert({ user_id: user.id, post_id: postId });
    return true;
  }

  function postsSubscribe(cb) {
    if (!CONFIGURED) return () => {};
    const channel = sb
      .channel("cooked-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "cooked_posts" },
        (payload) => cb(payload.new)
      )
      .subscribe();
    return () => sb.removeChannel(channel);
  }

  async function postsByUser(userId, limit = 30) {
    if (!CONFIGURED) return [];
    const { data } = await sb
      .from("cooked_posts")
      .select("id, recipe_id, caption, photo_url, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    const ids = [...new Set((data || []).map((p) => p.recipe_id))];
    const rmap = {};
    if (ids.length) {
      const { data: rs } = await sb.from("recipes").select("id, slug, title, photo_url").in("id", ids);
      (rs || []).forEach((r) => (rmap[r.id] = r));
    }
    return (data || []).map((p) => ({
      id: p.id,
      caption: p.caption,
      photoUrl: p.photo_url,
      createdAt: p.created_at,
      recipe: rmap[p.recipe_id] || null,
    }));
  }

  /* ------------------------------------------------------------
     Public surface
  ------------------------------------------------------------ */
  window.RECIPY = {
    configured: CONFIGURED,
    sb,
    helpers: { slugify, rowToRecipe, recipeToRow, clearCache },

    auth: {
      getUser:    authGetUser,
      getProfile: authGetProfile,
      signUp:       authSignUp,
      signIn:       authSignIn,
      signInWithGoogle: authSignInWithGoogle,
      signOut:      authSignOut,
      getSession:   authGetSession,
      onChange:     authOnChange,
      updateTheme:  authUpdateTheme,
    },

    recipes: {
      getAll:      recipesGetAll,
      getBySlug:   recipesGetBySlug,
      getByAuthor: recipesGetByAuthor,
      getByIds:    recipesGetByIds,
      getVariants: recipesGetVariants,
      getPending:  recipesGetPending,
      submit:      recipesSubmit,
      update:      recipesUpdate,
      approve:     recipesApprove,
      reject:      recipesReject,
    },

    profiles: {
      byUsername:   profileByUsername,
      search:       profileSearch,
      update:       profileUpdate,
      uploadAvatar: profileUploadAvatar,
    },

    bookmarks: {
      list:   bookmarksList,
      add:    bookmarksAdd,
      remove: bookmarksRemove,
    },

    follows: {
      isFollowing:  followsIsFollowing,
      toggle:       followsToggle,
      counts:       followsCounts,
      followeeIds:  followsFolloweeIds,
    },

    posts: {
      uploadPhoto: postsUploadPhoto,
      create:      postsCreate,
      feed:        postsFeed,
      byUser:      postsByUser,
      likeToggle:  postsLikeToggle,
      subscribe:   postsSubscribe,
    },

    stats: {
      getSiteStats: statsGetSiteStats,
    },
  };
})();
