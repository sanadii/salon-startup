# Supabase setup (checklist)

Automated in-repo: SQL migrations (schema + RLS + Realtime publication), `.env` template, Supabase CLI `config.toml`.

**You must complete the dashboard and API keys yourself** (this repo cannot log into your accounts).

---

## 1. Env file (local)

- **Done in repo:** `.env` exists with empty `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **You:** Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Project Settings** → **API**.
  - Copy **Project URL** → `VITE_SUPABASE_URL`
  - Copy **Publishable** key → `VITE_SUPABASE_PUBLISHABLE_KEY` (or legacy **anon** JWT → `VITE_SUPABASE_ANON_KEY`; the app accepts either name)
  - Never put **Secret** / **service_role** in any `VITE_*` variable.

Restart `npm run dev` after saving `.env`.

---

## 2. Run database migrations (SQL)

**Option A — Dashboard (no CLI)**

1. **SQL Editor** → **New query**.
2. Paste the full contents of `supabase/migrations/20250322120000_user_app_state.sql` → **Run**.
3. Paste the full contents of `supabase/migrations/20250322120001_realtime_user_app_state.sql` → **Run**.

**Option B — Supabase CLI (linked project)**

```bash
npx supabase@latest login
npx supabase@latest link --project-ref YOUR_PROJECT_REF
npm run db:push
```

`YOUR_PROJECT_REF` is the subdomain in `https://YOUR_PROJECT_REF.supabase.co`.

---

## 3. Google sign-in

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID** → type **Web application**.
2. **Authorized JavaScript origins:** `http://localhost:3000` (and your production origin, e.g. `https://yourdomain.com`).
3. **Authorized redirect URIs:** add the URI Supabase shows for Google (Dashboard → **Authentication** → **Providers** → **Google** → expand for callback URL). It looks like:  
   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Supabase → **Authentication** → **Providers** → **Google** → enable → paste **Client ID** and **Client secret** from Google.

---

## 4. Redirect URLs (Supabase Auth)

Supabase → **Authentication** → **URL Configuration**:

- **Site URL:** `http://localhost:3000` for local dev (or your production URL when deployed).
- **Redirect URLs:** add  
  `http://localhost:3000`  
  `http://localhost:3000/**`  
  and your production URLs when you have them.

---

## 5. Realtime

**If you ran migration `20250322120001_realtime_user_app_state.sql`**, the `user_app_state` table is already in the `supabase_realtime` publication.

**If you only ran the first migration earlier**, either run the second migration in SQL Editor, or: **Database** → **Publications** / **Replication** (depending on UI) and enable replication for `public.user_app_state`.

---

## Verify

1. `npm run dev` → open app → **Sign in with Google**.
2. After login, data should persist; open two tabs and confirm updates propagate (Realtime).
