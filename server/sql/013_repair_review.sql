alter table public.ai_property_reviews
  drop column if exists offer_term_pct,
  drop column if exists final_estimated_price,
  drop column if exists estimated_price;

create table if not exists public.property_repair_reviews (
  id bigint generated always as identity primary key,
  property_id uuid not null references public.properties(id) on delete cascade,
  ai_property_review_id bigint not null,
  component_key public.property_component_category not null,
  grade public.component_grade_type not null,
  estimated_repair_price numeric(10, 2),
  review_response jsonb not null, -- Stores RepairEstimate object
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Ensures one repair review record per component per AI property review run
  constraint unique_property_review_component unique (ai_property_review_id, component_key)
);

create index idx_repair_reviews_property_component 
  on public.property_repair_reviews(property_id, component_key);

alter table public.property_repair_reviews enable row level security;