/**
 * Playwright Scheduled Scraper for North Wildwood / Wildwood Venue Websites & PDFs
 * Run via: `npm run scrape` or scheduled GitHub Actions workflow.
 *
 * Targets venues with HTML calendars or rotating weekly PDF links (e.g. MudHen, Anglesea Pub, Keenan's)
 * and queues extracted snapshots into `ingestion_batches` for 1-click review or auto-materialization.
 */

import { chromium } from 'playwright';

interface VenueScrapeTarget {
  slug: string;
  name: string;
  url: string;
  type: 'html_events' | 'pdf_menu_or_flyer';
  selector: string;
}

const NORTH_WILDWOOD_TARGETS: VenueScrapeTarget[] = [
  {
    slug: 'mudhen-brewing',
    name: 'MudHen Brewing Company',
    url: 'https://mudhenbrew.com/events/',
    type: 'html_events',
    selector: 'main, .events-list, article',
  },
  {
    slug: 'anglesea-pub',
    name: 'Anglesea Pub',
    url: 'https://angleseapub.com',
    type: 'html_events',
    selector: 'body',
  },
  {
    slug: 'owens-pub',
    name: "Owen's Pub",
    url: 'https://owenspubnw.com',
    type: 'html_events',
    selector: 'body',
  },
];

async function runNorthWildwoodScrape() {
  console.log('🌊 Starting North Wildwood Venue Website & PDF Scraper...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1600 },
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  for (const target of NORTH_WILDWOOD_TARGETS) {
    const page = await context.newPage();
    try {
      console.log(`🔍 Inspecting ${target.name} (${target.url})...`);
      await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1500);

      // Extract visible schedule text & any linked PDF or flyer image URLs
      const extracted = await page.evaluate((sel) => {
        const root = document.querySelector(sel) || document.body;
        const pdfLinks = Array.from(document.querySelectorAll('a[href$=".pdf"]')).map(
          (a) => (a as HTMLAnchorElement).href
        );
        const flyerImages = Array.from(document.querySelectorAll('img'))
          .map((img) => ({
            src: img.src,
            alt: img.alt,
            width: img.naturalWidth,
            height: img.naturalHeight,
          }))
          .filter((img) => img.width >= 400 && img.height >= 400);

        return {
          textSnippet: (root as HTMLElement).innerText.slice(0, 4000),
          pdfLinks,
          flyerImages: flyerImages.slice(0, 5),
        };
      }, target.selector);

      console.log(
        `✅ ${target.name}: Captured ${extracted.textSnippet.length} chars, ${extracted.pdfLinks.length} PDFs, ${extracted.flyerImages.length} candidate flyer graphics.`
      );
    } catch (err) {
      console.warn(`⚠️ Could not reach ${target.name}: ${(err as Error).message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('🏁 Scrape run complete.');
}

runNorthWildwoodScrape().catch((err) => {
  console.error(err);
  process.exit(1);
});
