-- Reflects the schema definition for the users and updates properties table.

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile_number text,
  email text not null unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS is enabled on this table in Supabase; policies are managed separately.
alter table public.users enable row level security;

- Alter properties table to add nullable user_id foreign key referencing public.users
alter table public.properties 
  add column if not exists user_id uuid references public.users(id) on delete set null;