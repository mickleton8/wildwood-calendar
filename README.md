# Wildwood Pulse 🌊🍻🎸

**Live Production App:** [https://wildwood-calendar.vercel.app](https://wildwood-calendar.vercel.app)

A mobile-first Progressive Web App (PWA) for tracking **Happy Hours, Raw Bars, Daily Food/Drink Specials, and Live Music** across the **79-Venue Wildwood-to-Cape-May Corridor** (`North Wildwood`, `Wildwood`, `Wildwood Crest & Two Mile`, `Cape May & Harbor`, and `North Cape May & Off-Island`).

---

## Core Features

1. **"Happening Now / Starting Soon" Live Shore Timeline & Mobile Dock**
   - Tracks real-time Eastern Wall-Clock Time (`America/New_York`) with live countdown badges (`🟢 Active Now • Ends in 45m`, `⏳ Starts in 25m`), strictly scoped to today.
   - **Mobile Floating Quick Dock:** One-thumb access to `Today`, `Search` (auto-focuses), `+ Flyer AI`, `79 Spots`, and `Tools` with iOS safe-area handling.
   - **Horizontal Date Scrubber:** 22-day sliding timeline with weekend accents (Fri/Sat/Sun in ice-blue), active date glowing rings, pulsing live dot on Today, and an instant `⚡ Today` return button when browsing ahead or behind.
   - **De-Cluttered App Bar:** Clean `••• Tools` overflow menu for secondary controls (`Recurring Rules`, `Add to Phone`, `Crew PIN`, `Reset Cache`).
   - **Corridor Zone Filter Bar** (`All 79 Spots`, `North Wildwood`, `Wildwood`, `Wildwood Crest & Two Mile`, `Cape May & Harbor`, `North Cape May & Off-Island`), **79-Venue Directory Modal** with direct phone/website links and 1-click flyer drop.
   - **Collapsible Quick Tags Bar:** Shows top 8 popular tags by default with an active filter counter badge, expandable `All Tags (20)` toggle, and 1-tap `Clear Filters` button (`🍊 Crushes`, `🍺 Draft Deals`, `🍗 Wings`, `🦪 Raw Bar`, `🎸 Full Band`, `🎶 Acoustic`, `🎟️ No Cover`, `🌅 Deck/Patio`, `🍾 BYOB Dining`).
   - **Thematic Visual Hierarchy:** Category-specific ambient borders and cards (Indigo for Live Music & DJs, Purple for Trivia, Warm Amber for Specials/Happy Hour, and Glowing Emerald Ring for Active Now), with high-contrast emerald and amber price highlighting (`$0.99`, `$5`, `Free`).

2. **Trusted Crew Mode & Split-Screen Vision AI Reviewer**
   - Unlocked with the shared Friends & Family Crew PIN (default: `1922`).
   - Upload or `Ctrl+V` paste any Facebook/Instagram venue flyer screenshot.
   - **Gemini 3.5 Flash Vision** extracts structured events, resolves relative dates (`"This Friday"`), infers open-ended closing times (`"8:30pm-Close"`), and flags ambiguous fields in **amber** for 1-click verification.
   - **Transparent Status Badging:** Clear `✨ Vision AI` vs `⚠️ Manual Mode` badges and notice banners.
   - **Fuzzy Diff Engine** matches extracted items by `(venue_id, occurrence_date, category)` to cleanly upsert band changes (`🔄 UPDATE (Diff)`) instead of creating duplicates.

3. **Hybrid Temporal Database & 3-Tier Seasonal Engine (`Supabase PostgreSQL`)**
   - `venues`: Canonical **79-venue corridor roster** across 5 geographic zones audited with 3-tier seasonal status (`22 Open Year-Round`, `8 Weekends/Limited`, `27 Closed for the Season`).
   - `recurring_rules`: **52 web-verified schedules** (including 7-day nightly specials at Dogtooth, Anchor Bar & Grill at Island Bowl, and weekend live entertainment lineups; paused summer templates preserved for Spring reopening).
   - `calendar_occurrences`: Materialized 30-day event rows (**513 active verified occurrences**, zero ghost occurrences for seasonally closed spots like Mad Viking, North End, or Curran's) generated via the `materialize_recurring_rules` Postgres RPC function, preserving single-date exceptions (`is_exception = true`).
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
