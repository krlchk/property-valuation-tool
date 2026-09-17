-- Create an ENUM type for offer statuses (skip if already created)
do $$ begin
  create type public.offer_status as enum ('accepted', 'proccessed', 'done');
exception
  when duplicate_object then null;
end $$;

-- Create the offers table
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  
  min_price numeric(12, 2) not null,
  max_price numeric(12, 2) not null,
  
  status public.offer_status not null default 'proccessed',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint check_price_range check (max_price >= min_price)
);

-- Enable RLS
alter table public.offers enable row level security;