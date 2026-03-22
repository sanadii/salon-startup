import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Returns the browser Supabase client, or null if env vars are missing (e.g. local E2E without secrets).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key =
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
  if (!url?.trim() || !key?.trim()) return null;
  client = createClient(url.trim(), key.trim());
  return client;
}
