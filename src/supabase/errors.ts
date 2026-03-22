export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export type SyncErrorCategory = 'permission' | 'offline' | 'unavailable' | 'unknown';

export interface SyncErrorResult {
  userMessage: string;
  category: SyncErrorCategory;
  technicalMessage: string;
  operationType: OperationType;
  path: string | null;
}

function categorizeMessage(message: string): SyncErrorCategory {
  const m = message.toLowerCase();
  if (m.includes('permission') || m.includes('policy') || m.includes('row-level security'))
    return 'permission';
  if (m.includes('network') || m.includes('fetch')) return 'offline';
  if (m.includes('timeout') || m.includes('unavailable')) return 'unavailable';
  return 'unknown';
}

function userFacingMessage(category: SyncErrorCategory): string {
  switch (category) {
    case 'permission':
      return 'Could not access your data. Try signing out and signing in again.';
    case 'offline':
    case 'unavailable':
      return 'You appear to be offline or the service is unavailable. Changes will sync when the connection is restored.';
    default:
      return 'Something went wrong while syncing. If this continues, try again later.';
  }
}

export function reportSyncError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): SyncErrorResult {
  const technicalMessage = error instanceof Error ? error.message : String(error);
  const category = categorizeMessage(technicalMessage);
  const userMessage = userFacingMessage(category);
  console.error('Supabase sync error:', JSON.stringify({ technicalMessage, operationType, path }));
  return {
    userMessage,
    category,
    technicalMessage,
    operationType,
    path,
  };
}
