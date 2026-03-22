# Deploy on Vercel



This app is a **Vite + React SPA** with client-side routes (`/dashboard`, `/tasks`, etc.). Vercel must serve `index.html` for those paths.



**Dashboard vs live site:** The project page (e.g. [salon_startup on Vercel](https://vercel.com/sanad-general/salon_startup)) is where you configure builds and env vars. **Supabase and Google OAuth** need your **public app URL** — open that project → **Domains** (or the deployment **Visit** link) and copy the `https://….vercel.app` address. Do not use `vercel.com/...` as Site URL.



**Keeping this doc current:** Edit the checklist below as you finish steps or when your production URL / project changes. In the editor, turn `- [ ]` into `- [x]` when done.



---



## Deployment checklist



**Current production app URL:** `https://salon-startup.vercel.app` (change here if you use another domain)



- [X] **1. Vercel env vars**  

  Project → **Settings** → **Environment Variables** — set for **Production** (+ **Preview** if you use preview deployments):



  | Variable | Value |

  |----------|--------|

  | `VITE_SUPABASE_URL` | Supabase **Project URL** (Dashboard → Project Settings → API) |

  | `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase **Publishable** key (`sb_publishable_…`); not the Secret key |



  Then **Redeploy** the latest deployment (or push a commit) so the build picks up the new variables.



- [X] **2. Supabase Auth URLs**  

  [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **URL Configuration**:



  - **Site URL:** `https://salon-startup.vercel.app`

  - **Redirect URLs:** this is a **list** in the dashboard — add **both** production and local entries (Supabase only redirects to URLs listed here):

    - `https://salon-startup.vercel.app`

    - `https://salon-startup.vercel.app/**`

    - `http://localhost:3000` and `http://localhost:3000/**` — for `npm run dev` (use your real port if different). Do **not** remove these when you add production URLs.



- [ ] **3. Google OAuth** (only if you use Google sign-in)  

  [Google Cloud Console](https://console.cloud.google.com/) → your OAuth client:



  - **Authorized JavaScript origins:** add `https://salon-startup.vercel.app`

  - **Authorized redirect URIs:** keep Supabase’s callback (do **not** replace with the Vercel URL), e.g.  

    `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`



- [ ] **4. Sanity checks** (only **after** Vercel shows a **successful** production deployment — skip until the site is live)

  **What this is for:** Double-check that production is wired correctly. If you have not deployed yet, finish steps 1–3 (and 5 if needed), trigger a deploy, **then** come back here.

  1. **Open the live URL** — `https://salon-startup.vercel.app` — and confirm the app loads normally. If you see a message like “Supabase is not configured,” step 1 env vars are missing or the deployment didn’t pick them up (redeploy after saving variables).

  2. **Sign in once on production** — proves Supabase **Site URL** / **Redirect URLs** and (if you use it) **Google OAuth** match this hostname. If login fails, compare errors to steps 2–3.

  3. **Preview deployments (optional later)** — when Vercel gives you a **different** URL per branch/PR, Google/Supabase may block login until you add that preview URL under Supabase **Redirect URLs**. Production (`salon-startup.vercel.app`) can work fine even if you never add previews.



- [ ] **5. Git → Vercel**  

  **Connect Git** on the Vercel project so pushes trigger deploys automatically (if not already).



**If something fails:** note which step (build failure, blank page, or redirect/error after Google) and adjust env vars, Supabase URLs, or Google OAuth to match the checklist above.



---



## Project settings (reference)



| Setting | Value |

|--------|--------|

| Framework preset | **Vite** (auto-detected) |

| Build command | `npm run build` |

| Output directory | `dist` |

| Install command | `npm install` |



### Optional env vars



| Name | Environments |

|------|----------------|

| `VITE_SENTRY_DSN` | Production (optional) |



**Legacy:** If you already set `VITE_SUPABASE_ANON_KEY` in Vercel, the app still reads it; prefer renaming to `VITE_SUPABASE_PUBLISHABLE_KEY` when you can.



## Preview deployments



Each Vercel **preview** gets its own URL. Either:



- Add wildcard or each preview URL under Supabase **Redirect URLs**, or  

- For previews only, use **Email** auth / a test project, or accept that Google OAuth may need the preview URL added when testing.



## PWA / service worker



The build registers a service worker. After deploy, confirm the app loads and hard-refresh once if the SW caches an old bundle.


