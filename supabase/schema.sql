-- Crisis/Stranded Traveler Tool schema (MVP)

create extension if not exists pgcrypto;

create table if not exists public.crisis_regions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  country_code text not null,
  is_active boolean not null default true,
  priority integer not null default 99,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ground_truth_updates (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.crisis_regions(id) on delete cascade,
  timestamp_utc timestamptz not null default timezone('utc', now()),
  message text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  source_label text not null default 'Operator Feed'
);

create index if not exists ground_truth_updates_region_ts_idx
  on public.ground_truth_updates (region_id, timestamp_utc desc);

create table if not exists public.extraction_options (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.crisis_regions(id) on delete cascade,
  mode text not null check (mode in ('bus', 'train', 'border', 'air')),
  distance_km numeric(8,2) not null,
  status text not null check (status in ('operational', 'limited', 'closed')),
  note text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.consular_contacts (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.crisis_regions(id) on delete cascade,
  country text not null,
  primary_phone text not null,
  secondary_phone text,
  hours_utc text not null default '24/7 emergency desk'
);

create table if not exists public.safe_route_cache (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.crisis_regions(id) on delete cascade,
  snapshot_json jsonb not null,
  generated_at timestamptz not null default timezone('utc', now())
);

alter table public.crisis_regions enable row level security;
alter table public.ground_truth_updates enable row level security;
alter table public.extraction_options enable row level security;
alter table public.consular_contacts enable row level security;
alter table public.safe_route_cache enable row level security;

-- Public read-only policies for crisis data.
drop policy if exists "public read crisis_regions" on public.crisis_regions;
create policy "public read crisis_regions"
  on public.crisis_regions for select
  to anon
  using (true);

drop policy if exists "public read ground_truth_updates" on public.ground_truth_updates;
create policy "public read ground_truth_updates"
  on public.ground_truth_updates for select
  to anon
  using (true);

drop policy if exists "public read extraction_options" on public.extraction_options;
create policy "public read extraction_options"
  on public.extraction_options for select
  to anon
  using (true);

drop policy if exists "public read consular_contacts" on public.consular_contacts;
create policy "public read consular_contacts"
  on public.consular_contacts for select
  to anon
  using (true);

drop policy if exists "public read safe_route_cache" on public.safe_route_cache;
create policy "public read safe_route_cache"
  on public.safe_route_cache for select
  to anon
  using (true);

-- Realtime publication (ground truth feed).
alter publication supabase_realtime add table public.ground_truth_updates;
