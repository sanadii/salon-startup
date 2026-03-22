# Salon Opening Planner

React + Vite + Tailwind app for salon startup tasks, budget tracking, and opening countdown. Data syncs per user via **Supabase** (Postgres + Auth + Realtime).

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

## Setup

1. `npm install`
2. Edit **`.env`** (created from the template) with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from Supabase **Settings → API** (Publishable key).
3. Run SQL migrations and configure Google + Auth URLs — follow **[`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)**.
4. `npm run dev` → [http://localhost:3000](http://localhost:3000)

**CLI (optional):** `npm run db:link` then `npm run db:push` after `npx supabase login`.

## Deploy (Vercel)

Import the repo in [Vercel](https://vercel.com), set `VITE_SUPABASE_*` env vars, and add your production URL to Supabase Auth redirects. See **[`docs/VERCEL.md`](docs/VERCEL.md)**.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Dev server (port 3000)   |
| `npm run build`| Production build         |
| `npm run lint` | Typecheck + ESLint       |
| `npm test`     | Unit tests (Vitest)      |
| `npm run test:e2e` | Playwright smoke   |
