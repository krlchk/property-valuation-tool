-- Reflects the current state of the `properties` table in Supabase.
-- This file is documentation of the live schema, not a migration runner —
-- Supabase migrations are not tracked for this project; schema changes are
-- applied by hand (see numbered SQL files in this directory).

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),

  address_line1 text not null,
  city text not null,
  state text not null,
  postal_code text not null,

  latitude double precision,
  longitude double precision,
  address_provider text,
  provider_place_id text,

  square_feet integer,
  bedrooms integer,
  bathrooms numeric,

  starting_value integer,
  starting_value_source text,

  timeline text,
  status text not null default 'draft',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS is enabled on this table in Supabase; policies are managed separately.
alter table public.properties enable row level security;
