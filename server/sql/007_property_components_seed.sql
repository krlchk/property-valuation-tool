-- Seed initial adjustment values
insert into public.property_component_grades (component_key, grade, grade_percentage) values
  ('roof', 'GOOD', 0.00), ('roof', 'FAIR', -1.50), ('roof', 'BAD', -3.50),
  ('kitchen', 'GOOD', 0.00), ('kitchen', 'FAIR', -1.50), ('kitchen', 'BAD', -3.00),
  ('bathroom', 'GOOD', 0.00), ('bathroom', 'FAIR', -1.25), ('bathroom', 'BAD', -2.50),
  ('flooring', 'GOOD', 0.00), ('flooring', 'FAIR', -0.75), ('flooring', 'BAD', -1.50),
  ('exterior_paint', 'GOOD', 0.00), ('exterior_paint', 'FAIR', -0.75), ('exterior_paint', 'BAD', -1.50),
  ('windows', 'GOOD', 0.00), ('windows', 'FAIR', -0.75), ('windows', 'BAD', -1.50),
  ('doors', 'GOOD', 0.00), ('doors', 'FAIR', -0.25), ('doors', 'BAD', -0.50),
  ('landscaping', 'GOOD', 0.00), ('landscaping', 'FAIR', -0.25), ('landscaping', 'BAD', -0.75),
  ('garage', 'GOOD', 0.00), ('garage', 'FAIR', -0.50), ('garage', 'BAD', -1.00),
  ('laundry_room', 'GOOD', 0.00), ('laundry_room', 'FAIR', -0.25), ('laundry_room', 'BAD', -0.50),
  ('deck', 'GOOD', 0.00), ('deck', 'FAIR', -0.50), ('deck', 'BAD', -1.00)
on conflict (component_key, grade) 
do update set grade_percentage = excluded.grade_percentage;