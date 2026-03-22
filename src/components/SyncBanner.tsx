import { AlertCircle, WifiOff, X } from 'lucide-react';
import { cn } from '../lib/cn';
import type { SyncStatus } from '../hooks/useSupabaseAppState';

export function SyncBanner({
  syncStatus,
  message,
  onDismiss,
}: {
  syncStatus: SyncStatus;
  message: string | null;
  onDismiss: () => void;
}) {
  if (!message && syncStatus !== 'syncing' && syncStatus !== 'error') return null;

  const isError = syncStatus === 'error' && message;
  const isSyncing = syncStatus === 'syncing';

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-2 text-sm border-b',
        isError && 'bg-rose-50 text-rose-900 border-rose-100',
        isSyncing && !isError && 'bg-brand/5 text-ink/80 border-brand/10',
        !isError && !isSyncing && message && 'bg-amber-50 text-amber-900 border-amber-100'
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0">
        {isError ? (
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
        ) : isSyncing ? (
          <span className="w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          <WifiOff className="w-4 h-4 shrink-0" aria-hidden />
        )}
        <span className="truncate">
          {message ??
            (isSyncing ? 'Saving your changes to the cloud…' : '')}
        </span>
      </div>
      {isError && message && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-rose-100 shrink-0"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
