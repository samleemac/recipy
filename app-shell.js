/* ============================================================
   Recipy — shared app shell for profile / feed / upload / admin.

   On load:
   - Mounts the top nav into <div id="appNav">
   - Mounts the auth modal into <body>
   - Wires up auth state, theme, account dropdown, sign in / sign up

   Each consuming page can call window.AppShell.requireAuth(cb)
   to block its content until the user is signed in (the auth modal
   opens automatically if they're signed out).
   ============================================================ */
(function () {
  "use strict";

  const THEME_KEY = "recipy.theme";

  /* Theme bootstrap (matches index.html) ------------------- */
  (function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  })();

  let currentUser = null;
  let currentProfile = null;
  const authListeners = [];

  /* ---------------------------------------------------------
     DOM templates
  --------------------------------------------------------- */
  function navHtml() {
    return `
      <nav class="app-nav-inner">
        <a class="app-logo" href="index.html"><span>RECIPY</span><span class="dot" aria-hidden="true"></span></a>
        <ul class="app-nav-links">
          <li><a href="index.html">Recipes</a></li>
          <li data-auth="user"><a href="feed.html">Feed</a></li>
          <li><a href="upload.html">Submit</a></li>
          <li data-auth="admin"><a href="admin.html">Admin</a></li>
        </ul>
        <div class="app-nav-spacer"></div>

        <button class="btn btn-secondary" data-auth="guest" id="shellSignIn" type="button">Sign in</button>

        <div class="account-wrap" data-auth="user">
          <button class="account-btn" id="shellAccountBtn" aria-haspopup="menu" aria-expanded="false" aria-label="Account">
            <span id="shellAccountInitial">U</span>
          </button>
          <div class="account-menu" id="shellAccountMenu" role="menu">
            <div class="account-menu-head">
              <div class="account-menu-name" id="shellAccountName">—</div>
              <div class="account-menu-sub"  id="shellAccountSub">@—</div>
            </div>
            <a href="#" id="shellMenuProfile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Your profile
            </a>
            <a href="feed.html">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>
              Feed
            </a>
            <a href="upload.html">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Upload a recipe
            </a>
            <a href="admin.html" data-auth="admin">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
              Admin queue
            </a>
            <hr>
            <button class="danger" id="shellMenuSignOut" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Sign out
            </button>
          </div>
        </div>
      </nav>
    `;
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
          <button class="auth-tab"           id="tabSignup" type="button">Create account</button>
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

  /* ---------------------------------------------------------
     Behaviours
  --------------------------------------------------------- */
  function $(s, root = document) { return root.querySelector(s); }

  function applyUserState(profile) {
    document.body.classList.toggle("is-signed-in", !!profile);
    document.body.classList.toggle("is-admin", !!(profile && profile.role === "admin"));
    if (profile) {
      const initEl = $("#shellAccountInitial");
      const btn = $("#shellAccountBtn");
      if (btn) btn.classList.add("is-signed-in");
      if (profile.avatar_url) {
        if (btn) {
          btn.style.backgroundImage = `url("${profile.avatar_url}")`;
          btn.style.backgroundSize = "cover";
          btn.style.backgroundPosition = "center";
        }
        if (initEl) initEl.textContent = "";
      } else {
        if (btn) btn.style.backgroundImage = "";
        if (initEl) initEl.textContent = (profile.display_name || profile.username || "U")[0].toUpperCase();
      }
      const name = $("#shellAccountName");
      const sub  = $("#shellAccountSub");
      if (name) name.textContent = profile.display_name || profile.username;
      if (sub)  sub.textContent  = "@" + profile.username;
      const profileLink = $("#shellMenuProfile");
      if (profileLink) profileLink.href = `profile.html?u=${encodeURIComponent(profile.username)}`;
    } else {
      const btn = $("#shellAccountBtn");
      if (btn) { btn.classList.remove("is-signed-in"); btn.style.backgroundImage = ""; }
    }
  }

  function openAccountMenu(open) {
    const menu = $("#shellAccountMenu");
    if (!menu) return;
    menu.classList.toggle("open", !!open);
    const btn = $("#shellAccountBtn");
    if (btn) btn.setAttribute("aria-expanded", !!open);
  }

  function switchAuthTab(mode) {
    const signin = mode === "signin";
    $("#tabSignin").classList.toggle("is-active", signin);
    $("#tabSignup").classList.toggle("is-active", !signin);
    $("#fieldUsername").hidden = signin;
    $("#fieldDisplay").hidden  = signin;
    $("#authSubmit").textContent = signin ? "Sign in" : "Create account";
    $("#authTitle").textContent  = signin ? "Welcome back" : "Join Recipy";
    $("#authSub").textContent    = signin
      ? "Sign in to save recipes, follow friends and share what you cook."
      : "Create an account to save recipes, follow cooks and share your own.";
  }

  function openAuthModal(mode = "signin") {
    $("#authBackdrop").classList.add("open");
    $("#authModal").classList.add("open");
    $("#authConfigWarning").hidden = !!(window.RECIPY && window.RECIPY.configured);
    switchAuthTab(mode);
    $("#authError").classList.remove("show");
  }
  function closeAuthModal() {
    $("#authBackdrop").classList.remove("open");
    $("#authModal").classList.remove("open");
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    const error = $("#authError");
    error.classList.remove("show");
    if (!window.RECIPY || !window.RECIPY.configured) {
      error.textContent = "Set up Supabase in config.js to enable accounts.";
      error.classList.add("show");
      return;
    }
    const mode = $("#tabSignin").classList.contains("is-active") ? "signin" : "signup";
    const email = $("#authEmail").value.trim();
    const password = $("#authPassword").value;
    const submit = $("#authSubmit");
    submit.disabled = true;
    try {
      if (mode === "signup") {
        const username = $("#authUsername").value.trim().toLowerCase();
        const display  = $("#authDisplay").value.trim() || username;
        await window.RECIPY.auth.signUp(email, password, username, display);
        toast("Account created — check your inbox if email confirmation is on.");
      } else {
        await window.RECIPY.auth.signIn(email, password);
        toast("Welcome back");
      }
      closeAuthModal();
      $("#authForm").reset();
    } catch (err) {
      error.textContent = err.message || "Something went wrong.";
      error.classList.add("show");
    } finally {
      submit.disabled = false;
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

  function bindShell() {
    $("#shellSignIn")?.addEventListener("click", () => openAuthModal("signin"));
    $("#shellAccountBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const menu = $("#shellAccountMenu");
      openAccountMenu(!menu.classList.contains("open"));
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".account-wrap")) openAccountMenu(false);
    });
    $("#shellMenuSignOut")?.addEventListener("click", async () => {
      openAccountMenu(false);
      await window.RECIPY.auth.signOut();
      toast("Signed out");
    });
    $("#authBackdrop")?.addEventListener("click", closeAuthModal);
    $("#authClose")?.addEventListener("click", closeAuthModal);
    $("#tabSignin")?.addEventListener("click", () => switchAuthTab("signin"));
    $("#tabSignup")?.addEventListener("click", () => switchAuthTab("signup"));
    $("#authForm")?.addEventListener("submit", handleAuthSubmit);
    $("#authGoogleBtn")?.addEventListener("click", handleGoogleSignIn);
  }

  async function handleGoogleSignIn() {
    const error = $("#authError");
    error.classList.remove("show");
    if (!window.RECIPY || !window.RECIPY.configured) {
      error.textContent = "Set up Supabase in config.js to enable accounts.";
      error.classList.add("show");
      return;
    }
    const btn = $("#authGoogleBtn");
    btn.disabled = true;
    try {
      await window.RECIPY.auth.signInWithGoogle();
      /* Browser will redirect to Google; nothing more to do here */
    } catch (err) {
      error.textContent = err.message || "Couldn't start Google sign in.";
      error.classList.add("show");
      btn.disabled = false;
    }
  }

  async function handleAuthChange(user) {
    currentUser = user || null;
    currentProfile = null;
    if (user && window.RECIPY && window.RECIPY.configured) {
      currentProfile = await window.RECIPY.auth.getProfile(user);
    }
    applyUserState(currentProfile);
    authListeners.forEach((cb) => {
      try { cb(currentUser, currentProfile); } catch (_) {}
    });
  }

  function mount() {
    const navMount = document.getElementById("appNav");
    if (navMount) navMount.innerHTML = navHtml();

    const div = document.createElement("div");
    div.innerHTML = authModalHtml() + toastsHtml();
    document.body.appendChild(div);

    bindShell();

    if (window.RECIPY && window.RECIPY.configured) {
      window.RECIPY.auth.onChange(handleAuthChange);
      window.RECIPY.auth.getUser().then(handleAuthChange);
    } else {
      applyUserState(null);
    }
  }

  /* ---------------------------------------------------------
     Public API
  --------------------------------------------------------- */
  window.AppShell = {
    mount,
    toast,
    openAuthModal,
    closeAuthModal,
    onAuth(cb) { authListeners.push(cb); cb(currentUser, currentProfile); },
    user()    { return currentUser; },
    profile() { return currentProfile; },
    requireAuth(redirectIfGuest) {
      if (currentUser) return Promise.resolve(currentUser);
      if (window.RECIPY && window.RECIPY.configured) openAuthModal("signin");
      return new Promise((resolve) => {
        const stop = window.RECIPY?.auth.onChange?.((u) => {
          if (u) {
            stop && stop();
            resolve(u);
          } else if (redirectIfGuest) {
            location.href = redirectIfGuest;
          }
        }) || (() => {});
      });
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
