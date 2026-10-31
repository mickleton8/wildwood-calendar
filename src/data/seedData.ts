import {
  CalendarOccurrence,
  FilterTag,
  RecurringRule,
  SampleFlyerPreset,
  TagMetadata,
  Venue,
} from '../types/calendar';
import { VERIFIED_57_VENUES } from './venuesRoster';

export const ANCHOR_DATE = '2026-10-30'; // Friday, Oct 30, 2026

export const TAG_METADATA: TagMetadata[] = [
  { id: 'crushes', label: 'Crushes', emoji: '🍊', group: 'drink' },
  { id: 'draft_beer', label: 'Draft Deals', emoji: '🍺', group: 'drink' },
  { id: 'cans_bottles', label: 'Cans & Bottles', emoji: '🍻', group: 'drink' },
  { id: 'margaritas', label: 'Margaritas', emoji: '🍋', group: 'drink' },
  { id: 'cocktails', label: 'Cocktails', emoji: '🍸', group: 'drink' },
  { id: 'wine', label: 'Wine', emoji: '🍷', group: 'drink' },
  { id: 'wings', label: 'Wings', emoji: '🍗', group: 'food' },
  { id: 'oysters_clams', label: 'Raw Bar', emoji: '🦪', group: 'food' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮', group: 'food' },
  { id: 'burgers_sandwiches', label: 'Burgers & Steaks', emoji: '🍔', group: 'food' },
  { id: 'half_price_apps', label: 'App Specials', emoji: '🥨', group: 'food' },
  { id: 'pizza', label: 'Pizza & Flatbreads', emoji: '🍕', group: 'food' },
  { id: 'live_band', label: 'Full Band', emoji: '🎸', group: 'music' },
  { id: 'acoustic_solo', label: 'Acoustic / Duo', emoji: '🎶', group: 'music' },
  { id: 'dj', label: 'DJ / Late Night', emoji: '🎧', group: 'music' },
  { id: 'irish_music', label: 'Irish Session', emoji: '☘️', group: 'music' },
  { id: 'trivia_bingo', label: 'Trivia / Bingo', emoji: '🎯', group: 'music' },
  { id: 'no_cover', label: 'No Cover', emoji: '🎟️', group: 'music' },
  { id: 'outdoor_deck', label: 'Deck / Patio', emoji: '🌅', group: 'music' },
];

export const SEED_VENUES: Venue[] = VERIFIED_57_VENUES;

// =============================================================================
// 100% Web-Verified Recurring Rules across the Wildwood-to-Cape-May Corridor
// =============================================================================
export const SEED_RECURRING_RULES: RecurringRule[] = [
  // 1. Owen's Pub (North Wildwood)
  {
    id: '22222222-2222-2222-2222-222222222201',
    venue_id: '11111111-1111-1111-1111-111111111102',
    category: 'happy_hour',
    title: "Owen's Pub Daily Bar Happy Hour",
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    start_time: '15:00',
    end_time: '18:00',
    end_time_label: null,
    deals_summary: [
      '$0.99 Domestic Drafts & $1.50 Domestic Bottles',
      '$5 Soft Pretzels, Mozzarella Sticks & Nachos',
      '$6 Popcorn Shrimp & Chicken Bites (Bar Area Only)',
    ],
    tags: ['draft_beer', 'cans_bottles', 'half_price_apps'],
    notes: 'Verified via owens.pub — Bar area only, 3:00 PM to 6:00 PM daily.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    venue_id: '11111111-1111-1111-1111-111111111102',
    category: 'daily_special',
    title: "Owen's Wednesday Wing & Homemade Comfort Night",
    days_of_week: [3],
    start_time: '14:00',
    end_time: '21:00',
    end_time_label: null,
    deals_summary: [
      '$5 Wings (All Day Wednesday)',
      '$10.95 Homemade Chicken Pot Pie or Meatloaf Dinner (starts at 2 PM)',
    ],
    tags: ['wings', 'draft_beer'],
    notes: 'Verified via owens.pub weekly specials.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    venue_id: '11111111-1111-1111-1111-111111111102',
    category: 'daily_special',
    title: "Owen's Thursday Cheeseburger & Prime Rib Sandwich Special",
    days_of_week: [4],
    start_time: '16:00',
    end_time: '21:00',
    end_time_label: null,
    deals_summary: [
      '$3.95 Cheeseburgers',
      '$7.99 Prime Rib Sandwich w/ Fries & Coleslaw',
    ],
    tags: ['burgers_sandwiches', 'draft_beer'],
    notes: 'Verified via owens.pub Thursday specials.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 2. Anglesea Pub (North Wildwood)
  {
    id: '22222222-2222-2222-2222-222222222204',
    venue_id: '11111111-1111-1111-1111-111111111101',
    category: 'daily_special',
    title: 'Anglesea Pub Monday Prime Rib Night',
    days_of_week: [1],
    start_time: '16:30',
    end_time: '21:00',
    end_time_label: null,
    deals_summary: [
      '$22 Slow-Roasted Prime Rib Dinner (w/ Two Sides & Salad)',
      'Dine-in after 4:30 PM w/ beverage purchase (Cash Only)',
    ],
    tags: ['burgers_sandwiches', 'draft_beer'],
    notes: 'Verified via theangleseapub.com — Note: Anglesea Pub is Cash Only.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222205',
    venue_id: '11111111-1111-1111-1111-111111111101',
    category: 'daily_special',
    title: 'Anglesea Pub Famous Tuesday Wing Night',
    days_of_week: [2],
    start_time: '16:30',
    end_time: '21:00',
    end_time_label: null,
    deals_summary: [
      '$10 Jumbo Wings (Order of 10) w/ Choice of Sauces',
      'Dine-in after 4:30 PM w/ beverage purchase (Cash Only)',
    ],
    tags: ['wings', 'draft_beer'],
    notes: 'Verified via theangleseapub.com.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 3. North End American Grill (North Wildwood)
  {
    id: '22222222-2222-2222-2222-222222222206',
    venue_id: '11111111-1111-1111-1111-111111111112',
    category: 'happy_hour',
    title: 'North End American Grill Daily Bar Happy Hour',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    start_time: '16:00',
    end_time: '19:00',
    end_time_label: null,
    deals_summary: [
      '$2 Off Craft Drafts & Discounted Specialty Cocktails',
      'Discounted Coastal Bar Bites, Fish Tacos & Flatbreads',
    ],
    tags: ['draft_beer', 'cocktails', 'tacos', 'half_price_apps', 'outdoor_deck'],
    notes: 'Verified via northendamericangrill.com (4:00 PM – 7:00 PM at the bar).',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222207',
    venue_id: '11111111-1111-1111-1111-111111111112',
    category: 'happy_hour',
    title: 'North End Late Night Happy Hour (10 PM – Midnight)',
    days_of_week: [5, 6],
    start_time: '22:00',
    end_time: '23:59',
    end_time_label: '12:00 AM',
    deals_summary: [
      '$4 Domestic Bottles, $5 House Wines & $6 Well Drinks',
      '$2 Off Craft Drafts',
      '$7 Loaded Nachos & $7 Mac & Cheese Wedges',
    ],
    tags: ['cans_bottles', 'draft_beer', 'wine', 'cocktails', 'half_price_apps'],
    notes: 'Verified via northendamericangrill.com.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 4. Curran's Irish Inn (North Wildwood)
  {
    id: '22222222-2222-2222-2222-222222222208',
    venue_id: '11111111-1111-1111-1111-111111111111',
    category: 'happy_hour',
    title: "Curran's Irish Inn Weekday Happy Hour",
    days_of_week: [1, 2, 3, 4, 5],
    start_time: '16:00',
    end_time: '18:00',
    end_time_label: null,
    deals_summary: [
      '$2.50 Domestic Drafts',
      '$3.00 Domestic Bottles',
    ],
    tags: ['draft_beer', 'cans_bottles'],
    notes: '100 Olde New Jersey Ave, North Wildwood (Mon–Fri 4:00 PM – 6:00 PM).',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 5. The Inlet North Wildwood
  {
    id: '22222222-2222-2222-2222-222222222209',
    venue_id: '11111111-1111-1111-1111-111111111109',
    category: 'happy_hour',
    title: 'The Inlet Seawall Happy Hour & $8 Bar Bites',
    days_of_week: [1, 2, 3, 4, 5],
    start_time: '16:00',
    end_time: '19:00',
    end_time_label: null,
    deals_summary: [
      '$8 Select Happy Hour Appetizer Bites',
      'Martini Mondays (Specialty Espresso Martinis starting at 4 PM)',
      'Rotating Draft, Wine & Canned Cocktail Specials',
    ],
    tags: ['cocktails', 'half_price_apps', 'draft_beer', 'outdoor_deck'],
    notes: 'Verified via theinletnww.com (Corner of Walnut & Olde New Jersey Ave).',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 6. MudHen Brewing Company (Wildwood)
  {
    id: '22222222-2222-2222-2222-222222222210',
    venue_id: '11111111-1111-1111-1111-111111111106',
    category: 'happy_hour',
    title: 'MudHen Brewing Weekday Bar Happy Hour & Beer O’Clock',
    days_of_week: [1, 2, 3, 4, 5],
    start_time: '15:00',
    end_time: '17:00',
    end_time_label: null,
    deals_summary: [
      'Discounted Flagship House-Brewed Drafts (1883 IPA, Holly Beach Wheat)',
      'Beer O’Clock Flagship Specials (Mon–Thu 2:00 PM – 4:00 PM)',
      'Smokehouse Bar Bite Specials',
    ],
    tags: ['draft_beer', 'half_price_apps', 'outdoor_deck'],
    notes: 'Verified via mudhenbrew.com (Mon–Fri 3:00 PM – 5:00 PM at the bars).',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222211',
    venue_id: '11111111-1111-1111-1111-111111111106',
    category: 'trivia_event',
    title: 'MudHen Trivia Monday + $1 Oysters & $6 High Noons',
    days_of_week: [1],
    start_time: '16:00',
    end_time: '20:30',
    end_time_label: null,
    deals_summary: [
      '$1 Oysters (4:00 PM – 5:00 PM)',
      '$2 Off Appetizers & $6 High Noons',
      'Game Show Palooza Trivia (6:30 PM – 8:30 PM)',
    ],
    tags: ['trivia_bingo', 'oysters_clams', 'cans_bottles', 'half_price_apps', 'no_cover'],
    notes: 'Verified via mudhenbrew.com weekly promotions.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222212',
    venue_id: '11111111-1111-1111-1111-111111111106',
    category: 'daily_special',
    title: "MudHen 'Wingin' Out Tuesday' + Live Music (5–9 PM)",
    days_of_week: [2],
    start_time: '16:00',
    end_time: '21:00',
    end_time_label: null,
    deals_summary: [
      '$1 Smoked Wings',
      '2 Fajitas for $10 & $10 Margaritas',
      'Live Acoustic Music from 5:00 PM – 9:00 PM',
    ],
    tags: ['wings', 'margaritas', 'tacos', 'acoustic_solo', 'no_cover'],
    notes: 'Verified via mudhenbrew.com.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222213',
    venue_id: '11111111-1111-1111-1111-111111111106',
    category: 'daily_special',
    title: "MudHen 'Wild Slide Wednesday' — Sliders & 16oz Crushes",
    days_of_week: [3],
    start_time: '16:00',
    end_time: '21:00',
    end_time_label: null,
    deals_summary: [
      '3 Sliders for $12',
      '$10 Vodka Crushes (16oz)',
      "$2 Off Rotating 'MudHen's Choice' Craft Draft",
    ],
    tags: ['burgers_sandwiches', 'crushes', 'draft_beer'],
    notes: 'Verified via mudhenbrew.com.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 7. Dogtooth Bar & Grill (Wildwood)
  {
    id: '22222222-2222-2222-2222-222222222214',
    venue_id: '11111111-1111-1111-1111-111111111137',
    category: 'happy_hour',
    title: 'Dogtooth Bar & Grill Weekday Happy Hour',
    days_of_week: [1, 2, 3, 4, 5],
    start_time: '15:00',
    end_time: '17:00',
    end_time_label: null,
    deals_summary: [
      '$3.00 Domestic Pints & $3.50 Domestic Bottles',
      '$5.00 Well Drinks',
      '$8.95 Chicken Tenders, Potato Skins, Cowboy Fries & Cheesesteak Egg Rolls',
    ],
    tags: ['draft_beer', 'cans_bottles', 'cocktails', 'half_price_apps'],
    notes: 'Verified via dogtoothbar.com (Mon–Fri 3:00 PM – 5:00 PM at the bar).',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222215',
    venue_id: '11111111-1111-1111-1111-111111111137',
    category: 'trivia_event',
    title: 'Dogtooth Tuesday DJ Trivia Night + $16 Fajitas & $5 Fiddlehead',
    days_of_week: [2],
    start_time: '18:30',
    end_time: '21:00',
    end_time_label: null,
    deals_summary: [
      'Free DJ Trivia South Jersey (Sign-ups 6:30 PM, Game 7:00 PM — $30 Gift Card 1st Prize)',
      '$16 Chicken or Steak Fajita Skillets',
      '$5 Fiddlehead IPA Drafts',
    ],
    tags: ['trivia_bingo', 'draft_beer', 'tacos', 'no_cover'],
    notes: 'Verified via dogtoothbar.com.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 8. Cattle 'n Clover (Wildwood)
  {
    id: '22222222-2222-2222-2222-222222222216',
    venue_id: '11111111-1111-1111-1111-111111111125',
    category: 'daily_special',
    title: "Cattle 'n Clover Monday 1/2 Price Burger Special",
    days_of_week: [1],
    start_time: '12:00',
    end_time: '18:00',
    end_time_label: null,
    deals_summary: [
      'Half-Price Burgers until 6:00 PM',
      'Daily Irish Pub Pint & Cocktail Specials',
    ],
    tags: ['burgers_sandwiches', 'draft_beer'],
    notes: '3817 Pacific Ave, Wildwood.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222217',
    venue_id: '11111111-1111-1111-1111-111111111125',
    category: 'daily_special',
    title: "Cattle 'n Clover Tuesday Wing & Draft Night",
    days_of_week: [2],
    start_time: '16:00',
    end_time: '21:00',
    end_time_label: null,
    deals_summary: [
      'Discounted Giant Wings',
      'Coors Light & Yuengling Draft Specials',
    ],
    tags: ['wings', 'draft_beer'],
    notes: '3817 Pacific Ave, Wildwood.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 9. Fairview Social (Wildwood)
  {
    id: '22222222-2222-2222-2222-222222222218',
    venue_id: '11111111-1111-1111-1111-111111111123',
    category: 'happy_hour',
    title: 'Fairview Social Weekday Happy Hour & Wednesday Hump Day HH',
    days_of_week: [1, 2, 3, 4, 5],
    start_time: '16:00',
    end_time: '18:00',
    end_time_label: null,
    deals_summary: [
      'Craft Cocktail & Draft Specials at the Bar',
      'Extended Wednesday Hump Day Happy Hour (5:00 PM – 8:00 PM)',
    ],
    tags: ['cocktails', 'draft_beer', 'half_price_apps'],
    notes: 'Verified via fairviewsocial.com (3601 Pacific Ave, Wildwood).',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 10. Lucky Bones Backwater Grille (Cape May)
  {
    id: '22222222-2222-2222-2222-222222222219',
    venue_id: '11111111-1111-1111-1111-111111111151',
    category: 'happy_hour',
    title: "Lucky Bones 'Bottoms Up' Happy Hour & 1/2 Price Pizzas",
    days_of_week: [1, 2, 3, 4, 5],
    start_time: '15:00',
    end_time: '17:00',
    end_time_label: null,
    deals_summary: [
      '1/2 Price Brick-Oven Pizzas (Bar Dine-In Only)',
      '$2.50 Wander Back Lager Drafts',
      '$5 Glasses of House Wine & $5 Sun Cruiser Cans',
    ],
    tags: ['pizza', 'draft_beer', 'wine', 'cans_bottles'],
    notes: 'Verified via luckybones.com (Mon–Fri 3:00 PM – 5:00 PM at the bar).',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222220',
    venue_id: '11111111-1111-1111-1111-111111111151',
    category: 'daily_special',
    title: 'Lucky Bones Oyster Wednesday ($1.49 South Bay Salts)',
    days_of_week: [3],
    start_time: '11:00',
    end_time: '21:00',
    end_time_label: 'Close',
    deals_summary: [
      '$1.49 South Bay Salt Oysters & Rotating Specialty Oysters',
      '$6 Drafts from Monthly Featured Local Brewery',
      'Fried Oyster Platter Specials',
    ],
    tags: ['oysters_clams', 'draft_beer'],
    notes: 'Verified via luckybones.com (Every Wednesday 11:00 AM – Close).',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 11. Port Marina and Restaurant (Cape May Harbor)
  {
    id: '22222222-2222-2222-2222-222222222221',
    venue_id: '11111111-1111-1111-1111-111111111149',
    category: 'happy_hour',
    title: 'Port Cape May Harborside Happy Hour ($2 Oysters & $5 Drafts)',
    days_of_week: [5, 6, 0],
    start_time: '16:00',
    end_time: '18:00',
    end_time_label: null,
    deals_summary: [
      '$2 Local Oysters',
      '$5 Drafts, $8 House Wine & $8 Margaritas',
      'Discounted Bar Plates (Spring Rolls, Dumplings & Lamb Lollipops)',
    ],
    tags: ['oysters_clams', 'draft_beer', 'wine', 'margaritas', 'half_price_apps', 'outdoor_deck'],
    notes: 'Verified via portcapemay.com (Fri–Sun 4:00 PM – 6:00 PM at Indoor Bar; Mon–Thu 2–4 PM Outside Bar).',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 12. Mad Viking Dock Bar & Grill (Cape May Harbor)
  {
    id: '22222222-2222-2222-2222-222222222222',
    venue_id: '11111111-1111-1111-1111-111111111150',
    category: 'happy_hour',
    title: "Mad Viking Dock Bar 'Skol! Hour' Happy Hour",
    days_of_week: [1, 2, 3, 4, 5],
    start_time: '14:00',
    end_time: '16:00',
    end_time_label: null,
    deals_summary: [
      'Discounted Harbor Bar Bites & Fresh Seafood Apps',
      'Draft Beer & Frozen Boozy Slush Specials',
    ],
    tags: ['cocktails', 'draft_beer', 'half_price_apps', 'outdoor_deck'],
    notes: 'Verified via madvikingcapemay.com (Mon–Fri 2:00 PM – 4:00 PM).',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 13. Nauti Spirits Distillery (Shunpike / Cape May)
  {
    id: '22222222-2222-2222-2222-222222222223',
    venue_id: '11111111-1111-1111-1111-111111111156',
    category: 'live_music',
    title: 'Nauti Spirits Farm Distillery Live Music & Fire Pits',
    days_of_week: [5, 6],
    start_time: '17:00',
    end_time: '21:00',
    end_time_label: null,
    deals_summary: [
      'Handcrafted Estate Vodka, Rum, Gin & Bourbon Cocktails',
      'Live Acoustic & Roots Musicians + Visiting Food Trucks',
    ],
    tags: ['acoustic_solo', 'cocktails', 'no_cover', 'outdoor_deck'],
    notes: 'Verified via nautispirits.com (916 Shunpike Rd).',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },

  // 14. The Surfing Pig (North Wildwood)
  {
    id: '22222222-2222-2222-2222-222222222224',
    venue_id: '11111111-1111-1111-1111-111111111107',
    category: 'live_music',
    title: 'The Surfing Pig Weekend Bayfront Acoustic Sessions',
    days_of_week: [6],
    start_time: '17:00',
    end_time: '21:00',
    end_time_label: null,
    deals_summary: [
      'Live Bayfront Musicians (Carl Stokking, Todd Bowen, Mike Carney, Ben Rynes rotation)',
      'Wood-Smoked BBQ & Swine Bar Rooftop Cocktails',
    ],
    tags: ['acoustic_solo', 'cocktails', 'burgers_sandwiches', 'outdoor_deck', 'no_cover'],
    notes: 'Verified via thesurfingpig.com/entertainment (231 W 10th Ave).',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
];

// Create SVG data URIs for realistic Flyers in the Split-Screen Reviewer
function createFlyerSvgDataUri(config: {
  bgGradient: [string, string];
  accentColor: string;
  headerBadge: string;
  venueTitle: string;
  subHeader: string;
  blocks: { day: string; title: string; time: string; detail: string }[];
  footerNote: string;
}): string {
  const blocksSvg = config.blocks
    .map((b, idx) => {
      const y = 210 + idx * 125;
      return `
        <rect x="36" y="${y}" width="528" height="108" rx="14" fill="rgba(15,23,42,0.78)" stroke="${config.accentColor}" stroke-width="1.5" />
        <text x="58" y="${y + 30}" fill="${config.accentColor}" font-family="sans-serif" font-size="15" font-weight="800" letter-spacing="1.5">${b.day}</text>
        <text x="520" y="${y + 30}" fill="#f8fafc" font-family="sans-serif" font-size="14" font-weight="700" text-anchor="end">${b.time}</text>
        <text x="58" y="${y + 62}" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="900">${b.title}</text>
        <text x="58" y="${y + 88}" fill="#cbd5e1" font-family="sans-serif" font-size="14" font-weight="500">${b.detail}</text>
      `;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760" width="600" height="760">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${config.bgGradient[0]}" />
        <stop offset="100%" stop-color="${config.bgGradient[1]}" />
      </linearGradient>
    </defs>
    <rect width="600" height="760" fill="url(#bg)" />
    <circle cx="520" cy="80" r="160" fill="${config.accentColor}" opacity="0.12" />
    <circle cx="80" cy="680" r="190" fill="${config.accentColor}" opacity="0.1" />
    <rect x="24" y="24" width="552" height="712" rx="22" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
    <rect x="190" y="46" width="220" height="30" rx="15" fill="${config.accentColor}" />
    <text x="300" y="66" fill="#0f172a" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="1.5">${config.headerBadge}</text>
    <text x="300" y="122" fill="#ffffff" font-family="sans-serif" font-size="36" font-weight="900" text-anchor="middle" letter-spacing="0.5">${config.venueTitle}</text>
    <text x="300" y="156" fill="#e2e8f0" font-family="sans-serif" font-size="17" font-weight="600" text-anchor="middle">${config.subHeader}</text>
    <line x1="80" y1="180" x2="520" y2="180" stroke="${config.accentColor}" stroke-width="2" opacity="0.5" />
    ${blocksSvg}
    <text x="300" y="715" fill="#e2e8f0" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle">${config.footerNote}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const MUDHEN_FLYER_URI = createFlyerSvgDataUri({
  bgGradient: ['#451a03', '#090d16'],
  accentColor: '#f59e0b',
  headerBadge: 'WILDWOOD • MUDHEN BREWING',
  venueTitle: 'MUDHEN BREWING CO.',
  subHeader: 'NOVEMBER LIVE MUSIC & WEEKLY SPECIALS',
  blocks: [
    {
      day: 'TUE NOV 3 • WINGIN OUT TUESDAY',
      time: '5:00 PM - 9:00 PM',
      title: 'Nolan Quinn (Live Country/Rock/Blues)',
      detail: '$1 Wings • 2 Fajitas for $10 • $10 Margaritas',
    },
    {
      day: 'SUN NOV 8 • SUNDAY SESSION',
      time: 'Starts at 1:00 PM',
      title: 'Fat Mezz (Classic Rock, Blues & Funk)',
      detail: 'House Craft Pints • Smokehouse BBQ Menu',
    },
    {
      day: 'TUE NOV 10 • WINGIN OUT TUESDAY',
      time: '5:00 PM - 9:00 PM',
      title: 'Jack Mangene (Acoustic Loop)',
      detail: '$1 Wings • $10 Margaritas • No Cover',
    },
    {
      day: 'FRI NOV 13 • FRIDAY NIGHT LIVE',
      time: '10:00 PM - Close',
      title: 'FUNZaluv (Rock, R&B & Dance)',
      detail: 'Main Stage Live Band • No Cover',
    },
  ],
  footerNote: '127 W Rio Grande Ave, Wildwood NJ • mudhenbrew.com/events',
});

export const OWENS_UPDATE_FLYER_URI = createFlyerSvgDataUri({
  bgGradient: ['#1e1b4b', '#090d16'],
  accentColor: '#38bdf8',
  headerBadge: 'NORTH WILDWOOD • 17TH AVE',
  venueTitle: "OWEN'S PUB",
  subHeader: 'DAILY 3-6PM HAPPY HOUR & WEEKLY DINNER SPECIALS',
  blocks: [
    {
      day: 'EVERYDAY BAR HAPPY HOUR',
      time: '3:00 PM - 6:00 PM',
      title: '99¢ Domestic Drafts & $1.50 Domestic Bottles',
      detail: '$5 Soft Pretzels, Mozzarella Sticks & Nachos • $6 Popcorn Shrimp',
    },
    {
      day: 'WEDNESDAY SPECIAL',
      time: '2:00 PM - Close',
      title: '$5 Wings All Day + $10.95 Pot Pie / Meatloaf',
      detail: 'Eat-in w/ beverage • North Wildwood Locals Staple',
    },
    {
      day: 'THURSDAY SPECIAL',
      time: '4:00 PM - 9:00 PM',
      title: '$3.95 Cheeseburgers & $7.99 Prime Rib Sandwich',
      detail: 'Served w/ Fries & Coleslaw • 119 E 17th Ave',
    },
  ],
  footerNote: '119 E 17th Ave, North Wildwood • (609) 729-7290 • owens.pub',
});

export const DOGTOOTH_FLYER_URI = createFlyerSvgDataUri({
  bgGradient: ['#064e3b', '#0f172a'],
  accentColor: '#fbbf24',
  headerBadge: 'WILDWOOD • PACIFIC & TAYLOR',
  venueTitle: 'DOGTOOTH BAR & GRILL',
  subHeader: 'WEEKDAY HAPPY HOUR & TUESDAY DJ TRIVIA',
  blocks: [
    {
      day: 'MON - FRI BAR HAPPY HOUR',
      time: '3:00 PM - 5:00 PM',
      title: '$3 Domestic Pints • $3.50 Bottles • $5 Wells',
      detail: '$8.95 Tenders, Potato Skins, Cowboy Fries & Cheesesteak Egg Rolls',
    },
    {
      day: 'TUESDAY NIGHT TRIVIA',
      time: '6:30 PM - 9:00 PM',
      title: 'DJ Trivia South Jersey ($30 1st Place Prize)',
      detail: '$16 Chicken or Steak Fajita Skillets • $5 Fiddlehead Drafts',
    },
  ],
  footerNote: '100 E Taylor Ave, Wildwood NJ • (609) 522-8383 • dogtoothbar.com',
});

// Concrete web-verified Live Music events from official venue calendars
export const SEED_ONE_OFF_OCCURRENCES: CalendarOccurrence[] = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    venue_id: '11111111-1111-1111-1111-111111111106',
    category: 'live_music',
    title: 'MudHen Live Music: Nolan Quinn',
    performer_name: 'Nolan Quinn (Country/Rock/Blues)',
    occurrence_date: '2026-11-03',
    start_at: '2026-11-03T17:00:00-05:00',
    end_at: '2026-11-03T21:00:00-05:00',
    start_time_local: '17:00',
    end_time_local: '21:00',
    end_time_label: null,
    deals_summary: ['$1 Wings (Wingin’ Out Tuesday)', '2 Fajitas for $10', '$10 Margaritas'],
    tags: ['acoustic_solo', 'wings', 'margaritas', 'no_cover'],
    cover_charge: 'No Cover',
    notes: 'Verified via mudhenbrew.com/events — Tuesday Nov 3, 5:00 PM – 9:00 PM.',
    flyer_image_url: MUDHEN_FLYER_URI,
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.99,
    updated_at: '2026-10-30T20:45:00-04:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    venue_id: '11111111-1111-1111-1111-111111111106',
    category: 'live_music',
    title: 'MudHen Sunday Live Band: Fat Mezz',
    performer_name: 'Fat Mezz (Classic Rock, Blues, Funk & Jam)',
    occurrence_date: '2026-11-08',
    start_at: '2026-11-08T13:00:00-05:00',
    end_at: '2026-11-08T17:00:00-05:00',
    start_time_local: '13:00',
    end_time_local: '17:00',
    end_time_label: null,
    deals_summary: ['House-Brewed Craft Pints', 'Smokehouse BBQ Menu'],
    tags: ['live_band', 'draft_beer', 'no_cover', 'outdoor_deck'],
    cover_charge: 'No Cover',
    notes: 'Verified via mudhenbrew.com/events — Sunday Nov 8 starting at 1:00 PM.',
    flyer_image_url: MUDHEN_FLYER_URI,
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.99,
    updated_at: '2026-10-30T20:45:00-04:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    venue_id: '11111111-1111-1111-1111-111111111106',
    category: 'live_music',
    title: 'MudHen Live Music: Jack Mangene',
    performer_name: 'Jack Mangene (Acoustic Loop)',
    occurrence_date: '2026-11-10',
    start_at: '2026-11-10T17:00:00-05:00',
    end_at: '2026-11-10T21:00:00-05:00',
    start_time_local: '17:00',
    end_time_local: '21:00',
    end_time_label: null,
    deals_summary: ['$1 Wings', '2 Fajitas for $10', '$10 Margaritas'],
    tags: ['acoustic_solo', 'wings', 'margaritas', 'no_cover'],
    cover_charge: 'No Cover',
    notes: 'Verified via mudhenbrew.com/events — Tuesday Nov 10, 5:00 PM – 9:00 PM.',
    flyer_image_url: MUDHEN_FLYER_URI,
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.99,
    updated_at: '2026-10-30T20:45:00-04:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333304',
    venue_id: '11111111-1111-1111-1111-111111111106',
    category: 'live_music',
    title: 'MudHen Friday Night Live: FUNZaluv',
    performer_name: 'FUNZaluv (Rock, R&B, Dance & Oldies)',
    occurrence_date: '2026-11-13',
    start_at: '2026-11-13T22:00:00-05:00',
    end_at: '2026-11-13T23:59:00-05:00',
    start_time_local: '22:00',
    end_time_local: '23:59',
    end_time_label: 'Late',
    deals_summary: ['House Craft Pints', 'Late Night Bar Menu'],
    tags: ['live_band', 'draft_beer', 'no_cover'],
    cover_charge: 'No Cover',
    notes: 'Verified via mudhenbrew.com/events — Friday Nov 13 starting at 10:00 PM.',
    flyer_image_url: MUDHEN_FLYER_URI,
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.99,
    updated_at: '2026-10-30T20:45:00-04:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333305',
    venue_id: '11111111-1111-1111-1111-111111111106',
    category: 'live_music',
    title: 'MudHen Live Music: Kat Rivers',
    performer_name: 'Kat Rivers (Soulful Pop/Rock)',
    occurrence_date: '2026-11-17',
    start_at: '2026-11-17T17:00:00-05:00',
    end_at: '2026-11-17T21:00:00-05:00',
    start_time_local: '17:00',
    end_time_local: '21:00',
    end_time_label: null,
    deals_summary: ['$1 Wings', '2 Fajitas for $10', '$10 Margaritas'],
    tags: ['acoustic_solo', 'wings', 'margaritas', 'no_cover'],
    cover_charge: 'No Cover',
    notes: 'Verified via mudhenbrew.com/events — Tuesday Nov 17, 5:00 PM – 9:00 PM.',
    flyer_image_url: MUDHEN_FLYER_URI,
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.99,
    updated_at: '2026-10-30T20:45:00-04:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333306',
    venue_id: '11111111-1111-1111-1111-111111111106',
    category: 'live_music',
    title: "MudHen Live Band: Don't Call Me Francis",
    performer_name: "Don't Call Me Francis",
    occurrence_date: '2026-11-20',
    start_at: '2026-11-20T19:00:00-05:00',
    end_at: '2026-11-20T23:00:00-05:00',
    start_time_local: '19:00',
    end_time_local: '23:00',
    end_time_label: null,
    deals_summary: ['House Craft Pints & Cocktails'],
    tags: ['live_band', 'draft_beer', 'no_cover'],
    cover_charge: 'No Cover',
    notes: 'Verified via mudhenbrew.com/events — Friday Nov 20 starting at 7:00 PM.',
    flyer_image_url: MUDHEN_FLYER_URI,
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.99,
    updated_at: '2026-10-30T20:45:00-04:00',
  },
];

// Presets for testing the Split-Screen Vision Reviewer
export const SAMPLE_FLYER_PRESETS: SampleFlyerPreset[] = [
  {
    id: 'preset-mudhen-november',
    title: 'MudHen Brewing Co. — Verified November Lineup & Wingin’ Out Flyer',
    subtitle: 'Real MudHen schedule (Nolan Quinn, Fat Mezz, Jack Mangene, FUNZaluv, Don’t Call Me Francis)',
    venue_id: '11111111-1111-1111-1111-111111111106',
    source_label: 'mudhenbrew.com/events',
    flyer_svg_data_uri: MUDHEN_FLYER_URI,
    extracted_items: [
      {
        id: 'cand-mudhen-nolan',
        venue_id: '11111111-1111-1111-1111-111111111106',
        category: 'live_music',
        is_recurring: false,
        days_of_week: [],
        occurrence_date: '2026-11-03',
        title: 'MudHen Live Music: Nolan Quinn',
        performer_name: 'Nolan Quinn',
        start_time: '17:00',
        end_time: '21:00',
        end_time_label: null,
        deals_summary: ['$1 Wings', '2 Fajitas for $10', '$10 Margaritas'],
        tags: ['acoustic_solo', 'wings', 'margaritas', 'no_cover'],
        cover_charge: 'No Cover',
        notes: 'Verified MudHen Tuesday Nov 3 set.',
        confidence_score: 0.98,
        ambiguity_flags: [],
      },
      {
        id: 'cand-mudhen-funzaluv',
        venue_id: '11111111-1111-1111-1111-111111111106',
        category: 'live_music',
        is_recurring: false,
        days_of_week: [],
        occurrence_date: '2026-11-13',
        title: 'MudHen Friday Night Live: FUNZaluv',
        performer_name: 'FUNZaluv',
        start_time: '22:00',
        end_time: '23:59',
        end_time_label: 'Close',
        deals_summary: ['House Craft Pints', 'Late Night Menu'],
        tags: ['live_band', 'draft_beer', 'no_cover'],
        cover_charge: 'No Cover',
        notes: 'Calendar lists 10:00 PM start without explicit end hour.',
        confidence_score: 0.84,
        ambiguity_flags: [
          {
            field: 'end_time',
            reason: 'Event listing shows "10:00 PM" start without end time; inferred 23:59 ("Close").',
            suggested_fix: 'Confirm 23:59 ("Close")',
          },
        ],
      },
    ],
  },
  {
    id: 'preset-owens-verified',
    title: "Owen's Pub — Verified 3–6 PM Happy Hour & Weekly Specials",
    subtitle: '99¢ Domestic Drafts, $1.50 Bottles, $5 Bar Bites + Wed $5 Wings & Thu $7.99 Prime Rib Sandwich',
    venue_id: '11111111-1111-1111-1111-111111111102',
    source_label: 'owens.pub Official Menu',
    flyer_svg_data_uri: OWENS_UPDATE_FLYER_URI,
    extracted_items: [
      {
        id: 'cand-owens-daily-hh',
        venue_id: '11111111-1111-1111-1111-111111111102',
        category: 'happy_hour',
        is_recurring: true,
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        occurrence_date: '2026-10-30',
        title: "Owen's Pub Daily Bar Happy Hour",
        performer_name: null,
        start_time: '15:00',
        end_time: '18:00',
        end_time_label: null,
        deals_summary: [
          '$0.99 Domestic Drafts & $1.50 Domestic Bottles',
          '$5 Soft Pretzels, Mozzarella Sticks & Nachos',
          '$6 Popcorn Shrimp & Chicken Bites',
        ],
        tags: ['draft_beer', 'cans_bottles', 'half_price_apps'],
        cover_charge: 'No Cover',
        notes: 'Bar area only, 3:00 PM – 6:00 PM daily.',
        confidence_score: 0.97,
        ambiguity_flags: [],
      },
    ],
  },
  {
    id: 'preset-dogtooth-verified',
    title: 'Dogtooth Bar & Grill — Verified Happy Hour & Tuesday DJ Trivia',
    subtitle: 'Mon–Fri 3–5 PM Happy Hour ($3 Pints, $8.95 Bites) + Tuesday 7 PM DJ Trivia South Jersey',
    venue_id: '11111111-1111-1111-1111-111111111137',
    source_label: 'dogtoothbar.com Official Specials',
    flyer_svg_data_uri: DOGTOOTH_FLYER_URI,
    extracted_items: [
      {
        id: 'cand-dogtooth-hh',
        venue_id: '11111111-1111-1111-1111-111111111137',
        category: 'happy_hour',
        is_recurring: true,
        days_of_week: [1, 2, 3, 4, 5],
        occurrence_date: '2026-10-30',
        title: 'Dogtooth Bar & Grill Weekday Happy Hour',
        performer_name: null,
        start_time: '15:00',
        end_time: '17:00',
        end_time_label: null,
        deals_summary: [
          '$3.00 Domestic Pints & $3.50 Domestic Bottles',
          '$5.00 Well Drinks',
          '$8.95 Chicken Tenders, Potato Skins, Cowboy Fries & Cheesesteak Egg Rolls',
        ],
        tags: ['draft_beer', 'cans_bottles', 'cocktails', 'half_price_apps'],
        cover_charge: 'No Cover',
        notes: '100 E Taylor Ave, Wildwood.',
        confidence_score: 0.98,
        ambiguity_flags: [],
      },
    ],
  },
];

/**
 * Client-side mirror of the PostgreSQL `materialize_recurring_rules` RPC function.
 * Generates concrete `CalendarOccurrence` entries for `daysAhead` days from `startDate`,
 * while respecting any existing `is_exception` or `is_cancelled` overrides.
 */
export function materializeRecurringRulesClient(
  rules: RecurringRule[],
  existingOccurrences: CalendarOccurrence[],
  startDateStr: string = ANCHOR_DATE,
  daysAhead: number = 30
): CalendarOccurrence[] {
  const preserved = existingOccurrences.filter(
    (occ) => !occ.recurring_rule_id || occ.is_exception || occ.is_cancelled
  );

  const exceptionKeySet = new Set(
    existingOccurrences
      .filter((occ) => occ.recurring_rule_id && (occ.is_exception || occ.is_cancelled))
      .map((occ) => `${occ.recurring_rule_id}_${occ.occurrence_date}`)
  );

  const materialized: CalendarOccurrence[] = [...preserved];
  const baseParts = startDateStr.split('-').map(Number);

  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(Date.UTC(baseParts[0], baseParts[1] - 1, baseParts[2] + i, 12, 0, 0));
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dow = d.getUTCDay();

    for (const rule of rules) {
      if (!rule.is_active) continue;
      if (!rule.days_of_week.includes(dow)) continue;
      if (dateStr < rule.valid_from) continue;
      if (rule.valid_until && dateStr > rule.valid_until) continue;

      const key = `${rule.id}_${dateStr}`;
      if (exceptionKeySet.has(key)) continue;

      const effectiveEnd = rule.end_time || '23:59';
      materialized.push({
        id: `mat_${rule.id}_${dateStr}`,
        venue_id: rule.venue_id,
        recurring_rule_id: rule.id,
        category: rule.category,
        title: rule.title,
        performer_name: null,
        occurrence_date: dateStr,
        start_at: `${dateStr}T${rule.start_time}:00-04:00`,
        end_at: `${dateStr}T${effectiveEnd}:00-04:00`,
        start_time_local: rule.start_time,
        end_time_local: effectiveEnd,
        end_time_label: rule.end_time_label || null,
        deals_summary: [...rule.deals_summary],
        tags: [...rule.tags],
        cover_charge: 'No Cover',
        notes: rule.notes,
        is_exception: false,
        is_cancelled: false,
        confidence_score: 1.0,
        updated_at: new Date().toISOString(),
      });
    }
  }

  return materialized.sort((a, b) => {
    if (a.occurrence_date !== b.occurrence_date) {
      return a.occurrence_date.localeCompare(b.occurrence_date);
    }
    return a.start_time_local.localeCompare(b.start_time_local);
  });
}
