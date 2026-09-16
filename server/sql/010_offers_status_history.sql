create table if not exists public.offer_status_history (
  id bigint generated always as identity primary key,
  offer_id uuid not null references public.offers(id) on delete cascade,
  status public.offer_status not null,
  created_at timestamptz not null default now()
);

-- RLS is enabled on this table in Supabase; policies are managed separately.
alter table public.offer_status_history enable row level security;