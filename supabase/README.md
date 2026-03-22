# Supabase

- **Migrations:** `migrations/*.sql` — table `user_app_state`, RLS, Realtime publication.
- **Local CLI:** `supabase/config.toml` (from `npx supabase init`). Local stack needs [Docker Desktop](https://docs.docker.com/desktop/).

## Quick path

1. Fill `.env` with **Project URL** and **anon** key (see root `.env.example`).
2. Apply migrations: SQL Editor (paste both files) **or** `npm run db:link` then `npm run db:push`.
3. Complete Google + redirect steps in **[`docs/SUPABASE_SETUP.md`](../docs/SUPABASE_SETUP.md)**.
