-- =============================================================================
-- Wildwood Happy Hour & Live Music Calendar
-- Migration 0001: Hybrid Recurring Rules + Materialized Calendar Occurrences
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
  days_of_week smallint[] not null, -- 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  start_time time not null,         -- Wall-clock time in America/New_York
  end_time time,                    -- Nullable if open-ended ("4pm-Close")
  end_time_label text,              -- e.g. 'Close' or 'Late'
  deals_summary jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  notes text,
  valid_from date not null default current_date,
  valid_until date,
  is_active boolean not null default true,
  source_batch_id uuid references public.ingestion_batches(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- 4. Materialized Calendar Occurrences (Single source of truth for timeline queries)
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

  is_exception boolean not null default false,
  is_cancelled boolean not null default false,
  confidence_score numeric(3,2) default 1.00,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Prevent duplicate materialization for the same rule on the same date
  constraint uq_rule_occurrence_date unique nulls not distinct (recurring_rule_id, occurrence_date, start_at)
);

create index if not exists idx_occurrences_date_window
  on public.calendar_occurrences (occurrence_date, start_at, end_at)
  where not is_cancelled;

create index if not exists idx_occurrences_venue_date
  on public.calendar_occurrences (venue_id, occurrence_date, category);

create index if not exists idx_occurrences_tags
  on public.calendar_occurrences using gin (tags);

-- =============================================================================
-- RPC Function: Materialize Recurring Rules into Concrete Calendar Occurrences
-- Preserves any row where is_exception = true or is_cancelled = true
-- =============================================================================
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

      -- Handle overnight spans (e.g. 9:00 PM to 1:30 AM)
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
