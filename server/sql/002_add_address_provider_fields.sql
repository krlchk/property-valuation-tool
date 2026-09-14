-- Adds geocoding/address-provider fields to an already-existing `properties`
-- table in Supabase. Not applied automatically — run by hand (e.g. via the
-- Supabase SQL editor or CLI) against the remote project.

alter table public.properties
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists address_provider text,
  add column if not exists provider_place_id text;
