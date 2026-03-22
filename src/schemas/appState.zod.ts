import { z } from 'zod';

const hammamStatusSchema = z.enum(['Ready', 'Plumbing', 'Tiling', 'Foundation']);

/**
 * Loose read-side validation: fields optional (legacy docs), but wrong types fail
 * so we fall back to defaults in coerceFirestoreAppState.
 */
export const firestoreAppStateRootSchema = z
  .object({
    schemaVersion: z.number().optional(),
    modules: z.array(z.unknown()).optional(),
    budgetCategories: z.array(z.unknown()).optional(),
    openingDate: z.string().optional(),
    hammamStatus: hammamStatusSchema.optional(),
    brandSettings: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export function safeParseFirestoreAppStateRoot(raw: unknown): Record<string, unknown> | null {
  const r = firestoreAppStateRootSchema.safeParse(raw);
  return r.success ? (r.data as Record<string, unknown>) : null;
}
