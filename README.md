# Wildwood Pulse 🌊🍻🎸

**Live Production App:** [https://wildwood-calendar.vercel.app](https://wildwood-calendar.vercel.app)

A mobile-first Progressive Web App (PWA) for tracking **Happy Hours, Raw Bars, Daily Food/Drink Specials, and Live Music** across the **57-Venue Wildwood-to-Cape-May Corridor** (`North Wildwood`, `Wildwood`, `Wildwood Crest`, `Cape May`, and `North Cape May & Off-Island`).

---

## Core Features

1. **"Happening Now / Starting Soon" Live Shore Timeline**
   - Tracks real-time Eastern Wall-Clock Time (`America/New_York`) with live countdown badges (`🟢 Active Now • Ends in 45m`, `⏳ Starts in 25m`).
   - Includes a **Preview Clock** switcher (`4:30 PM HH`, `6:15 PM Raw Bar`, `9:00 PM Bands`) to inspect schedules across different times of day.
   - **Corridor Zone Filter Bar** (`All 57 Venues`, `North Wildwood`, `Wildwood`, `Wildwood Crest`, `Cape May`, `North Cape May & Off-Island`), **57-Venue Directory Modal** with direct phone/website links and 1-click flyer drop, **22-day horizontal date scrubber**, category pills, and 19 standardized quick-filter tags (`🍊 Crushes`, `🍺 Draft Deals`, `🍗 Wings`, `🦪 Raw Bar`, `🎸 Full Band`, `🎶 Acoustic`, `🎟️ No Cover`, `🌅 Deck/Patio`).

2. **Trusted Crew Mode & Split-Screen Vision AI Reviewer**
   - Unlocked with the shared Friends & Family Crew PIN (default: `1922`).
   - Upload or `Ctrl+V` paste any Facebook/Instagram venue flyer screenshot.
   - **Gemini 2.5 Flash Vision** extracts structured events, resolves relative dates (`"This Friday"`), infers open-ended closing times (`"8:30pm-Close"`), and flags ambiguous fields in **amber** for 1-click verification.
   - **Fuzzy Diff Engine** matches extracted items by `(venue_id, occurrence_date, category)` to cleanly upsert band changes (`🔄 UPDATE (Diff)`) instead of creating duplicates.

3. **Hybrid Temporal Database (`Supabase PostgreSQL`)**
   - `venues`: Canonical **57-venue corridor roster** across 5 geographic zones (`src/data/venuesRoster.ts` & `supabase/sync_57_venues.sql`).
   - `recurring_rules`: **24 web-verified weekly schedules** across active year-round & shoulder-season venues (*Anglesea Pub*, *Owen's Pub*, *MudHen Brewing Co.*, *Dogtooth Bar & Grill*, *North End American Grill*, *Curran's Irish Inn*, *The Inlet*, *The Surfing Pig*, *Cattle 'n Clover*, *Fairview Social*, *Lucky Bones*, *Port Marina*, *Mad Viking*, *Nauti Spirits*).
   - `calendar_occurrences`: Materialized 30-day event rows (`299` active occurrences including verified November live music dates from `mudhenbrew.com/events`) generated via the `materialize_recurring_rules` Postgres RPC function, preserving single-date exceptions (`is_exception = true`).
   - Real-time Postgres subscriptions update all connected phones immediately when a flyer is published.

---

## Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Type-check and build for production
npm run build

# Run Playwright North Wildwood venue scraper
npm run scrape
```

## Database Setup & Deployment

- **Supabase All-in-One Setup:** Paste [`supabase/full_setup.sql`](./supabase/full_setup.sql) into the Supabase SQL Editor and click **Run**.
- **Deploy to Vercel:**
  ```bash
  npx vercel --prod --yes
  ```
