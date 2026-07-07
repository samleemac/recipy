# Recipy — Supabase setup

The site keeps working without Supabase (it falls back to `recipes-data.js`),
but accounts, bookmarks-across-devices, follows, the feed, uploads and the
admin queue all need Supabase. Setup is one evening of work.

## 1. Create your Supabase project

1. Sign up at <https://supabase.com> and create a free project.
2. Pick a region close to where most users will be.
3. Wait for the project to provision (~1 minute).

## 2. Run the schema

1. In the Supabase dashboard, go to **SQL Editor → New query**.
2. Paste the entire contents of `scripts/schema.sql`.
3. Click **Run**. You should see "Success. No rows returned."

This creates every table, index, trigger, RLS policy, the two storage
buckets (`recipes`, `cooks`) and enables realtime on `cooked_posts`.

> **Already set up before reviews shipped?** Run
> `scripts/reviews-migration.sql` in the SQL editor to add the
> `reviews` table (star ratings + comments on recipe pages). Fresh
> installs of `schema.sql` include it automatically.

## 3. Plug the keys into `config.js`

1. In Supabase, go to **Settings → API**.
2. Copy the **Project URL** and the **anon / public** key.
3. Open `config.js` in this repo and paste them in:

   ```js
   window.RECIPY_CONFIG = {
     SUPABASE_URL: "https://YOURPROJECT.supabase.co",
     SUPABASE_ANON_KEY: "ey…"
   };
   ```

The anon key is safe to commit — Row Level Security is what protects
your data, not the key. Commit `config.js` so GitHub Pages picks it up.

## 4. Migrate seed recipes

The migration script copies everything in `recipes-data.js` into the
`recipes` table under a system user called **@mackinley-kitchen**.

When adding or editing recipes, follow **[docs/RECIPE_AUTHORING.md](docs/RECIPE_AUTHORING.md)** so cook mode lists ingredients and amounts on every step. Run `npm run audit:cookmode` before migrating.

```bash
npm install
SUPABASE_URL="https://YOURPROJECT.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="ey… (the service_role / secret key)" \
npm run migrate
```

The **service role key** is in Supabase → Settings → API (right under the
anon key). Treat it like a password — never paste it into the frontend
or commit it to git. The script only uses it locally on your machine.

The script is idempotent — running it twice won't duplicate rows.

## 5. Sign up + promote yourself to admin

1. Open the site in your browser. Click the avatar → **Sign in or sign up**.
2. Pick a username and password. (If email confirmation is on in Supabase,
   check your inbox.)
3. Back in Supabase **SQL Editor**, run:

   ```sql
   update public.profiles
   set role = 'admin'
   where username = 'YOUR_USERNAME_HERE';
   ```

4. Reload the site — the **Admin queue** link should now appear in your
   account dropdown and the `/admin.html` page should work.

## 6. Enable Google sign-in

The "Continue with Google" button is already wired into the auth modal
(in both `index.html` and `app-shell.js`). To make it work end-to-end
you need to give Supabase a Google OAuth client ID + secret. Takes
about 10 minutes.

### 6a. Apply the database patch

If you ran `scripts/schema.sql` for the first time **after** this guide
was written, you can skip this — the trigger is already up to date.

Otherwise, in Supabase **SQL Editor → New query**, paste the contents
of `scripts/google-oauth-patch.sql` and click **Run**. This updates the
`handle_new_user` trigger so Google sign-ins automatically populate the
new user's display name and avatar from their Google profile.

### 6b. Create a Google OAuth client

1. Open <https://console.cloud.google.com/> and create a new project
   called **Recipy** (or pick an existing one).
2. Left sidebar → **APIs & Services → OAuth consent screen**:
   - User type: **External**, click Create.
   - App name: `Recipy`. User support email + developer contact: your
     own email. Leave everything else default and Save & Continue
     through Scopes (no extras needed), Test users (add your own
     email if you want to test before publishing), and Summary.
3. Left sidebar → **APIs & Services → Credentials → + Create
   credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: `Recipy web client`
   - **Authorised JavaScript origins** — add every origin you'll
     serve the site from:
     - `http://localhost:8000` (or whatever port you use locally)
     - your GitHub Pages URL once published, e.g.
       `https://yourusername.github.io`
   - **Authorised redirect URIs** — copy the callback URL straight
     from Supabase: it's
     `https://YOURPROJECT.supabase.co/auth/v1/callback`
     (the dashboard shows this same string under Authentication →
     Providers → Google once you tick Enable). For this project it
     is `https://gihzsaoqdkbfbnbbebij.supabase.co/auth/v1/callback`.
4. Click **Create**. Copy the **Client ID** and **Client secret** that
   pop up.

### 6c. Paste the credentials into Supabase

1. Supabase dashboard → **Authentication → Providers → Google**.
2. Flip the toggle to **Enabled**.
3. Paste the Client ID and Client secret. **Save**.

### 6d. Set your Site URL

Supabase needs to know where to send users back to after Google
finishes the OAuth dance.

1. Supabase dashboard → **Authentication → URL Configuration**.
2. **Site URL** — set this to whatever URL users are going to hit
   the site at most often. For local dev that's
   `http://localhost:8000`. For production set it to your GitHub
   Pages URL.
3. **Redirect URLs** — add every URL you might land on, one per line.
   Wildcards are allowed:
   ```
   http://localhost:8000/**
   https://yourusername.github.io/**
   ```
   The client sends `redirectTo: window.location.href`, so any URL
   matching one of these patterns is allowed.

### 6e. Try it

1. Reload the site. Click **Sign in**.
2. Hit **Continue with Google**, pick your Google account.
3. You should land back on whatever page you started on, signed in,
   with your Google avatar in the nav.

### Troubleshooting

- **"redirect_uri_mismatch"** — the redirect URI you put in Google
  Cloud must match the one Supabase calls. Double-check it's
  `https://YOURPROJECT.supabase.co/auth/v1/callback` (no trailing
  slash, exactly that path).
- **Returns to the site but stays signed out** — your current URL
  isn't in Supabase's allow-list. Add it under
  **Authentication → URL Configuration → Redirect URLs**.
- **"Unverified app" warning** — expected until you submit the app
  for Google verification. For personal use just click **Advanced →
  Go to Recipy (unsafe)** to continue.
- **No avatar after first sign-in** — make sure you ran
  `scripts/google-oauth-patch.sql`. Existing accounts won't be
  back-filled; only sign-ups that happen after the patch is applied.

## 7. Optional: turn off email confirmation while developing

Supabase **Authentication → Settings → Email**: toggle off "Confirm email"
so sign-ups don't need an email round-trip during dev. Turn it back on for
production.

## 8. Once everything works — clean up the seed file

Once you can see all 22 recipes loading from Supabase (open the network
tab — you'll see calls to `…supabase.co/rest/v1/recipes`), you can delete
`recipes-data.js` and remove its `<script>` tag from `index.html` and
`recipe.html`. The fallback path was only there to keep the site usable
while you were setting Supabase up.

## File layout

```
config.js                        ← project URL + anon key
supabase-client.js               ← window.RECIPY API surface
app-shell.js                     ← shared nav + auth modal (subpages)
theme.css                        ← shared CSS for subpages
index.html                       ← landing + recipe library
recipe.html                      ← detail + cook mode + "I made this!"
profile.html                     ← user profile + follow
feed.html                        ← realtime cooked_posts feed
upload.html                      ← recipe submission form
admin.html                       ← approve / reject queue
scripts/schema.sql               ← one-shot DB setup
scripts/google-oauth-patch.sql   ← apply if you set up before Google sign-in shipped
scripts/migrate-recipes.mjs      ← Node script to seed the DB
```
