/** Normalized user for UI (works with Supabase Google OAuth metadata). */
export type PlannerAuthUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};
