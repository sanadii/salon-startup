-- Salon planner: one JSON document per authenticated user (replaces Firestore appState).

create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists user_app_state_updated_at_idx on public.user_app_state (updated_at desc);

alter table public.user_app_state enable row level security;

create policy "Users can read own planner state"
  on public.user_app_state for select
  using (auth.uid() = user_id);

create policy "Users can insert own planner state"
  on public.user_app_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update own planner state"
  on public.user_app_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Realtime: applied in migration `20250322120001_realtime_user_app_state.sql`.
