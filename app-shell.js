/* ============================================================
   Recipy — shared app shell (pill nav, auth modal, account menu)

   Mount: AppShell.mount({ page: 'home'|'feed'|'recipe'|'profile'|'upload'|'admin', recipeTitle })
   Or set <body data-page="feed"> and call mount() on DOMContentLoaded.
   ============================================================ */
(function () {
  "use strict";

  const THEME_KEY = "recipy.theme";
  const DEFAULT_THEME = "light";
  const SVG_SUN = `<svg class="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>`;
  const SVG_MOON = `<svg class="moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  function applyTheme(theme) {
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
  }

  function getStoredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "dark" || saved === "light" ? saved : null;
  }

  function setStoredTheme(theme) {
    localStorage.setItem(THEME_KEY, theme === "dark" ? "dark" : "light");
  }

  function themeFromUser(user) {
    const t = user?.user_metadata?.theme;
    return t === "dark" || t === "light" ? t : null;
  }

  async function persistThemeForUser(theme) {
    if (!currentUser || !window.RECIPY?.configured) return;
    try {
      await window.RECIPY.auth.updateTheme(theme);
    } catch (_) {}
  }

  function syncThemeForUser(user) {
    const accountTheme = user ? themeFromUser(user) : null;
    if (accountTheme) {
      applyTheme(accountTheme);
      setStoredTheme(accountTheme);
      return;
    }
    const stored = getStoredTheme();
    applyTheme(stored || DEFAULT_THEME);
  }

  (function initThemeBootstrap() {
    applyTheme(getStoredTheme() || DEFAULT_THEME);
  })();

  let currentUser = null;
  let currentProfile = null;
  let mountOptions = { page: "home", recipeTitle: "" };
  const authListeners = [];

  function $(s, root = document) { return root.querySelector(s); }

  function navLink(href, label, pageKey, activePage) {
    const active = pageKey === activePage;
    return `<li><a href="${href}" class="${active ? "is-active" : ""}" ${active ? 'aria-current="page"' : ""}>${label}</a></li>`;
  }

  function pillNavHtml(opts) {
    const page = opts.page || "home";
    const isRecipe = page === "recipe";
    const showIssue = page === "home";
    const showCmdk = page === "home" || page === "recipe";
    const showBookmark = page === "home" || page === "recipe";
    const recipeTitle = opts.recipeTitle || "…";

    const brand = isRecipe
      ? `<a href="index.html" class="back-btn" aria-label="Back to recipes">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
         </a>
         <a href="index.html" class="logo" aria-label="Recipy home">RECIPY<span class="logo-dot" aria-hidden="true"></span></a>`
      : `<a href="index.html" class="logo" id="brandLogo" aria-label="Recipy home">RECIPY<span class="logo-dot" aria-hidden="true"></span></a>
         ${showIssue ? `<span class="nav-issue" id="navIssue" aria-hidden="true"><span class="pulse"></span><span>Nº47 · Live</span></span>` : ""}`;

    return `
      <nav class="nav" aria-label="Primary">
        <div class="nav-brand">${brand}</div>
        ${isRecipe
          ? `<div class="nav-crumb"><a href="index.html">Recipes</a> · <strong id="navCrumbTitle">${escapeHtml(recipeTitle)}</strong></div>`
          : `<ul class="nav-links">
              ${navLink("index.html", "Recipes", "home", page)}
              <li data-auth="user">${innerNavLink("feed.html", "Feed", "feed", page)}</li>
              <li data-auth="user">${innerNavLink("upload.html", "Submit", "upload", page)}</li>
              <li data-auth="admin">${innerNavLink("admin.html", "Admin", "admin", page)}</li>
            </ul>`}
        <div class="nav-right">
          ${showCmdk ? `
          <button class="cmdk-trigger" id="cmdkTrigger" type="button" aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span class="label">Search…</span>
            <span class="kbd" aria-hidden="true"><span id="kbdKey">⌘K</span></span>
          </button>` : ""}
          ${isRecipe ? "" : `
          <button class="icon-btn nav-hamburger" id="navHamburger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>`}
          <div class="nav-icons">
            <button class="icon-btn theme-toggle" id="themeToggle" type="button" aria-label="Toggle dark mode">${SVG_SUN}${SVG_MOON}</button>
            ${showBookmark ? `
            <button class="icon-btn" id="navBookmark" type="button" aria-label="Show saved recipes">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              <span class="badge" id="bookmarkBadge" aria-hidden="true">0</span>
            </button>` : ""}
            <div class="account-wrap">
              <button class="account-btn" id="accountBtn" type="button" aria-label="Account" aria-haspopup="menu" aria-expanded="false">
                <svg id="accountIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span class="avatar-letter" id="accountInitial" hidden></span>
              </button>
              <div class="account-menu" id="accountMenu" role="menu">
                <div class="account-menu-head" data-auth="user">
                  <div class="account-menu-name" id="accountMenuName">—</div>
                  <div class="account-menu-sub" id="accountMenuSub">@—</div>
                </div>
                <a data-auth="guest" href="#" id="menuSignIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                  Sign in or sign up
                </a>
                <a data-auth="user" href="#" id="menuProfile">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Your profile
                </a>
                <a data-auth="user" href="feed.html">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>
                  Feed
                </a>
                <a data-auth="user" href="upload.html">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Upload a recipe
                </a>
                <a data-auth="admin" href="admin.html">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                  Admin queue
                </a>
                <hr data-auth="user">
                <button class="danger" data-auth="user" id="menuSignOut" type="button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      ${isRecipe ? "" : `
      <div class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">
        <a href="index.html" class="${page === "home" ? "is-active" : ""}">Recipes</a>
        <a data-auth="user" href="feed.html" class="${page === "feed" ? "is-active" : ""}">Feed</a>
        <a data-auth="user" href="upload.html" class="${page === "upload" ? "is-active" : ""}">Submit</a>
        <a data-auth="admin" href="admin.html" class="${page === "admin" ? "is-active" : ""}">Admin</a>
      </div>`}`;
  }

  function innerNavLink(href, label, pageKey, activePage) {
    const active = pageKey === activePage;
    return `<a href="${href}" class="${active ? "is-active" : ""}" ${active ? 'aria-current="page"' : ""}>${label}</a>`;
  }

  function escapeHtml(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function authModalHtml() {
    return `
      <div class="auth-backdrop" id="authBackdrop"></div>
      <div class="auth-modal" id="authModal" role="dialog" aria-modal="true" aria-labelledby="authTitle">
        <div class="auth-head">
          <button class="auth-close" id="authClose" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <h2 id="authTitle">Welcome back</h2>
          <p id="authSub">Sign in to save recipes, follow friends and share what you cook.</p>
        </div>
        <div class="auth-config-warning" id="authConfigWarning" hidden>
          <strong>Supabase isn't connected yet.</strong> Add your project URL and anon key to <code>config.js</code> to enable accounts.
        </div>
        <div class="auth-tabs" role="tablist">
          <button class="auth-tab is-active" id="tabSignin" type="button">Sign in</button>
          <button class="auth-tab" id="tabSignup" type="button">Create account</button>
        </div>
        <div class="auth-oauth">
          <button type="button" class="btn-google" id="authGoogleBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            Continue with Google
          </button>
          <div class="auth-divider"><span>or use email</span></div>
        </div>
        <form class="auth-form" id="authForm" autocomplete="on">
          <div class="form-field" id="fieldUsername" hidden>
            <label for="authUsername">Username</label>
            <input class="form-input" type="text" id="authUsername" placeholder="lowercase, 3–24 chars" minlength="3" maxlength="24" pattern="[a-z0-9_-]+" autocomplete="username" />
          </div>
          <div class="form-field" id="fieldDisplay" hidden>
            <label for="authDisplay">Display name</label>
            <input class="form-input" type="text" id="authDisplay" placeholder="What should we call you?" autocomplete="name" />
          </div>
          <div class="form-field">
            <label for="authEmail">Email</label>
            <input class="form-input" type="email" id="authEmail" required autocomplete="email" />
          </div>
          <div class="form-field">
            <label for="authPassword">Password</label>
            <input class="form-input" type="password" id="authPassword" minlength="6" required autocomplete="current-password" />
          </div>
          <div class="auth-error" id="authError"></div>
          <button type="submit" class="btn btn-primary" id="authSubmit">Sign in</button>
        </form>
        <div class="auth-foot">By continuing you agree to our terms &amp; privacy.</div>
      </div>
    `;
  }

  function toastsHtml() {
    return `<div class="toasts" id="toasts" aria-live="polite" aria-atomic="true"></div>`;
  }

  function applyUserState(profile) {
    document.body.classList.toggle("is-signed-in", !!profile);
    document.body.classList.toggle("is-admin", !!(profile && profile.role === "admin"));

    const btn = $("#accountBtn");
    const initEl = $("#accountInitial");
    const iconEl = $("#accountIcon");

    if (profile) {
      if (btn) btn.classList.add("is-signed-in");
      if (profile.avatar_url) {
        if (btn) {
          btn.style.backgroundImage = `url("${profile.avatar_url}")`;
          btn.style.backgroundSize = "cover";
          btn.style.backgroundPosition = "center";
        }
        if (initEl) initEl.hidden = true;
        if (iconEl) iconEl.hidden = true;
      } else {
        if (btn) btn.style.backgroundImage = "";
        if (initEl) {
          initEl.hidden = false;
          initEl.textContent = (profile.display_name || profile.username || "U")[0].toUpperCase();
        }
        if (iconEl) iconEl.hidden = true;
      }
      const name = $("#accountMenuName");
      const sub = $("#accountMenuSub");
      if (name) name.textContent = profile.display_name || profile.username;
      if (sub) sub.textContent = "@" + profile.username;
      const profileLink = $("#menuProfile");
      if (profileLink) profileLink.href = `profile.html?u=${encodeURIComponent(profile.username)}`;
    } else {
      if (btn) {
        btn.classList.remove("is-signed-in");
        btn.style.backgroundImage = "";
      }
      if (initEl) initEl.hidden = true;
      if (iconEl) iconEl.hidden = false;
    }
  }

  function openAccountMenu(open) {
    const menu = $("#accountMenu");
    if (!menu) return;
    menu.classList.toggle("open", !!open);
    const btn = $("#accountBtn");
    if (btn) btn.setAttribute("aria-expanded", !!open);
  }

  function switchAuthTab(mode) {
    const signin = mode === "signin";
    $("#tabSignin")?.classList.toggle("is-active", signin);
    $("#tabSignup")?.classList.toggle("is-active", !signin);
    const fu = $("#fieldUsername");
    const fd = $("#fieldDisplay");
    if (fu) fu.hidden = signin;
    if (fd) fd.hidden = signin;
    const submit = $("#authSubmit");
    if (submit) submit.textContent = signin ? "Sign in" : "Create account";
    const title = $("#authTitle");
    const sub = $("#authSub");
    if (title) title.textContent = signin ? "Welcome back" : "Join Recipy";
    if (sub) sub.textContent = signin
      ? "Sign in to save recipes, follow friends and share what you cook."
      : "Create an account to save recipes, follow cooks and share your own.";
  }

  function openAuthModal(mode = "signin") {
    $("#authBackdrop")?.classList.add("open");
    $("#authModal")?.classList.add("open");
    const warn = $("#authConfigWarning");
    if (warn) warn.hidden = !!(window.RECIPY && window.RECIPY.configured);
    switchAuthTab(mode);
    $("#authError")?.classList.remove("show");
  }

  function closeAuthModal() {
    $("#authBackdrop")?.classList.remove("open");
    $("#authModal")?.classList.remove("open");
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    const error = $("#authError");
    error?.classList.remove("show");
    if (!window.RECIPY || !window.RECIPY.configured) {
      if (error) { error.textContent = "Set up Supabase in config.js to enable accounts."; error.classList.add("show"); }
      return;
    }
    const mode = $("#tabSignin")?.classList.contains("is-active") ? "signin" : "signup";
    const email = $("#authEmail")?.value.trim();
    const password = $("#authPassword")?.value;
    const submit = $("#authSubmit");
    if (submit) submit.disabled = true;
    try {
      if (mode === "signup") {
        const username = $("#authUsername")?.value.trim().toLowerCase();
        const display = $("#authDisplay")?.value.trim() || username;
        await window.RECIPY.auth.signUp(email, password, username, display);
        toast("Account created — check your inbox if email confirmation is on.");
      } else {
        await window.RECIPY.auth.signIn(email, password);
        toast("Welcome back");
      }
      closeAuthModal();
      $("#authForm")?.reset();
    } catch (err) {
      if (error) { error.textContent = err.message || "Something went wrong."; error.classList.add("show"); }
    } finally {
      if (submit) submit.disabled = false;
    }
  }

  async function handleGoogleSignIn() {
    const error = $("#authError");
    error?.classList.remove("show");
    if (!window.RECIPY || !window.RECIPY.configured) {
      if (error) { error.textContent = "Set up Supabase in config.js to enable accounts."; error.classList.add("show"); }
      return;
    }
    const btn = $("#authGoogleBtn");
    if (btn) btn.disabled = true;
    try {
      await window.RECIPY.auth.signInWithGoogle();
    } catch (err) {
      if (error) { error.textContent = err.message || "Couldn't start Google sign in."; error.classList.add("show"); }
      if (btn) btn.disabled = false;
    }
  }

  function toast(msg) {
    const c = $("#toasts");
    if (!c) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    c.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => el.classList.remove("show"), 2400);
    setTimeout(() => el.remove(), 3000);
  }

  function initThemeToggle() {
    const btn = $("#themeToggle");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      setStoredTheme(next);
      await persistThemeForUser(next);
      toast(next === "dark" ? "Lights down. Cozy mode." : "Lights up.");
    });
  }

  function initNavScroll() {
    const navWrap = $("#navWrap");
    const progress = $("#scrollProgress");
    if (!navWrap) return;
    const onScroll = () => {
      navWrap.classList.toggle("is-stuck", window.scrollY > 8);
      if (progress) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = h > 0 ? (window.scrollY / h * 100).toFixed(2) + "%" : "0%";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setHeroIssue() {
    const el = $("#navIssue");
    if (!el) return;
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const now = new Date();
    const issueNum = 47 + now.getMonth();
    const span = el.querySelector("span:last-child");
    if (span) span.textContent = `Nº${issueNum} · ${months[now.getMonth()].toUpperCase()}`;
  }

  function bindShell() {
    $("#menuSignIn")?.addEventListener("click", (e) => {
      e.preventDefault();
      openAccountMenu(false);
      openAuthModal("signin");
    });
    $("#accountBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const menu = $("#accountMenu");
      openAccountMenu(!menu?.classList.contains("open"));
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".account-wrap")) openAccountMenu(false);
    });
    $("#menuSignOut")?.addEventListener("click", async () => {
      openAccountMenu(false);
      await window.RECIPY?.auth?.signOut?.();
      toast("Signed out");
    });
    $("#authBackdrop")?.addEventListener("click", closeAuthModal);
    $("#authClose")?.addEventListener("click", closeAuthModal);
    $("#tabSignin")?.addEventListener("click", () => switchAuthTab("signin"));
    $("#tabSignup")?.addEventListener("click", () => switchAuthTab("signup"));
    $("#authForm")?.addEventListener("submit", handleAuthSubmit);
    $("#authGoogleBtn")?.addEventListener("click", handleGoogleSignIn);
    initThemeToggle();
    initNavScroll();
    setHeroIssue();
    initNavBookmark();
    initMobileNav();

    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");
    const kbdKey = $("#kbdKey");
    if (kbdKey) kbdKey.textContent = isMac ? "⌘K" : "Ctrl K";
  }

  function initMobileNav() {
    const burger = $("#navHamburger");
    const menu = $("#mobileNav");
    if (!burger || !menu) return;
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#mobileNav") && !e.target.closest("#navHamburger")) {
        menu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        burger.focus();
      }
    });
  }

  function initNavBookmark() {
    const btn = $("#navBookmark");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (!currentUser) {
        toast("Sign in to see your saved recipes");
        openAuthModal("signin");
        return;
      }
      window.location.href = "profile.html?tab=saved";
    });
  }

  async function handleAuthChange(user) {
    currentUser = user || null;
    currentProfile = null;
    syncThemeForUser(user);
    if (user && window.RECIPY && window.RECIPY.configured) {
      currentProfile = await window.RECIPY.auth.getProfile(user);
    }
    applyUserState(currentProfile || (currentUser ? _fallbackProfile(currentUser) : null));
    authListeners.forEach((cb) => {
      try { cb(currentUser, currentProfile); } catch (_) {}
    });
  }

  function _fallbackProfile(user) {
    const meta = user.user_metadata || {};
    return {
      id: user.id,
      username: (meta.username || user.email?.split("@")[0] || "u").toLowerCase().replace(/[^a-z0-9_-]/g, ""),
      display_name: meta.full_name || meta.name || meta.display_name || user.email || "User",
      avatar_url: meta.picture || meta.avatar_url || null,
      bio: "",
      role: "user",
    };
  }

  let shellMounted = false;

  function mount(options = {}) {
    mountOptions = {
      page: options.page || document.body.dataset.page || "home",
      recipeTitle: options.recipeTitle || mountOptions.recipeTitle || "",
    };

    const navMount = document.getElementById("appNav");
    if (navMount) {
      navMount.innerHTML = pillNavHtml(mountOptions);
    }

    if (!shellMounted) {
      const div = document.createElement("div");
      div.innerHTML = authModalHtml() + toastsHtml();
      document.body.appendChild(div);
      shellMounted = true;
      bindShell();

      if (window.RECIPY && window.RECIPY.configured) {
        window.RECIPY.auth.onChange(handleAuthChange);
        window.RECIPY.auth.getSession().then((session) => {
          if (session?.user) handleAuthChange(session.user);
        });
        window.RECIPY.auth.getUser().then((user) => {
          if (user) handleAuthChange(user);
        });
      } else {
        applyUserState(null);
      }
    }
  }

  function setRecipeTitle(title) {
    mountOptions.recipeTitle = title || "";
    const el = document.getElementById("navCrumbTitle");
    if (el) el.textContent = title || "…";
  }

  window.AppShell = {
    mount,
    setRecipeTitle,
    toast,
    openAuthModal,
    closeAuthModal,
    onAuth(cb) { authListeners.push(cb); cb(currentUser, currentProfile); },
    user() { return currentUser; },
    profile() { return currentProfile; },
    requireAuth(redirectIfGuest) {
      if (currentUser) return Promise.resolve(currentUser);
      if (window.RECIPY && window.RECIPY.configured) openAuthModal("signin");
      return new Promise((resolve) => {
        const stop = window.RECIPY?.auth.onChange?.((u) => {
          if (u) { stop && stop(); resolve(u); }
          else if (redirectIfGuest) location.href = redirectIfGuest;
        }) || (() => {});
      });
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (document.getElementById("appNav") || document.getElementById("navWrap")) {
        mount({ page: document.body.dataset.page });
      }
    });
  } else if (document.getElementById("appNav") || document.getElementById("navWrap")) {
    mount({ page: document.body.dataset.page });
  }
})();
