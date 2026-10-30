-- =============================================================================
-- WILDWOOD PULSE — ALL-IN-ONE SUPABASE SETUP SCRIPT
-- Paste this entire file into Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- 1. Venues Table
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  neighborhood text not null default 'North Wildwood',
  address text,
  cross_street text,
  lat double precision,
  lng double precision,
  website_url text,
  facebook_url text,
  instagram_handle text,
  phone text,
  scrape_config jsonb not null default '{}'::jsonb,
  is_year_round boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Ingestion Batches (Audit trail & Split-Screen Review Queue)
create table if not exists public.ingestion_batches (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues(id) on delete set null,
  source_type text not null check (source_type in ('flyer_upload', 'url_paste', 'playwright_scrape')),
  source_url text,
  storage_path text,
  image_sha256 text,
  status text not null default 'pending_review' check (status in ('processing', 'pending_review', 'approved', 'rejected')),
  raw_extracted_json jsonb not null default '[]'::jsonb,
  submitted_by text default 'Crew Member',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- 3. Recurring Rules (Weekly Templates for Happy Hours & Repeating Deals)
create table if not exists public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  category text not null check (category in ('happy_hour', 'daily_special', 'live_music', 'trivia_event')),
  title text not null,
  days_of_week smallint[] not null,
  start_time time not null,
  end_time time,
  end_time_label text,
  deals_summary jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  notes text,
  valid_from date not null default current_date,
  valid_until date,
  is_active boolean not null default true,
  source_batch_id uuid references public.ingestion_batches(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- 4. Materialized Calendar Occurrences
create table if not exists public.calendar_occurrences (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  recurring_rule_id uuid references public.recurring_rules(id) on delete cascade,
  source_batch_id uuid references public.ingestion_batches(id) on delete set null,

  category text not null check (category in ('happy_hour', 'daily_special', 'live_music', 'trivia_event')),
  title text not null,
  performer_name text,

  occurrence_date date not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  end_time_label text,

  deals_summary jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  cover_charge text default 'No Cover',
  notes text,
  flyer_preview_url text,
  flyer_image_url text,

  is_exception boolean not null default false,
  is_cancelled boolean not null default false,
  confidence_score numeric(3,2) default 1.00,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_rule_occurrence_date unique nulls not distinct (recurring_rule_id, occurrence_date, start_at)
);

create index if not exists idx_occurrences_date_window
  on public.calendar_occurrences (occurrence_date, start_at, end_at)
  where not is_cancelled;

create index if not exists idx_occurrences_venue_date
  on public.calendar_occurrences (venue_id, occurrence_date, category);

create index if not exists idx_occurrences_tags
  on public.calendar_occurrences using gin (tags);

-- 5. Materialize Recurring Rules RPC Function
create or replace function public.materialize_recurring_rules(
  p_start_date date default current_date,
  p_days_ahead int default 30
)
returns int
language plpgsql
as $$
declare
  v_day date;
  v_dow smallint;
  v_rule record;
  v_start_ts timestamptz;
  v_end_ts timestamptz;
  v_effective_end_time time;
  v_inserted_count int := 0;
begin
  for i in 0..p_days_ahead loop
    v_day := p_start_date + i;
    v_dow := extract(dow from v_day)::smallint;

    for v_rule in
      select *
      from public.recurring_rules
      where is_active = true
        and v_dow = any(days_of_week)
        and v_day >= valid_from
        and (valid_until is null or v_day <= valid_until)
    loop
      v_effective_end_time := coalesce(v_rule.end_time, '23:59:00'::time);
      v_start_ts := (v_day || ' ' || v_rule.start_time)::timestamp at time zone 'America/New_York';

      if v_effective_end_time <= v_rule.start_time then
        v_end_ts := ((v_day + 1) || ' ' || v_effective_end_time)::timestamp at time zone 'America/New_York';
      else
        v_end_ts := (v_day || ' ' || v_effective_end_time)::timestamp at time zone 'America/New_York';
      end if;

      insert into public.calendar_occurrences (
        venue_id,
        recurring_rule_id,
        source_batch_id,
        category,
        title,
        occurrence_date,
        start_at,
        end_at,
        end_time_label,
        deals_summary,
        tags,
        notes
      )
      values (
        v_rule.venue_id,
        v_rule.id,
        v_rule.source_batch_id,
        v_rule.category,
        v_rule.title,
        v_day,
        v_start_ts,
        v_end_ts,
        v_rule.end_time_label,
        v_rule.deals_summary,
        v_rule.tags,
        v_rule.notes
      )
      on conflict (recurring_rule_id, occurrence_date, start_at)
      do update set
        title = excluded.title,
        end_at = excluded.end_at,
        end_time_label = excluded.end_time_label,
        deals_summary = excluded.deals_summary,
        tags = excluded.tags,
        notes = excluded.notes,
        updated_at = now()
      where public.calendar_occurrences.is_exception = false
        and public.calendar_occurrences.is_cancelled = false;

      v_inserted_count := v_inserted_count + 1;
    end loop;
  end loop;

  return v_inserted_count;
end;
$$;

-- 6. Row-Level Security & Storage Bucket
alter table public.venues enable row level security;
alter table public.ingestion_batches enable row level security;
alter table public.recurring_rules enable row level security;
alter table public.calendar_occurrences enable row level security;

drop policy if exists "Public can read active venues" on public.venues;
create policy "Public can read active venues" on public.venues for select using (true);

drop policy if exists "Public can read recurring rules" on public.recurring_rules;
create policy "Public can read recurring rules" on public.recurring_rules for select using (true);

drop policy if exists "Public can read calendar occurrences" on public.calendar_occurrences;
create policy "Public can read calendar occurrences" on public.calendar_occurrences for select using (true);

drop policy if exists "Public can read ingestion batches" on public.ingestion_batches;
create policy "Public can read ingestion batches" on public.ingestion_batches for select using (true);

drop policy if exists "Crew can insert/update recurring rules" on public.recurring_rules;
create policy "Crew can insert/update recurring rules" on public.recurring_rules for all using (true) with check (true);

drop policy if exists "Crew can insert/update calendar occurrences" on public.calendar_occurrences;
create policy "Crew can insert/update calendar occurrences" on public.calendar_occurrences for all using (true) with check (true);

drop policy if exists "Crew can insert/update ingestion batches" on public.ingestion_batches;
create policy "Crew can insert/update ingestion batches" on public.ingestion_batches for all using (true) with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'flyers',
  'flyers',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do nothing;

drop policy if exists "Public can view flyer graphics" on storage.objects;
create policy "Public can view flyer graphics" on storage.objects for select using (bucket_id = 'flyers');

drop policy if exists "Crew can upload flyer graphics" on storage.objects;
create policy "Crew can upload flyer graphics" on storage.objects for insert with check (bucket_id = 'flyers');

-- 7. Seed North Wildwood Entertainment District Venues & Rules
insert into public.venues (id, slug, name, neighborhood, address, cross_street, lat, lng, website_url, facebook_url, instagram_handle, phone, is_year_round)
values
  ('11111111-1111-1111-1111-111111111101', 'anglesea-pub', 'Anglesea Pub', 'North Wildwood (Anglesea)', '116 W 1st Ave, North Wildwood, NJ', '1st & Olde New Jersey Ave', 39.0074, -74.7942, 'https://angleseapub.com', 'https://facebook.com/angleseapub', '@angleseapub', '(609) 729-1133', true),
  ('11111111-1111-1111-1111-111111111102', 'owens-pub', 'Owen''s Pub', 'North Wildwood', '119 E 17th Ave, North Wildwood, NJ', '17th & New Jersey Ave', 38.9968, -74.7995, 'https://owenspubnw.com', 'https://facebook.com/owenspub', '@owenspubnw', '(609) 729-7290', true),
  ('11111111-1111-1111-1111-111111111103', 'keenans-irish-pub', 'Keenan''s Irish Pub', 'North Wildwood (Olde NJ Ave)', '113 Olde New Jersey Ave, North Wildwood, NJ', 'Walnut & Olde New Jersey Ave', 39.0065, -74.7931, 'https://keenansirishpub.com', 'https://facebook.com/keenansnw', '@keenansnw', '(609) 729-3344', false),
  ('11111111-1111-1111-1111-111111111104', 'joe-joes-place', 'Joe Joe''s Place', 'North Wildwood', '2201 Delaware Ave, North Wildwood, NJ', '22nd & Delaware Ave', 38.9932, -74.8055, null, 'https://facebook.com/joejoesplace', '@joejoesplacenw', '(609) 522-5646', true),
  ('11111111-1111-1111-1111-111111111105', 'flip-flopz', 'Flip Flopz Beach Bar & Grill', 'North Wildwood (Olde NJ Ave)', '106 W Spruce Ave, North Wildwood, NJ', 'Spruce & Olde New Jersey Ave', 39.0059, -74.7928, 'https://flipflopzbeachbar.com', 'https://facebook.com/flipflopz', '@flipflopznw', '(609) 522-3350', false),
  ('11111111-1111-1111-1111-111111111106', 'mudhen-brewing', 'MudHen Brewing Company', 'Wildwood Border', '127 W Rio Grande Ave, Wildwood, NJ', 'Rio Grande & New Jersey Ave', 38.9835, -74.8195, 'https://mudhenbrew.com', 'https://facebook.com/mudhenbrew', '@mudhenbrew', '(609) 846-7918', true),
  ('11111111-1111-1111-1111-111111111107', 'tavern-on-the-bay', 'Tavern on the Bay', 'North Wildwood (Anglesea)', '800 N New York Ave, North Wildwood, NJ', 'Hereford Inlet Bayfront', 39.0108, -74.7960, 'https://tavernonthebayresort.com', 'https://facebook.com/tavernonthebay', '@tavernonthebaynj', '(609) 522-6244', true),
  ('11111111-1111-1111-1111-111111111108', 'old-city-pub', 'Old City Pub', 'North Wildwood (Olde NJ Ave)', '1408 New Jersey Ave, North Wildwood, NJ', '14th & New Jersey Ave', 38.9989, -74.7982, 'https://oldcitypubnw.com', 'https://facebook.com/oldcitypub', '@oldcitypubnw', '(609) 854-3686', true)
on conflict (slug) do nothing;

insert into public.recurring_rules (id, venue_id, category, title, days_of_week, start_time, end_time, end_time_label, deals_summary, tags, notes)
values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'happy_hour', 'Anglesea Pub Afternoon Happy Hour', '{1,2,3,4,5}', '15:00', '18:00', null, '["$3.50 Domestic Pints", "$5 Guinness Imperial Pints (Thu)", "$7 Jameson Orange Crushes", "$8 Pub Pretzel & Beer Cheese"]'::jsonb, '{"draft_beer","crushes","half_price_apps"}', 'Bar area & high-tops'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'happy_hour', 'Owen''s Locals Happy Hour & Wing Special', '{1,2,3,4,5}', '16:00', '19:00', null, '["$2.75 Miller Lite & Yuengling Drafts", "75¢ Jumbo Wings (Eat-in w/ Beverage)", "$6 House Cocktails", "$7 Roast Beef Sandwiches"]'::jsonb, '{"draft_beer","wings","burgers_sandwiches"}', 'Cash or card; eat-in at bar'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'happy_hour', 'Keenan''s Patio & Crush Happy Hour', '{5,6}', '15:00', '19:00', null, '["$6 Fresh Squeezed Orange & Grapefruit Crushes", "$3.50 Miller Lite Bottles", "1/2 Price Loaded Tots & Flatbreads"]'::jsonb, '{"crushes","cans_bottles","half_price_apps","outdoor_deck"}', 'Shoulder season Fri/Sat schedule'),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', 'daily_special', 'Joe Joe''s Buck-a-Shuck & Prime Rib', '{4,5}', '16:00', '21:00', null, '["$1.25 Cape May Salts Oysters & Clams", "$3 Domestic Mugs", "$22 Queen Cut Prime Rib Dinner"]'::jsonb, '{"oysters_clams","draft_beer"}', 'Until sold out'),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111106', 'happy_hour', 'MudHen Craft & Smokehouse Happy Hour', '{1,2,3,4,5}', '15:00', '18:00', null, '["$2 Off All House Craft Pints", "$8 Smoked Brisket Sliders", "$7 Smoked Wings", "$6 House Sangria"]'::jsonb, '{"draft_beer","wings","burgers_sandwiches"}', 'Available in Biergarten & Main Bar'),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111107', 'happy_hour', 'Sunset Bayfront Raw Bar & Cocktail Hour', '{3,4,5,6,0}', '16:00', '18:30', null, '["$1.50 Little Neck Clams & Oysters", "$8 Espresso Martinis", "$6 House Wine Pours", "$9 Crab Dip Skillet"]'::jsonb, '{"oysters_clams","cocktails","wine","outdoor_deck"}', 'Downstairs Bay Bar')
on conflict (id) do nothing;

-- 8. Seed Concrete Weekend Live Music Occurrences
insert into public.calendar_occurrences (
  id, venue_id, category, title, performer_name, occurrence_date, start_at, end_at, end_time_label, deals_summary, tags, cover_charge, notes
)
values
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', 'live_music', 'Acoustic Happy Hour Set: Danny Eyer', 'Danny Eyer', '2026-10-30', '2026-10-30T16:00:00-04:00', '2026-10-30T19:00:00-04:00', null, '["$3.50 Domestic Pints", "$7 Jameson Orange Crushes"]'::jsonb, '{"acoustic_solo","draft_beer","crushes","no_cover","outdoor_deck"}', 'No Cover', 'Overlaps with Afternoon Happy Hour at the bar.'),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111101', 'live_music', 'Friday Night Live: The Juliano Brothers', 'The Juliano Brothers', '2026-10-30', '2026-10-30T20:30:00-04:00', '2026-10-30T23:59:00-04:00', 'Late', '["$5 Guinness Imperial Pints", "Late Night Pub Menu till 11pm"]'::jsonb, '{"live_band","draft_beer","no_cover"}', 'No Cover', 'Full band inside main pub stage.'),
  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111103', 'live_music', 'Split Decision on the Main Stage', 'Split Decision', '2026-10-30', '2026-10-30T20:00:00-04:00', '2026-10-30T23:59:00-04:00', '12:00 AM', '["$4 Miller Lite Bottles till 10pm", "$6 Orange Crushes"]'::jsonb, '{"live_band","cans_bottles","crushes"}', '$5 after 9pm', 'Doors open all afternoon.'),
  ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111106', 'live_music', 'Biergarten Live Music: Animal House Band', 'Animal House Band', '2026-10-30', '2026-10-30T17:00:00-04:00', '2026-10-30T21:00:00-04:00', null, '["House Craft Pints", "Smokehouse BBQ Platter Specials"]'::jsonb, '{"live_band","draft_beer","no_cover","outdoor_deck"}', 'No Cover', 'Family friendly in the heated Biergarten.'),
  ('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111102', 'live_music', 'Saturday Night Band: TBA Local Acoustic Duo', 'TBA Acoustic Duo', '2026-10-31', '2026-10-31T20:30:00-04:00', '2026-10-31T23:59:00-04:00', 'Close', '["$3 Domestic Drafts", "$6 Crushes"]'::jsonb, '{"acoustic_solo","draft_beer","no_cover"}', 'No Cover', 'Placeholder slot from early week schedule.'),
  ('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111103', 'live_music', 'Afternoon Deck Party: Sensational Soul Cruisers', 'Sensational Soul Cruisers', '2026-10-31', '2026-10-31T15:00:00-04:00', '2026-10-31T19:00:00-04:00', null, '["$6 Fresh Squeezed Crushes", "$3.50 Miller Lite Bottles", "1/2 Price Apps"]'::jsonb, '{"live_band","crushes","cans_bottles","outdoor_deck","no_cover"}', 'No Cover before 4pm', 'Under the heated deck tent.')
on conflict (id) do nothing;

-- 9. Materialize the next 30 days of recurring rules
select public.materialize_recurring_rules(current_date, 30);
