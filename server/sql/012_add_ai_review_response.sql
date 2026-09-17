-- Stores the complete AI component review response for auditability.
alter table public.ai_property_reviews
  add column if not exists review_response jsonb not null default '{}'::jsonb;
