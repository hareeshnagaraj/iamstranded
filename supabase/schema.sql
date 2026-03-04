-- iamstranded schema — crisis travel intelligence
-- Drop old tables first (if migrating from v1)
-- drop table if exists public.safe_route_cache cascade;
-- drop table if exists public.consular_contacts cascade;
-- drop table if exists public.extraction_options cascade;
-- drop table if exists public.ground_truth_updates cascade;
-- drop table if exists public.crisis_regions cascade;

create extension if not exists pgcrypto;

-- 1. Crisis events
create table if not exists public.crisis_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  location text not null,
  description text not null default '',
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 2. Ranked route options per crisis
create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  crisis_id uuid not null references public.crisis_events(id) on delete cascade,
  rank integer not null,
  title text not null,
  confidence text not null check (confidence in ('HIGH', 'MEDIUM', 'LOW')),
  time_estimate text not null,
  cost_range text not null,
  warning_text text,
  detail text,
  origin text not null default '',
  destination text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists routes_crisis_rank_idx
  on public.routes (crisis_id, rank asc);

-- 3. Ordered segments within a route
create table if not exists public.route_legs (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  leg_order integer not null,
  airport_code text not null,
  airport_status text not null check (airport_status in ('open', 'warning', 'closed')),
  flight_code text,
  departure_time text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists route_legs_route_order_idx
  on public.route_legs (route_id, leg_order asc);

-- 4. Airport status board
create table if not exists public.nearby_airports (
  id uuid primary key default gen_random_uuid(),
  crisis_id uuid not null references public.crisis_events(id) on delete cascade,
  airport_code text not null,
  airport_name text not null,
  status text not null check (status in ('open', 'warning', 'closed')),
  status_label text not null,
  distance_km integer not null,
  latitude double precision not null default 0,
  longitude double precision not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists nearby_airports_crisis_idx
  on public.nearby_airports (crisis_id);

-- 5. Nearby lodging / shelters
create table if not exists public.nearby_lodging (
  id uuid primary key default gen_random_uuid(),
  crisis_id uuid not null references public.crisis_events(id) on delete cascade,
  name text not null,
  status text not null check (status in ('available', 'limited', 'full', 'closed', 'shelter')),
  status_label text not null,
  available_rooms integer,
  price_range text,
  distance_km integer not null,
  latitude double precision not null default 0,
  longitude double precision not null default 0,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists nearby_lodging_crisis_idx
  on public.nearby_lodging (crisis_id);

-- 6. Categorized live updates (realtime)
create table if not exists public.intel_feed (
  id uuid primary key default gen_random_uuid(),
  crisis_id uuid not null references public.crisis_events(id) on delete cascade,
  category text not null check (category in ('flight', 'ground', 'accommodation', 'embassy', 'safety')),
  message text not null,
  source text not null default '',
  source_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists intel_feed_crisis_ts_idx
  on public.intel_feed (crisis_id, created_at desc);

-- 7. Emergency contacts
create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  crisis_id uuid not null references public.crisis_events(id) on delete cascade,
  name text not null,
  phone text,
  url text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists emergency_contacts_crisis_idx
  on public.emergency_contacts (crisis_id);

-- Enable RLS on all tables
alter table public.crisis_events enable row level security;
alter table public.routes enable row level security;
alter table public.route_legs enable row level security;
alter table public.nearby_airports enable row level security;
alter table public.nearby_lodging enable row level security;
alter table public.intel_feed enable row level security;
alter table public.emergency_contacts enable row level security;

-- Public read-only policies
drop policy if exists "public read crisis_events" on public.crisis_events;
create policy "public read crisis_events"
  on public.crisis_events for select to anon using (true);

drop policy if exists "public read routes" on public.routes;
create policy "public read routes"
  on public.routes for select to anon using (true);

drop policy if exists "public read route_legs" on public.route_legs;
create policy "public read route_legs"
  on public.route_legs for select to anon using (true);

drop policy if exists "public read nearby_airports" on public.nearby_airports;
create policy "public read nearby_airports"
  on public.nearby_airports for select to anon using (true);

drop policy if exists "public read nearby_lodging" on public.nearby_lodging;
create policy "public read nearby_lodging"
  on public.nearby_lodging for select to anon using (true);

drop policy if exists "public read intel_feed" on public.intel_feed;
create policy "public read intel_feed"
  on public.intel_feed for select to anon using (true);

drop policy if exists "public read emergency_contacts" on public.emergency_contacts;
create policy "public read emergency_contacts"
  on public.emergency_contacts for select to anon using (true);

-- Write policies for route cache (service role / authenticated can write)
drop policy if exists "service write routes" on public.routes;
create policy "service write routes"
  on public.routes for all to service_role using (true) with check (true);

drop policy if exists "service write route_legs" on public.route_legs;
create policy "service write route_legs"
  on public.route_legs for all to service_role using (true) with check (true);

-- Write policy for intel feed (service role can insert — used by Edge Function)
drop policy if exists "service write intel_feed" on public.intel_feed;
create policy "service write intel_feed"
  on public.intel_feed for all to service_role using (true) with check (true);

-- Realtime publication for intel feed
alter publication supabase_realtime add table public.intel_feed;
