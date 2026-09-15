alter table public.offer_terms add column if not exists key text unique;

insert into public.offer_terms (key, price_multiplier, closing_days_min, closing_days_max, inspection_days, inspection_description)
values
  ('asap', 0.80, 7, null, 0, 'Waived entirely'),
  ('3-months', 0.92, 30, null, 5, '5-day window'),
  ('12-months', 1.00, 30, 45, 10, '10-day due diligence')
on conflict (key) do update set
  price_multiplier = excluded.price_multiplier,
  closing_days_min = excluded.closing_days_min,
  closing_days_max = excluded.closing_days_max,
  inspection_days = excluded.inspection_days,
  inspection_description = excluded.inspection_description;