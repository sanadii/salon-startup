-- Add user_app_state to the Realtime publication (live sync across tabs / devices).
-- Idempotent: skip if already a replica table for supabase_realtime.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_app_state'
  ) then
    alter publication supabase_realtime add table public.user_app_state;
  end if;
end $$;
