# Wildwood Pulse — Agent Guidelines & Project Memory

## Project Overview
**Wildwood Pulse** is a mobile-first Progressive Web App (PWA) built for a local group of Wildwood, NJ friends and family to track Happy Hours, Food/Drink Specials, Raw Bars, and Live Music across the **Wildwood-to-Cape-May Corridor** (`North Wildwood`, `Wildwood`, `Wildwood Crest`, `Cape May`, and `North Cape May & Off-Island`).

- **Production URL:** `https://wildwood-calendar.vercel.app`
- **GitHub Repository:** `git@github.com:mickleton8/wildwood-calendar.git` (branch `main`)
- **Supabase Project URL:** `https://bbeczagskcxbagxjkvwn.supabase.co`
- **Tech Stack:** React 19, Vite 6, TypeScript, Tailwind CSS v4, Lucide Icons, Supabase (PostgreSQL + Storage + Realtime), Google Gemini 3.5 Flash Vision (`@google/genai` / REST API), Playwright (`scrapers/north-wildwood-scraper.ts`).

---

## Key Architectural Rules & Conventions

### 1. Hybrid Temporal Database Model (`recurring_rules` + `calendar_occurrences`)
- **Weekly Templates (`public.recurring_rules`):** Store repeating weekly schedules (`days_of_week smallint[]` where `0=Sun .. 6=Sat`, `start_time`, `end_time`, `end_time_label`, `deals_summary jsonb`, `tags text[]`).
- **Materialized Occurrences (`public.calendar_occurrences`):** Single source of truth queried by the frontend timeline. Contains both materialized rows linked via `recurring_rule_id` and standalone one-off events (`recurring_rule_id IS NULL`).
- **Protecting Exceptions:** Whenever a single date is edited via Flyer Diff Upsert or soft-cancelled in the UI, `is_exception = true` (and `is_cancelled = true` if cancelled) MUST be set. Both the PostgreSQL RPC `public.materialize_recurring_rules(p_start_date, p_days_ahead)` and the client-side mirror `materializeRecurringRulesClient()` in `src/data/seedData.ts` skip overwriting any row where `is_exception = true` or `is_cancelled = true`.

### 2. Canonical 78-Venue Corridor Roster (`src/data/venuesRoster.ts` & `supabase/sync_57_venues.sql`)
Local seed data (`src/data/venuesRoster.ts` / `src/data/seedData.ts`) and Supabase PostgreSQL (`supabase/sync_57_venues.sql`) share deterministic UUIDs (`11111111-1111-1111-1111-111111111101` through `11111111-1111-1111-1111-111111111178`) across all **78 verified venues** in 5 corridor areas:
- **North Wildwood (16):** Anglesea Pub (`..101`), Owen's Pub (`..102`), Keenan's Irish Pub (`..103`), Joe Joe's Place Tacos & Tequila (`..104`), Flip Flopz (`..105`), The Surfing Pig (`..107`), The Inlet North Wildwood (`..109`), Exit6ix (`..110`), Curran's Irish Inn (`..111`), North End American Grill (`..112`), The Salty Mermaid (`..113`), Seaport Pier (`..114`), Lazy Bass Bayside (`..115`), Balkan Fusion (`..160`), Wildwoods BBQ (`..163`), DeAngelis Culinary (`..164`).
- **Wildwood (32):** MudHen Brewing Co. (`..106`), Old City Pub (`..108`), Firehouse Tavern (`..116`), Blue Water Grille in the Bolero Resort (`..117`), Jersey Girl Kitchen | Bar (`..118`), Schellenger's Restaurant (`..119`), Timmy's Ale House (`..120`), La Cantina (`..121`), Sandy Boots Saloon (`..122`), Fairview Social (`..123`), The Point - Wildwood (`..124`), Cattle 'n Clover (`..125`), Wildwood's Honky Tonk Saloon (`..126`), Ship 'N Shore Bar (`..127`), The Wharf (`..128`), Lost Buoy Bar (`..129`), Urie's Waterfront (`..130`), Santorini (`..131`), Boathouse Restaurant (`..132`), Beach Creek Oyster Bar (`..133`), Mulligan's Shore Bar (`..134`), Anglesea Aleworks (`..135`), Alfe's Restaurant (`..136`), Dogtooth Bar & Grill (`..137`), Copper Dog Wildwood (`..138`), Poppi's Brick Oven (`..139`), Duffinetti's (`..140`), Corkyard (`..141`), The Ravioli House (`..142`), Venezia (`..143`), Sabbia D'Oro Italiano (`..158`), Comercial Mexicana LLC (`..159`), Taqueria El Azteca (`..161`), Pasta Pesto Bar & Grill (`..162`).
- **Wildwood Crest & Two Mile (4):** Little Italy (`..144`), George's Place (`..145`), Crest Tavern (`..146`), Two Mile Crab House & Crush Bar (`..147`).
- **Cape May & Harbor (16):** Mooncussers (`..148`), Port Marina and Restaurant (`..149`), Mad Viking Dock Bar (`..150`), Lucky Bones Backwater Grille (`..151`), Mayer's Tavern (`..152`), The Lobster House (`..165`), C-View Inn (`..166`), Washington Inn & Wine Bar (`..167`), Peter Shields Inn & Restaurant (`..168`), La La Lobster Cape May (`..169`), The Bees Knees Kitchen & Speakeasy Bar (`..170`), Taco Caballito Tequileria (`..171`), Ugly Mug Bar & Restaurant (`..172`), The Mad Batter Restaurant & Bar (`..173`), Leone's Cape May (`..174`), Panico's Bistro (`..175`).
- **North Cape May & Off-Island (8):** Behr Brewing (`..153`), Red Brick Ale House (`..154`), Gusto Brewing Co. (`..155`), Nauti Spirits Distillery (`..156`), Whale Tale Brewing Co. (`..157`), 5 West Pub (`..176`), Harpoon's On The Bay (`..177`), Cape May Brewing Co. Tasting Room & Brewtique (`..178`).

*(Note: Never re-add "Tavern on the Bay" — that venue is in Somers Point, NJ, not Wildwood.)*

### 3. Controlled Filter Tag Vocabulary (`FilterTag`)
All extracted and seeded events must restrict their `tags` array to the controlled vocabulary defined in `src/types/calendar.ts` and `src/data/seedData.ts`:
- **Drinks:** `draft_beer`, `cans_bottles`, `crushes`, `margaritas`, `cocktails`, `wine`, `shots`, `byob`
- **Food:** `wings`, `tacos`, `oysters_clams`, `burgers_sandwiches`, `pizza`, `half_price_apps`
- **Music/Vibe:** `live_band`, `acoustic_solo`, `dj`, `irish_music`, `trivia_bingo`, `no_cover`, `outdoor_deck`

### 4. Vision AI Extraction & Edge Cases (`src/lib/flyerExtractor.ts` & `SplitScreenReviewer.tsx`)
- **Active Multimodal Model Endpoint:** Calls `gemini-3.5-flash` with automatic fallback to `gemini-3.5-flash-lite`, passing `responseMimeType: 'application/json'`. Sanitizes responses by stripping markdown fences (` ```json `) before parsing.
- **Relative Date Anchoring:** Always pass the current `America/New_York` date (`getEasternNow().dateStr`) into Gemini prompts so `"This Friday"`, `"Tomorrow"`, or `"Saturday Oct 31"` resolves to an exact `YYYY-MM-DD` string.
- **Transparent Status Badging:** Reviewer displays a green `✨ Vision AI` badge when the model successfully extracted events, or an amber `⚠️ Manual Mode` badge with an explicit notice banner if an upload drops into manual fallback mode.
- **Open-Ended Times (`"4pm-Close"`, `"Starts at 8:30 PM"`):** Store the display label in `end_time_label` (`"Close"`, `"Late"`) while assigning a concrete `end_time` (`"23:59"`) for timeline sorting, and attach an `ambiguity_flags` entry on `end_time` so the Split-Screen Reviewer highlights it in amber.
- **Fuzzy Diff Matching:** `attachFuzzyDiffMatches()` matches candidate items against existing occurrences by `(venue_id, occurrence_date, category)` (within a 3-hour start window) to badge cards as `✨ NEW` vs `🔄 UPDATE (Diff)`.

### 5. Web-Verified Schedules & 3-Tier Seasonal Engine (`src/data/seedData.ts` & `src/data/venuesRoster.ts`)
- **Zero Synthetic / Invented Schedules:** All recurring rules and one-off events must be verified from official venue websites or published social schedules. Never invent fake bands or unverified drink specials.
- **First-Party Primary Source Verification vs. Third-Party Aggregators:** Always audit against official first-party venue domains (`venue.website_url` or verified social media channels) rather than third-party tourism portals (e.g., `wildwoodsnj.com`, Cape May county visitor guides). Third-party directories frequently keep outdated legacy specials cached for years (e.g., historical "$0.99 drafts" at Owen's Pub). If an official website only publishes food specials (e.g. Owen's Pub's 3–6 PM "Appy Hour" food menu) without quoting drink prices, use generic descriptor strings like `"Discounted Bar Drinks (Inquire at Bar)"` rather than unverified dollar prices from old aggregators.
- **3-Tier Seasonal Status:** Every venue has `seasonal_status`: `'open'` (22 venues, open 5-7 days), `'weekends_only'` (8 venues, restricted to `open_days_of_week` like Thu–Sun), or `'closed_for_season'` (27 venues, e.g. Mad Viking Dock Bar, North End American Grill, Curran's Irish Inn, Two Mile Crab House, Whale Tale Brewing Company).
- **Paused Summer/Renovation Templates:** When a venue is `closed_for_season`, its rules are kept in the database with `is_active = false` (saved for Spring reopening). The materialization RPC and client mirror produce zero rows for closed venues.
- **Open-Days Intersection:** For `weekends_only` venues, recurring rules only materialize on days matching `open_days_of_week` (e.g., The Inlet's 3–6 PM Happy Hour only appears on Thu/Fri).
- **22-Day Scrubber & 30-Day Materialization Horizon:** `src/App.tsx` renders a 22-day horizontal date scrubber backed by `public.materialize_recurring_rules(p_days_ahead => 30)` in Supabase (currently 453 active verified occurrences across 78 venues).
- **Local Cache Versioning:** Whenever `SEED_VENUES`, `SEED_RECURRING_RULES`, or `SEED_ONE_OFF_OCCURRENCES` change, bump `STORAGE_KEYS` suffix in `src/lib/supabase.ts` (currently `v11`) so browsers refresh cached fallback state.

### 6. Timeline Card Presentation & UX Rules
- **Live Status Scoped to Today:** Dynamic status badges (`Active Now...`, `Starts in...`, `Ending Soon...`, `Ended earlier today`) and the green glowing border are strictly restricted to `Today` (`occ.occurrence_date === liveEasternDate`). Non-current calendar dates render only their static time window (`format12Hour(occ.start_time_local) – format12Hour(occ.end_time_local)`).
- **Conditional Live Clock & Filter Bar:** The "Happening Now / Starting Soon" filter bar, Shore Clock (`Live Shore Time (x:xx PM)`), and simulated time preview buttons in `src/App.tsx` are conditionally rendered only when `selectedDate === liveEasternDate`. When browsing future or past days, this bar is hidden to prevent confusion and maximize timeline screen real estate.
- **iOS Safe Area Top Insets:** On mobile devices (specifically iPhone portrait mode with `viewport-fit=cover` and translucent status bar), sticky elements like `<header>` and full-screen modals apply `style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}`. This ensures content begins safely below the notch / Dynamic Island while allowing background blurs to extend seamlessly to the device bezel.
- **No Truncated Specials / Flex-Wrap Flow:** Never truncate deal strings with `...`. The `deals_summary` container uses `flex flex-wrap gap-1.5` with `inline-flex` items so multiple short deals (like drink specials or $1 oysters) pack 2–4 per row without expanding card height into a long vertical list.
- **Card Header Venue Website Links:** Each card header renders a direct `Website ↗` link whenever `venue.website_url` is present.

### 7. Environment Variables & Deployment Gotchas
- **Supabase Key Naming:** Supabase's dashboard Connect modal provides `VITE_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`). `src/lib/supabase.ts` checks `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY`. Keep both supported.
- **Vercel CLI v65+ Env Var Quirk:** When adding `VITE_*` API keys via Vercel CLI v65+, pass `--environment production --type config --force` (using `printf "value" | npx vercel env add KEY --environment production --type config --force`) to avoid interactive credential-exposure blocks.
- **Non-Interactive Vercel Deploy:** Always invoke Vercel with `npx -y vercel --prod --yes` (passing `-y` to `npx` prevents hanging on package version prompts).
- **Deploying Updates:** Run `npm run build` to verify TypeScript (`tsc -b`) and Vite bundle cleanly, commit and push to `origin main`, then deploy with `npx -y vercel --prod --yes`.
