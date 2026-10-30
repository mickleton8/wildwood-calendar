-- =============================================================================
-- Wildwood Pulse — Migration 0002: Row-Level Security (RLS) & Flyers Storage
-- =============================================================================

-- Ensure flyer_image_url column exists on calendar_occurrences for direct UI binding
alter table public.calendar_occurrences
  add column if not exists flyer_image_url text;

-- Enable RLS on all core tables
alter table public.venues enable row level security;
alter table public.ingestion_batches enable row level security;
alter table public.recurring_rules enable row level security;
alter table public.calendar_occurrences enable row level security;

-- 1. Public Read Policies (Friends & family can browse without login)
drop policy if exists "Public can read active venues" on public.venues;
create policy "Public can read active venues"
  on public.venues for select
  using (true);

drop policy if exists "Public can read recurring rules" on public.recurring_rules;
create policy "Public can read recurring rules"
  on public.recurring_rules for select
  using (true);

drop policy if exists "Public can read calendar occurrences" on public.calendar_occurrences;
create policy "Public can read calendar occurrences"
  on public.calendar_occurrences for select
  using (true);

drop policy if exists "Public can read ingestion batches" on public.ingestion_batches;
create policy "Public can read ingestion batches"
  on public.ingestion_batches for select
  using (true);

-- 2. Trusted Crew Write Policies (Allows anon/authenticated client writes for Friends & Family MVP)
drop policy if exists "Crew can insert/update recurring rules" on public.recurring_rules;
create policy "Crew can insert/update recurring rules"
  on public.recurring_rules for all
  using (true)
  with check (true);

drop policy if exists "Crew can insert/update calendar occurrences" on public.calendar_occurrences;
create policy "Crew can insert/update calendar occurrences"
  on public.calendar_occurrences for all
  using (true)
  with check (true);

drop policy if exists "Crew can insert/update ingestion batches" on public.ingestion_batches;
create policy "Crew can insert/update ingestion batches"
  on public.ingestion_batches for all
  using (true)
  with check (true);

-- 3. Provision Supabase Storage Bucket for Shore Flyers
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'flyers',
  'flyers',
  true,
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do nothing;

drop policy if exists "Public can view flyer graphics" on storage.objects;
create policy "Public can view flyer graphics"
  on storage.objects for select
  using (bucket_id = 'flyers');

drop policy if exists "Crew can upload flyer graphics" on storage.objects;
create policy "Crew can upload flyer graphics"
  on storage.objects for insert
  with check (bucket_id = 'flyers');
