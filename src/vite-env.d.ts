/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase dashboard: Publishable key (`sb_publishable_…`). */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Legacy; same value as publishable or old anon JWT. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
