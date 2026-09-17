alter table public.property_photos alter column category drop default;

alter table public.property_photos 
  alter column category type text using category::text;

alter table public.property_component_grades 
  alter column component_key type text using component_key::text;

drop type if exists public.property_component_category cascade;

create type public.property_component_category as enum (
  'roof',
  'exterior_paint',
  'windows',
  'kitchen',
  'bathrooms',
  'floors',
  'doors',
  'landscaping',
  'garage',
  'laundry_room',
  'deck'
);

alter table public.property_photos 
  alter column category set default 'other'::public.property_component_category;


alter table public.property_photos 
  alter column category type public.property_component_category 
  using (
    case lower(trim(category))
      when 'exterior' then 'exterior_paint'
      when 'flooring' then 'floors'
      when 'bathroom' then 'bathrooms'
      when 'laundry' then 'laundry_room'
      else lower(trim(category))
    end
  )::public.property_component_category;

alter table public.property_component_grades 
  alter column component_key type public.property_component_category 
  using (
    case lower(trim(component_key))
      when 'exterior' then 'exterior_paint'
      when 'flooring' then 'floors'
      when 'bathroom' then 'bathrooms'
      when 'laundry' then 'laundry_room'
      else lower(trim(component_key))
    end
  )::public.property_component_category;

-- Create property_component_grades enum type with UPPERCASE values
create type public.component_grade_type as enum ('GOOD', 'FAIR', 'BAD');

-- Create the property_component_grades table
create table if not exists public.property_component_grades (
  id bigint generated always as identity primary key,
  component_key public.property_component_category not null,
  grade public.component_grade_type not null,
  
  -- Percentages stored as numerical values (e.g., -3.50 for -3.5%) bounded between -10.00 and 0.00
  grade_percentage numeric(4, 2) not null 
    constraint check_percentage_range check (grade_percentage between -10.00 and 0.00),
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Unique combination of component_key + grade
  constraint unique_component_grade unique (component_key, grade)
);

-- Trigger to enforce logical adjustment order (GOOD >= FAIR >= BAD)
create or replace function public.check_grade_percentage_logic()
returns trigger as $$
declare
  good_pct numeric(4, 2);
  fair_pct numeric(4, 2);
  bad_pct numeric(4, 2);
begin
  -- Fetch current or newly updated percentages for this component
  select 
    max(case when grade = 'GOOD' then (case when new.grade = 'GOOD' then new.grade_percentage else grade_percentage end) end),
    max(case when grade = 'FAIR' then (case when new.grade = 'FAIR' then new.grade_percentage else grade_percentage end) end),
    max(case when grade = 'BAD'  then (case when new.grade = 'BAD'  then new.grade_percentage else grade_percentage end) end)
  into good_pct, fair_pct, bad_pct
  from public.property_component_grades
  where component_key = new.component_key;

  -- Fallbacks for new row insertions
  if new.grade = 'GOOD' then good_pct := new.grade_percentage; end if;
  if new.grade = 'FAIR' then fair_pct := new.grade_percentage; end if;
  if new.grade = 'BAD'  then bad_pct  := new.grade_percentage; end if;

  -- Rule: GOOD (0%) >= FAIR (e.g. -1.5%) >= BAD (e.g. -3.5%)
  if fair_pct is not null and good_pct is not null and fair_pct > good_pct then
    raise exception 'FAIR grade penalty (%) cannot be higher than GOOD grade penalty (%) for component %', fair_pct, good_pct, new.component_key;
  end if;

  if bad_pct is not null and fair_pct is not null and bad_pct > fair_pct then
    raise exception 'BAD grade penalty (%) cannot be higher than FAIR grade penalty (%) for component %', bad_pct, fair_pct, new.component_key;
  end if;

  return new;
end;
$$ language plpgsql;

create or replace trigger enforce_grade_percentage_order
  before insert or update on public.property_component_grades
  for each row
  execute function public.check_grade_percentage_logic();

-- Enable RLS
alter table public.property_component_grades enable row level security;