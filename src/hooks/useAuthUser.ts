import { useEffect, useState } from 'react';
import type { PlannerAuthUser } from '../types/auth';
import { getSupabaseClient } from '../supabase/client';
import { plannerUserFromSupabase } from '../supabase/auth';

export function useAuthUser() {
  const [user, setUser] = useState<PlannerAuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const sb = getSupabaseClient();
    if (!sb) {
      setAuthReady(true);
      return;
    }

    sb.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ? plannerUserFromSupabase(session.user) : null);
        setAuthReady(true);
      })
      .catch(() => setAuthReady(true));

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? plannerUserFromSupabase(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, authReady };
}
