-- offer_terms table

create table if not exists public.offer_terms (
  id bigint generated always as identity primary key,
  price_multiplier numeric(4, 2) not null check (price_multiplier >= 0),
  closing_days_min integer not null check (closing_days_min >= 0),
  closing_days_max integer check (closing_days_max >= closing_days_min),
  inspection_days integer not null check (inspection_days >= 0),
  inspection_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.offer_terms enable row level security;

-- Remove starting_value_source and update timeline to offer_terms_id FK

alter table public.properties
  drop column if exists starting_value_source,
  drop column if exists timeline,
  add column offer_terms_id bigint references public.offer_terms(id) on delete set null;

-- Index foreign keys for faster query joins

create index if not exists idx_properties_offer_terms_id on public.properties(offer_terms_id);