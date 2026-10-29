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

-- Saved plans, shared by link at /p/[id]. Only the server (service role key) reads or writes these.
create table if not exists public.plans (
  id text primary key,
  product text not null check (product in ('date', 'friends')),
  plan jsonb not null,
  answers jsonb,
  user_id uuid references auth.users (id) on delete set null,
  date_number bigint,
  created_at timestamptz not null default now()
);

alter table public.plans add column if not exists date_number bigint;

alter table public.plans enable row level security;

-- Running count of generated plans. Bumped atomically when /api/plan succeeds.
create table if not exists public.plan_counters (
  product text primary key check (product in ('date', 'friends')),
  dates_planned bigint not null default 0
);

alter table public.plan_counters enable row level security;
create table if not exists public.sms_contacts
drop policy if exists "Anyone can read plan counters" on public.plan_counters;
create policy "Anyone can read plan counters"
  on public.plan_counters
  for select
  using (true);

insert into public.plan_counters (product, dates_planned)
values
  ('date', (select count(*) from public.plans where product = 'date')),
  ('friends', (select count(*) from public.plans where product = 'friends'))
on conflict (product) do nothing;

create or replace function public.bump_dates_planned(p_product text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_n bigint;
begin
  insert into public.plan_counters (product, dates_planned)
  values (p_product, 1)
  on conflict (product) do update
    set dates_planned = public.plan_counters.dates_planned + 1
  returning dates_planned into next_n;
  return next_n;
end;
$$;

revoke all on function public.bump_dates_planned(text) from public;
grant execute on function public.bump_dates_planned(text) to service_role;

-- People who signed up to get texts. Consent wording and time are stored for carrier compliance.
create table if not exists public.sms_contacts (
  phone text not null,
  product text not null check (product in ('date', 'friends')),
  channel text not null default 'sms' check (channel in ('sms', 'whatsapp')),
  consent_text text not null,
  consented_at timestamptz not null default now(),
  opted_out_at timestamptz,
  welcome_sent_at timestamptz,
  first_message text,
  area text,
  last_plan_id text,
  last_inbound_at timestamptz,
  primary key (phone, product)
);

alter table public.sms_contacts add column if not exists first_message text;
alter table public.sms_contacts add column if not exists area text;
alter table public.sms_contacts add column if not exists last_plan_id text;
alter table public.sms_contacts add column if not exists last_inbound_at timestamptz;

alter table public.sms_contacts enable row level security;
