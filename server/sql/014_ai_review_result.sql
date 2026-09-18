-- Track whether the persisted AI review completed successfully.
alter table public.ai_property_reviews
  add column if not exists result text not null default 'success';

alter table public.ai_property_reviews
  drop constraint if exists ai_property_reviews_result_check;

alter table public.ai_property_reviews
  add constraint ai_property_reviews_result_check
  check (result in ('success', 'failed'));
