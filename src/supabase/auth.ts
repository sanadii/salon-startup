import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { PlannerAuthUser } from '../types/auth';
import { getSupabaseClient } from './client';

export function plannerUserFromSupabase(user: SupabaseUser): PlannerAuthUser {
  const meta = user.user_metadata as Record<string, string | undefined> | undefined;
  return {
    id: user.id,
    email: user.email ?? null,
    displayName:
      meta?.full_name ?? meta?.name ?? meta?.display_name ?? user.email?.split('@')[0] ?? null,
    photoURL: meta?.avatar_url ?? meta?.picture ?? null,
  };
}

export async function signInWithGoogle(): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) {
    window.alert(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.'
    );
    return;
  }
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
  if (error) {
    console.error(error);
    window.alert(error.message);
  }
}

export async function signOut(): Promise<void> {
  const sb = getSupabaseClient();
  if (sb) await sb.auth.signOut();
}
