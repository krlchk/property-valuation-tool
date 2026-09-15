-- Property photos and their Supabase Storage bucket.

do $$
begin
  create type public.property_photo_category as enum (
    'Roof',
    'Exterior paint',
    'Windows',
    'Kitchen',
    'Bathrooms',
    'Floors',
    'Doors',
    'Landscaping',
    'Garage',
    'Laundry room',
    'Deck'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.property_photos (
  id bigint generated always as identity primary key,
  property_id uuid not null references public.properties(id) on delete cascade,
  url text,
  storage_path text not null unique,
  category public.property_photo_category not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_property_photos_property_id
  on public.property_photos(property_id);

alter table public.property_photos enable row level security;