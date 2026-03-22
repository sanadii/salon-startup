import { useCallback, useEffect, useRef, useState } from 'react';
import { INITIAL_DATA } from '../constants';
import { coerceFirestoreAppState, migrateAppState } from '../migrations/migrateAppState';
import type { PlannerAuthUser } from '../types/auth';
import type { AppState } from '../types';
import { getSupabaseClient } from '../supabase/client';
import { OperationType, reportSyncError } from '../supabase/errors';

export type SyncStatus = 'idle' | 'loading' | 'syncing' | 'synced' | 'error';

const TABLE = 'user_app_state';

export function useSupabaseAppState(user: PlannerAuthUser | null) {
  const [state, setState] = useState<AppState>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(!!user);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(user ? 'loading' : 'idle');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const applyingRemoteRef = useRef(false);

  const dismissSyncError = useCallback(() => {
    setSyncMessage(null);
    setSyncStatus((s) => (s === 'error' ? 'synced' : s));
  }, []);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setSyncStatus('idle');
      return;
    }

    const sb = getSupabaseClient();
    if (!sb) {
      setIsLoading(false);
      setSyncStatus('error');
      setSyncMessage('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
      return;
    }

    const userId = user.id;
    let cancelled = false;

    const applyRemoteRow = (rawState: unknown) => {
      if (cancelled) return;
      applyingRemoteRef.current = true;
      const asRecord =
        rawState && typeof rawState === 'object'
          ? (rawState as Record<string, unknown>)
          : {};
      const coerced = coerceFirestoreAppState(asRecord);
      const { state: migrated, migrated: didMigrate } = migrateAppState(coerced);
      setState(migrated);
      setSyncStatus('synced');
      setIsLoading(false);
      queueMicrotask(() => {
        applyingRemoteRef.current = false;
      });

      if (didMigrate) {
        void sb
          .from(TABLE)
          .upsert({ user_id: userId, state: migrated, updated_at: new Date().toISOString() })
          .then(({ error }) => {
            if (error) {
              const r = reportSyncError(error, OperationType.WRITE, TABLE);
              setSyncMessage(r.userMessage);
              setSyncStatus('error');
            }
          });
      }
    };

    const bootstrap = async () => {
      setIsLoading(true);
      setSyncStatus('loading');

      const { data, error } = await sb
        .from(TABLE)
        .select('state')
        .eq('user_id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        const r = reportSyncError(error, OperationType.GET, TABLE);
        setSyncMessage(r.userMessage);
        setSyncStatus('error');
        setIsLoading(false);
        return;
      }

      if (!data) {
        const { error: upsertErr } = await sb.from(TABLE).upsert(
          {
            user_id: userId,
            state: INITIAL_DATA,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
        if (cancelled) return;
        if (upsertErr) {
          const r = reportSyncError(upsertErr, OperationType.WRITE, TABLE);
          setSyncMessage(r.userMessage);
          setSyncStatus('error');
          setIsLoading(false);
          return;
        }
        applyRemoteRow(INITIAL_DATA);
        return;
      }

      applyRemoteRow(data.state);
    };

    void bootstrap();

    const channel = sb
      .channel(`planner:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLE,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const next = payload.new as { state?: unknown } | undefined;
          if (next && 'state' in next && next.state !== undefined) {
            applyRemoteRow(next.state);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setSyncMessage('Realtime connection issue. Edits may not sync until you refresh.');
          setSyncStatus('error');
        }
      });

    return () => {
      cancelled = true;
      void sb.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (!user || isLoading) return;
    const sb = getSupabaseClient();
    if (!sb) return;

    const userId = user.id;
    const timeoutId = window.setTimeout(() => {
      if (applyingRemoteRef.current) return;
      setSyncStatus('syncing');
      void sb
        .from(TABLE)
        .upsert(
          {
            user_id: userId,
            state,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .then(({ error }) => {
          if (error) {
            const r = reportSyncError(error, OperationType.WRITE, TABLE);
            setSyncMessage(r.userMessage);
            setSyncStatus('error');
          } else {
            setSyncStatus('synced');
            setSyncMessage(null);
          }
        });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [state, user, isLoading]);

  return {
    state,
    setState,
    isLoading,
    syncStatus,
    syncMessage,
    dismissSyncError,
  };
}
