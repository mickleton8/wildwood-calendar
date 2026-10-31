# Wildwood Pulse — Agent Guidelines & Project Memory

## Project Overview
**Wildwood Pulse** is a mobile-first Progressive Web App (PWA) built for a local group of Wildwood, NJ friends and family to track Happy Hours, Food/Drink Specials, Raw Bars, and Live Music across the **Wildwood-to-Cape-May Corridor** (`North Wildwood`, `Wildwood`, `Wildwood Crest`, `Cape May`, and `North Cape May & Off-Island`).

- **Production URL:** `https://wildwood-calendar.vercel.app`
- **GitHub Repository:** `git@github.com:mickleton8/wildwood-calendar.git` (branch `main`)
- **Supabase Project URL:** `https://bbeczagskcxbagxjkvwn.supabase.co`
- **Tech Stack:** React 19, Vite 6, TypeScript, Tailwind CSS v4, Lucide Icons, Supabase (PostgreSQL + Storage + Realtime), Google Gemini 2.5 Flash Vision (`@google/genai` / REST API), Playwright (`scrapers/north-wildwood-scraper.ts`).

---

## Key Architectural Rules & Conventions

### 1. Hybrid Temporal Database Model (`recurring_rules` + `calendar_occurrences`)
- **Weekly Templates (`public.recurring_rules`):** Store repeating weekly schedules (`days_of_week smallint[]` where `0=Sun .. 6=Sat`, `start_time`, `end_time`, `end_time_label`, `deals_summary jsonb`, `tags text[]`).
- **Materialized Occurrences (`public.calendar_occurrences`):** Single source of truth queried by the frontend timeline. Contains both materialized rows linked via `recurring_rule_id` and standalone one-off events (`recurring_rule_id IS NULL`).
- **Protecting Exceptions:** Whenever a single date is edited via Flyer Diff Upsert or soft-cancelled in the UI, `is_exception = true` (and `is_cancelled = true` if cancelled) MUST be set. Both the PostgreSQL RPC `public.materialize_recurring_rules(p_start_date, p_days_ahead)` and the client-side mirror `materializeRecurringRulesClient()` in `src/data/seedData.ts` skip overwriting any row where `is_exception = true` or `is_cancelled = true`.

### 2. Canonical 57-Venue Corridor Roster (`src/data/venuesRoster.ts` & `supabase/sync_57_venues.sql`)
Local seed data (`src/data/venuesRoster.ts` / `src/data/seedData.ts`) and Supabase PostgreSQL (`supabase/sync_57_venues.sql`) share deterministic UUIDs (`11111111-1111-1111-1111-111111111101` through `11111111-1111-1111-1111-111111111157`) across all **57 verified venues** in 5 corridor areas:
- **North Wildwood (13):** Anglesea Pub (`..101`), Owen's Pub (`..102`), Keenan's Irish Pub (`..103`), Joe Joe's Place Tacos & Tequila (`..104`), Flip Flopz (`..105`), The Surfing Pig (`..107`), The Inlet North Wildwood (`..109`), Exit6ix (`..110`), Curran's Irish Inn (`..111`), North End American Grill (`..112`), The Salty Mermaid (`..113`), Seaport Pier (`..114`), Lazy Bass Bayside (`..115`).
- **Wildwood (28):** MudHen Brewing Co. (`..106`), Old City Pub (`..108`), Firehouse Tavern (`..116`), Blue Water Grille in the Bolero Resort (`..117`), Jersey Girl Kitchen | Bar (`..118`), Schellenger's Restaurant (`..119`), Timmy's Ale House (`..120`), La Cantina (`..121`), Sandy Boots Saloon (`..122`), Fairview Social (`..123`), The Point - Wildwood (`..124`), Cattle 'n Clover (`..125`), Wildwood's Honky Tonk Saloon (`..126`), Ship 'N Shore Bar (`..127`), The Wharf (`..128`), Lost Buoy Bar (`..129`), Urie's Waterfront (`..130`), Santorini (`..131`), Boathouse Restaurant (`..132`), Beach Creek Oyster Bar (`..133`), Mulligan's Shore Bar (`..134`), Anglesea Aleworks (`..135`), Alfe's Restaurant (`..136`), Dogtooth Bar & Grill (`..137`), Copper Dog Wildwood (`..138`), Poppi's Brick Oven (`..139`), Duffinetti's (`..140`), Corkyard (`..141`), The Ravioli House (`..142`), Venezia (`..143`).
- **Wildwood Crest & Two Mile (4):** Little Italy (`..144`), George's Place (`..145`), Crest Tavern (`..146`), Two Mile Crab House & Crush Bar (`..147`).
- **Cape May & Harbor (5):** Mooncussers (`..148`), Port Marina and Restaurant (`..149`), Mad Viking Dock Bar (`..150`), Lucky Bones Backwater Grille (`..151`), Mayer's Tavern (`..152`).
- **North Cape May & Off-Island (5):** Behr Brewing (`..153`), Red Brick Ale House (`..154`), Gusto Brewing Co. (`..155`), Nauti Spirits Distillery (`..156`), Whale Tale Brewing Co. (`..157`).

*(Note: Never re-add "Tavern on the Bay" — that venue is in Somers Point, NJ, not Wildwood.)*

### 3. Controlled Filter Tag Vocabulary (`FilterTag`)
All extracted and seeded events must restrict their `tags` array to the controlled vocabulary defined in `src/types/calendar.ts` and `src/data/seedData.ts`:
- **Drinks:** `draft_beer`, `cans_bottles`, `crushes`, `margaritas`, `cocktails`, `wine`, `shots`
- **Food:** `wings`, `tacos`, `oysters_clams`, `burgers_sandwiches`, `pizza`, `half_price_apps`
- **Music/Vibe:** `live_band`, `acoustic_solo`, `dj`, `irish_music`, `trivia_bingo`, `no_cover`, `outdoor_deck`

### 4. Vision AI Extraction & Edge Cases (`src/lib/flyerExtractor.ts` & `SplitScreenReviewer.tsx`)
- **Relative Date Anchoring:** Always pass the current `America/New_York` date (`getEasternNow().dateStr`) into Gemini prompts so `"This Friday"` or `"Saturday Oct 31"` resolves to an exact `YYYY-MM-DD` string.
- **Open-Ended Times (`"4pm-Close"`, `"Starts at 8:30 PM"`):** Store the display label in `end_time_label` (`"Close"`, `"Late"`) while assigning a concrete `end_time` (`"23:59"`) for timeline sorting, and attach an `ambiguity_flags` entry on `end_time` so the Split-Screen Reviewer highlights it in amber.
- **Fuzzy Diff Matching:** `attachFuzzyDiffMatches()` matches candidate items against existing occurrences by `(venue_id, occurrence_date, category)` (within a 3-hour start window) to badge cards as `✨ NEW` vs `🔄 UPDATE (Diff)`.

### 5. Web-Verified Schedules & Data Integrity (`src/data/seedData.ts`)
- **Zero Synthetic / Invented Schedules:** All recurring rules (`SEED_RECURRING_RULES`, 24 verified rules) and one-off events (`SEED_ONE_OFF_OCCURRENCES`, 6 verified November live music events from `mudhenbrew.com/events`) must be verified from official venue websites or published social schedules. Never invent fake bands or unverified drink specials.
- **22-Day Scrubber & 30-Day Materialization Horizon:** `src/App.tsx` renders a 22-day horizontal date scrubber so users can browse upcoming multi-week live music lineups, backed by `public.materialize_recurring_rules(p_days_ahead => 30)` in Supabase.
- **Local Cache Versioning:** Whenever `SEED_VENUES`, `SEED_RECURRING_RULES`, or `SEED_ONE_OFF_OCCURRENCES` change in `src/data/seedData.ts`, bump the `STORAGE_KEYS` suffix in `src/lib/supabase.ts` (currently `v3`) so browsers refresh cached fallback state.

### 6. Environment Variables & Deployment Gotchas
- **Supabase Key Naming:** Supabase's dashboard Connect modal provides `VITE_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`). `src/lib/supabase.ts` checks `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY`. Keep both supported.
- **Vercel CLI v65+ Env Var Quirk:** When adding `VITE_*` API keys via Vercel CLI v65+, pass `--environment production --type config --force` (using `printf "value" | npx vercel env add KEY --environment production --type config --force`) to avoid interactive credential-exposure blocks.
- **Deploying Updates:** Run `npm run build` to verify TypeScript (`tsc -b`) and Vite bundle cleanly, commit and push to `origin main`, then deploy with `npx vercel --prod --yes`.
