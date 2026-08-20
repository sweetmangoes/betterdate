-- Run this in the Supabase SQL editor (once per project).
-- Auth stays optional: guests can still take the quiz without an account.

create table if not exists public.preference_profiles (
  user_id uuid not null references auth.users (id) on delete cascade,
  product text not null check (product in ('date', 'friends')),
  my_location text not null default '',
  budget text not null default '$$',
  energy text not null default 'mixed',
  vibes text[] not null default '{}',
  constraints text not null default '',
  default_hang_length text,
  updated_at timestamptz not null default now(),
  primary key (user_id, product)
);

create index if not exists preference_profiles_user_id_idx on public.preference_profiles (user_id);

alter table public.preference_profiles enable row level security;

drop policy if exists "Users can read own preference profiles" on public.preference_profiles;
create policy "Users can read own preference profiles"
  on public.preference_profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own preference profiles" on public.preference_profiles;
create policy "Users can insert own preference profiles"
  on public.preference_profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own preference profiles" on public.preference_profiles;
create policy "Users can update own preference profiles"
  on public.preference_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own preference profiles" on public.preference_profiles;
create policy "Users can delete own preference profiles"
  on public.preference_profiles
  for delete
  using (auth.uid() = user_id);
