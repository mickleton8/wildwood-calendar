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

3. **Hybrid Temporal Database & 3-Tier Seasonal Engine (`Supabase PostgreSQL`)**
   - `venues`: Canonical **57-venue corridor roster** across 5 geographic zones audited with 3-tier seasonal status (`22 Open Year-Round`, `8 Weekends/Limited`, `27 Closed for the Season`).
   - `recurring_rules`: **40 web-verified schedules** (36 active Fall/Winter weekly schedules + 4 paused summer templates preserved for Spring reopening).
   - `calendar_occurrences`: Materialized 30-day event rows (**328 active verified occurrences**, zero ghost occurrences for seasonally closed spots like Mad Viking, North End, or Curran's) generated via the `materialize_recurring_rules` Postgres RPC function, preserving single-date exceptions (`is_exception = true`).
   - Real-time Postgres subscriptions update all connected phones immediately when a flyer is published or seasonal status changes.

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
  npx -y vercel --prod --yes
  ```
