import {
  CalendarOccurrence,
  FilterTag,
  RecurringRule,
  SampleFlyerPreset,
  TagMetadata,
  Venue,
} from '../types/calendar';

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
  { id: 'burgers_sandwiches', label: 'Burgers & Roast Beef', emoji: '🍔', group: 'food' },
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

export const SEED_VENUES: Venue[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    slug: 'anglesea-pub',
    name: 'Anglesea Pub',
    neighborhood: 'North Wildwood (Anglesea)',
    address: '116 W 1st Ave, North Wildwood, NJ',
    cross_street: '1st & Olde New Jersey Ave',
    lat: 39.0074,
    lng: -74.7942,
    website_url: 'https://angleseapub.com',
    facebook_url: 'https://facebook.com/angleseapub',
    instagram_handle: '@angleseapub',
    phone: '(609) 729-1133',
    is_year_round: true,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    slug: 'owens-pub',
    name: "Owen's Pub",
    neighborhood: 'North Wildwood',
    address: '119 E 17th Ave, North Wildwood, NJ',
    cross_street: '17th & New Jersey Ave',
    lat: 38.9968,
    lng: -74.7995,
    website_url: 'https://owenspubnw.com',
    facebook_url: 'https://facebook.com/owenspub',
    instagram_handle: '@owenspubnw',
    phone: '(609) 729-7290',
    is_year_round: true,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    slug: 'keenans-irish-pub',
    name: "Keenan's Irish Pub",
    neighborhood: 'Olde New Jersey Ave',
    address: '113 Olde New Jersey Ave, North Wildwood, NJ',
    cross_street: 'Walnut & Olde New Jersey Ave',
    lat: 39.0065,
    lng: -74.7931,
    website_url: 'https://keenansirishpub.com',
    facebook_url: 'https://facebook.com/keenansnw',
    instagram_handle: '@keenansnw',
    phone: '(609) 729-3344',
    is_year_round: false,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    slug: 'joe-joes-place',
    name: "Joe Joe's Place",
    neighborhood: 'North Wildwood',
    address: '2201 Delaware Ave, North Wildwood, NJ',
    cross_street: '22nd & Delaware Ave',
    lat: 38.9932,
    lng: -74.8055,
    facebook_url: 'https://facebook.com/joejoesplace',
    instagram_handle: '@joejoesplacenw',
    phone: '(609) 522-5646',
    is_year_round: true,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    slug: 'flip-flopz',
    name: 'Flip Flopz Beach Bar & Grill',
    neighborhood: 'Olde New Jersey Ave',
    address: '106 W Spruce Ave, North Wildwood, NJ',
    cross_street: 'Spruce & Olde New Jersey Ave',
    lat: 39.0059,
    lng: -74.7928,
    website_url: 'https://flipflopzbeachbar.com',
    facebook_url: 'https://facebook.com/flipflopz',
    instagram_handle: '@flipflopznw',
    phone: '(609) 522-3350',
    is_year_round: false,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    slug: 'mudhen-brewing',
    name: 'MudHen Brewing Company',
    neighborhood: 'Wildwood Border',
    address: '127 W Rio Grande Ave, Wildwood, NJ',
    cross_street: 'Rio Grande & New Jersey Ave',
    lat: 38.9835,
    lng: -74.8195,
    website_url: 'https://mudhenbrew.com',
    facebook_url: 'https://facebook.com/mudhenbrew',
    instagram_handle: '@mudhenbrew',
    phone: '(609) 846-7918',
    is_year_round: true,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111107',
    slug: 'tavern-on-the-bay',
    name: 'Tavern on the Bay',
    neighborhood: 'North Wildwood (Anglesea)',
    address: '800 N New York Ave, North Wildwood, NJ',
    cross_street: 'Hereford Inlet Bayfront',
    lat: 39.0108,
    lng: -74.7960,
    website_url: 'https://tavernonthebayresort.com',
    facebook_url: 'https://facebook.com/tavernonthebay',
    instagram_handle: '@tavernonthebaynj',
    phone: '(609) 522-6244',
    is_year_round: true,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111108',
    slug: 'old-city-pub',
    name: 'Old City Pub',
    neighborhood: 'Olde New Jersey Ave',
    address: '1408 New Jersey Ave, North Wildwood, NJ',
    cross_street: '14th & New Jersey Ave',
    lat: 38.9989,
    lng: -74.7982,
    website_url: 'https://oldcitypubnw.com',
    facebook_url: 'https://facebook.com/oldcitypub',
    instagram_handle: '@oldcitypubnw',
    phone: '(609) 854-3686',
    is_year_round: true,
    is_active: true,
  },
];

export const SEED_RECURRING_RULES: RecurringRule[] = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    venue_id: '11111111-1111-1111-1111-111111111101',
    category: 'happy_hour',
    title: 'Anglesea Pub Afternoon Happy Hour',
    days_of_week: [1, 2, 3, 4, 5],
    start_time: '15:00',
    end_time: '18:00',
    end_time_label: null,
    deals_summary: [
      '$3.50 Miller Lite & Yuengling Pints',
      '$7 Jameson Orange Crushes',
      '$8 Bavarian Pretzel & Beer Cheese',
      '$5 Guinness Imperial Pints (Fridays)',
    ],
    tags: ['draft_beer', 'crushes', 'half_price_apps'],
    notes: 'Bar & high-top seating only.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    venue_id: '11111111-1111-1111-1111-111111111102',
    category: 'happy_hour',
    title: "Owen's Locals Happy Hour & Wing Special",
    days_of_week: [1, 2, 3, 4, 5],
    start_time: '16:00',
    end_time: '19:00',
    end_time_label: null,
    deals_summary: [
      '$2.75 Domestic Drafts (Miller Lite, Coors Light, Yuengling)',
      '75¢ Jumbo Buffalo or Garlic Parm Wings (min 10, eat-in)',
      '$7 Hot Roast Beef & Provolone Sandwiches',
      '$6 House Mixed Drinks',
    ],
    tags: ['draft_beer', 'wings', 'burgers_sandwiches', 'cocktails'],
    notes: 'A North Wildwood locals institution.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    venue_id: '11111111-1111-1111-1111-111111111103',
    category: 'happy_hour',
    title: "Keenan's Friday & Saturday Crush Hour",
    days_of_week: [5, 6],
    start_time: '15:00',
    end_time: '19:00',
    end_time_label: null,
    deals_summary: [
      '$6 Fresh Squeezed Orange & Grapefruit Crushes',
      '$3.50 Miller Lite & Coors Light Bottles',
      '1/2 Price Irish Nachos & Pub Flatbreads',
    ],
    tags: ['crushes', 'cans_bottles', 'half_price_apps', 'pizza', 'outdoor_deck'],
    notes: 'Main bar & covered patio heaters on.',
    valid_from: '2026-09-15',
    valid_until: '2026-12-31',
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222204',
    venue_id: '11111111-1111-1111-1111-111111111104',
    category: 'daily_special',
    title: "Joe Joe's Buck-a-Shuck & Prime Rib Night",
    days_of_week: [4, 5],
    start_time: '16:00',
    end_time: '21:00',
    end_time_label: null,
    deals_summary: [
      '$1.25 Cape May Salt Oysters & Little Neck Clams',
      '$3.00 Frosted Domestic Mugs',
      '$22 Queen Cut Prime Rib w/ Two Sides',
    ],
    tags: ['oysters_clams', 'draft_beer'],
    notes: 'Raw bar available while supplies last.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222205',
    venue_id: '11111111-1111-1111-1111-111111111106',
    category: 'happy_hour',
    title: 'MudHen Craft Pints & Smokehouse Bites',
    days_of_week: [1, 2, 3, 4, 5],
    start_time: '15:00',
    end_time: '18:00',
    end_time_label: null,
    deals_summary: [
      '$2 Off All House-Brewed Craft Pints (1883 IPA, Holly Beach Wheat, Captain Doug)',
      '$8 Smoked Brisket Sliders (3)',
      '$7 Smoked Dry-Rub Wings',
      '$6 House Red & White Sangria',
    ],
    tags: ['draft_beer', 'wings', 'burgers_sandwiches', 'wine', 'outdoor_deck'],
    notes: 'Fire pits lit on the patio.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222206',
    venue_id: '11111111-1111-1111-1111-111111111107',
    category: 'happy_hour',
    title: 'Hereford Inlet Sunset Raw Bar & Martini Hour',
    days_of_week: [3, 4, 5, 6, 0],
    start_time: '16:00',
    end_time: '18:30',
    end_time_label: null,
    deals_summary: [
      '$1.50 Local Oysters & Top Neck Clams',
      '$8 Espresso & Dirty Martinis',
      '$6 House Wine Pours',
      '$9 Hot Crab Dip Skillet',
    ],
    tags: ['oysters_clams', 'cocktails', 'wine', 'outdoor_deck'],
    notes: 'Downstairs Bayfront Bar overlooking Hereford Inlet.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222207',
    venue_id: '11111111-1111-1111-1111-111111111108',
    category: 'daily_special',
    title: 'Old City Taco & Tequila Night + Wing Weekend Warmup',
    days_of_week: [2, 4, 5],
    start_time: '16:00',
    end_time: '21:00',
    end_time_label: null,
    deals_summary: [
      '$3 Braised Birria & Mahi Street Tacos',
      '$6 House Lime & Mango Margaritas',
      '$4 Corona & Modelo Bottles',
    ],
    tags: ['tacos', 'margaritas', 'cans_bottles'],
    notes: 'Dine-in only.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222208',
    venue_id: '11111111-1111-1111-1111-111111111102',
    category: 'trivia_event',
    title: 'Thursday Night Shore Trivia & Wing Night',
    days_of_week: [4],
    start_time: '19:30',
    end_time: '22:00',
    end_time_label: null,
    deals_summary: [
      'Free Team Trivia w/ Bar Tab Prizes ($50 / $25)',
      '75¢ Wings & $12 Domestic Pitchers All Night',
    ],
    tags: ['trivia_bingo', 'wings', 'draft_beer', 'no_cover'],
    notes: 'Sign up by 7:15 PM.',
    valid_from: '2026-01-01',
    valid_until: null,
    is_active: true,
  },
];

// Create SVG data URIs for realistic North Wildwood Flyers
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

export const ANGLESEA_FLYER_URI = createFlyerSvgDataUri({
  bgGradient: ['#064e3b', '#0f172a'],
  accentColor: '#fbbf24',
  headerBadge: 'NORTH WILDWOOD • ANGLESEA',
  venueTitle: 'ANGLESEA PUB',
  subHeader: 'THIS WEEKEND LIVE MUSIC & HAPPY HOUR LINEUP',
  blocks: [
    {
      day: 'THIS FRIDAY (OCT 30)',
      time: '4:00 PM - 7:00 PM',
      title: 'Danny Eyer Acoustic Patio Set',
      detail: '$3.50 Domestic Pints • $7 Jameson Orange Crushes • No Cover',
    },
    {
      day: 'FRIDAY NIGHT (OCT 30)',
      time: 'Starts at 8:30 PM',
      title: 'The Juliano Brothers (Full Band)',
      detail: '$5 Guinness Imperial Pints • Late Night Kitchen till 11pm',
    },
    {
      day: 'SATURDAY (OCT 31) • HALLOWEEN',
      time: '9:00 PM - Close',
      title: 'Belfast Connection & Costume Bash',
      detail: 'Irish Rock & Party Classics • $6 Jameson Shots • No Cover',
    },
    {
      day: 'SUNDAY FUNDAY (NOV 1)',
      time: '1:00 PM -Close',
      title: '1pm Football + Acoustic Jam w/ Mike & Terry',
      detail: '$3 Miller Lite Drafts • 75¢ Buffalo Wings during Birds Game',
    },
  ],
  footerNote: '116 W 1st Ave, North Wildwood NJ • Kitchen Open Daily • @angleseapub',
});

export const OWENS_UPDATE_FLYER_URI = createFlyerSvgDataUri({
  bgGradient: ['#1e1b4b', '#090d16'],
  accentColor: '#38bdf8',
  headerBadge: 'SCHEDULE UPDATE • 17TH AVE',
  venueTitle: "OWEN'S PUB",
  subHeader: 'UPDATED WEEKEND BANDS & FOOTBALL SPECIALS',
  blocks: [
    {
      day: 'FRIDAY NIGHT (OCT 30)',
      time: '8:00 PM - 12:00 AM',
      title: 'DJay & The Shore Rockers',
      detail: '$2.75 Domestic Drafts (4-7pm) • $7 Roast Beef Sandwiches',
    },
    {
      day: 'SATURDAY NIGHT (OCT 31) • BAND CHANGE!',
      time: '8:30 PM - Close',
      title: 'Stellar Mojo (Halloween Costume Party!)',
      detail: 'Updated Band! $100 Bar Tab for Best Costume • $6 Crushes',
    },
    {
      day: 'MON - FRI LOCALS HAPPY HOUR',
      time: '4:00 PM - 7:00 PM',
      title: "Owen's Famous 75¢ Wing & $2.75 Draft Hour",
      detail: 'Eat-in at bar w/ beverage • Best locals spot in North Wildwood',
    },
  ],
  footerNote: '119 E 17th Ave, North Wildwood • (609) 729-7290 • @owenspubnw',
});

export const KEENANS_FLYER_URI = createFlyerSvgDataUri({
  bgGradient: ['#14532d', '#052e16'],
  accentColor: '#4ade80',
  headerBadge: 'OLDE NEW JERSEY AVE',
  venueTitle: "KEENAN'S IRISH PUB",
  subHeader: 'FALL PATIO PARTY & LIVE BAND LINEUP',
  blocks: [
    {
      day: 'FRIDAY & SATURDAY',
      time: '3:00 PM - 7:00 PM',
      title: 'Crush & Patio Heater Happy Hour',
      detail: '$6 Fresh Squeezed Orange/Grapefruit Crushes • 1/2 Price Apps',
    },
    {
      day: 'FRIDAY NIGHT (OCT 30)',
      time: '8:00 PM - 12:00 AM',
      title: 'Split Decision (Main Stage)',
      detail: 'High-energy party band • $4 Miller Lite Bottles till 10pm',
    },
    {
      day: 'SATURDAY (OCT 31)',
      time: '3:00 PM - 7:00 PM',
      title: 'sensational Soul Cruisers (Afternoon Show)',
      detail: 'Outdoor Heated Deck Stage • No Cover before 4pm',
    },
  ],
  footerNote: '113 Olde New Jersey Ave, North Wildwood • @keenansnw',
});

// Concrete one-off Live Music & Weekend events seeded for Oct 30 – Nov 7, 2026
export const SEED_ONE_OFF_OCCURRENCES: CalendarOccurrence[] = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    venue_id: '11111111-1111-1111-1111-111111111101',
    category: 'live_music',
    title: 'Acoustic Happy Hour Set: Danny Eyer',
    performer_name: 'Danny Eyer',
    occurrence_date: '2026-10-30',
    start_at: '2026-10-30T16:00:00-04:00',
    end_at: '2026-10-30T19:00:00-04:00',
    start_time_local: '16:00',
    end_time_local: '19:00',
    end_time_label: null,
    deals_summary: ['$3.50 Domestic Pints', '$7 Jameson Orange Crushes'],
    tags: ['acoustic_solo', 'draft_beer', 'crushes', 'no_cover', 'outdoor_deck'],
    cover_charge: 'No Cover',
    notes: 'Overlaps with Afternoon Happy Hour at the bar.',
    flyer_image_url: ANGLESEA_FLYER_URI,
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.98,
    updated_at: '2026-10-30T10:00:00-04:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    venue_id: '11111111-1111-1111-1111-111111111101',
    category: 'live_music',
    title: 'Friday Night Live: The Juliano Brothers',
    performer_name: 'The Juliano Brothers',
    occurrence_date: '2026-10-30',
    start_at: '2026-10-30T20:30:00-04:00',
    end_at: '2026-10-30T23:59:00-04:00',
    start_time_local: '20:30',
    end_time_local: '23:59',
    end_time_label: 'Late',
    deals_summary: ['$5 Guinness Imperial Pints', 'Late Night Pub Menu till 11pm'],
    tags: ['live_band', 'draft_beer', 'no_cover'],
    cover_charge: 'No Cover',
    notes: 'Full band inside main pub stage.',
    flyer_image_url: ANGLESEA_FLYER_URI,
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.95,
    updated_at: '2026-10-30T10:00:00-04:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    venue_id: '11111111-1111-1111-1111-111111111103',
    category: 'live_music',
    title: 'Split Decision on the Main Stage',
    performer_name: 'Split Decision',
    occurrence_date: '2026-10-30',
    start_at: '2026-10-30T20:00:00-04:00',
    end_at: '2026-10-30T23:59:00-04:00',
    start_time_local: '20:00',
    end_time_local: '23:59',
    end_time_label: '12:00 AM',
    deals_summary: ['$4 Miller Lite Bottles till 10pm', '$6 Orange Crushes'],
    tags: ['live_band', 'cans_bottles', 'crushes'],
    cover_charge: '$5 after 9pm',
    notes: 'Doors open all afternoon.',
    flyer_image_url: KEENANS_FLYER_URI,
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.96,
    updated_at: '2026-10-30T10:00:00-04:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333304',
    venue_id: '11111111-1111-1111-1111-111111111106',
    category: 'live_music',
    title: 'Biergarten Live Music: Animal House Band',
    performer_name: 'Animal House Band',
    occurrence_date: '2026-10-30',
    start_at: '2026-10-30T17:00:00-04:00',
    end_at: '2026-10-30T21:00:00-04:00',
    start_time_local: '17:00',
    end_time_local: '21:00',
    end_time_label: null,
    deals_summary: ['House Craft Pints', 'Smokehouse BBQ Platter Specials'],
    tags: ['live_band', 'draft_beer', 'no_cover', 'outdoor_deck'],
    cover_charge: 'No Cover',
    notes: 'Family friendly in the heated Biergarten.',
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.99,
    updated_at: '2026-10-30T10:00:00-04:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333305',
    venue_id: '11111111-1111-1111-1111-111111111102',
    category: 'live_music',
    title: 'Saturday Night Band: TBA Local Acoustic Duo',
    performer_name: 'TBA Acoustic Duo',
    occurrence_date: '2026-10-31',
    start_at: '2026-10-31T20:30:00-04:00',
    end_at: '2026-10-31T23:59:00-04:00',
    start_time_local: '20:30',
    end_time_local: '23:59',
    end_time_label: 'Close',
    deals_summary: ['$3 Domestic Drafts', '$6 Crushes'],
    tags: ['acoustic_solo', 'draft_beer', 'no_cover'],
    cover_charge: 'No Cover',
    notes: 'Placeholder slot from early week schedule — test re-uploading the updated Owen’s flyer to see Fuzzy Diff Upsert!',
    flyer_image_url: OWENS_UPDATE_FLYER_URI,
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.88,
    updated_at: '2026-10-28T14:00:00-04:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333306',
    venue_id: '11111111-1111-1111-1111-111111111103',
    category: 'live_music',
    title: 'Afternoon Deck Party: Sensational Soul Cruisers',
    performer_name: 'Sensational Soul Cruisers',
    occurrence_date: '2026-10-31',
    start_at: '2026-10-31T15:00:00-04:00',
    end_at: '2026-10-31T19:00:00-04:00',
    start_time_local: '15:00',
    end_time_local: '19:00',
    end_time_label: null,
    deals_summary: ['$6 Fresh Squeezed Crushes', '$3.50 Miller Lite Bottles', '1/2 Price Apps'],
    tags: ['live_band', 'crushes', 'cans_bottles', 'outdoor_deck', 'no_cover'],
    cover_charge: 'No Cover before 4pm',
    notes: 'Huge afternoon shore crowd under the heated deck tent.',
    flyer_image_url: KEENANS_FLYER_URI,
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.97,
    updated_at: '2026-10-30T10:00:00-04:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333307',
    venue_id: '11111111-1111-1111-1111-111111111105',
    category: 'live_music',
    title: 'Halloween Saturday Night Bash w/ DJ Denny Oh',
    performer_name: 'DJ Denny Oh',
    occurrence_date: '2026-10-31',
    start_at: '2026-10-31T21:00:00-04:00',
    end_at: '2026-10-31T23:59:00-04:00',
    start_time_local: '21:00',
    end_time_local: '23:59',
    end_time_label: '2:00 AM',
    deals_summary: ['$5 Green Tea Shots', '$6 Surfside Cans', 'Costume Contest Prizes'],
    tags: ['dj', 'shots', 'cans_bottles'],
    cover_charge: 'No Cover in Costume',
    notes: 'Main downstairs bar & Tiki deck.',
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.94,
    updated_at: '2026-10-30T10:00:00-04:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333308',
    venue_id: '11111111-1111-1111-1111-111111111101',
    category: 'live_music',
    title: 'Sunday Funday Birds Game + Mike & Terry Acoustic',
    performer_name: 'Mike & Terry Acoustic Duo',
    occurrence_date: '2026-11-01',
    start_at: '2026-11-01T13:00:00-04:00',
    end_at: '2026-11-01T18:00:00-04:00',
    start_time_local: '13:00',
    end_time_local: '18:00',
    end_time_label: 'Close',
    deals_summary: ['$3 Miller Lite Drafts during Game', '75¢ Buffalo Wings', '$6 Bloody Marys'],
    tags: ['acoustic_solo', 'draft_beer', 'wings', 'no_cover'],
    cover_charge: 'No Cover',
    notes: 'Game sound on during 1pm kickoff, live acoustic set immediately after.',
    flyer_image_url: ANGLESEA_FLYER_URI,
    is_exception: false,
    is_cancelled: false,
    confidence_score: 0.92,
    updated_at: '2026-10-30T10:00:00-04:00',
  },
];

// Presets for testing the Split-Screen Vision Reviewer + Amber Confidence Flags + Fuzzy Upsert
export const SAMPLE_FLYER_PRESETS: SampleFlyerPreset[] = [
  {
    id: 'preset-owens-update',
    title: "Owen's Pub — Weekend Band Change & Wing Flyer",
    subtitle: 'Tests Fuzzy Diff Upsert (replaces Saturday TBA band with Stellar Mojo) + "8:30pm-Close" inference',
    venue_id: '11111111-1111-1111-1111-111111111102',
    source_label: 'Instagram Story Screenshot (@owenspubnw)',
    flyer_svg_data_uri: OWENS_UPDATE_FLYER_URI,
    extracted_items: [
      {
        id: 'cand-owens-fri',
        venue_id: '11111111-1111-1111-1111-111111111102',
        category: 'live_music',
        is_recurring: false,
        days_of_week: [],
        occurrence_date: '2026-10-30',
        title: 'Friday Night Live: DJay & The Shore Rockers',
        performer_name: 'DJay & The Shore Rockers',
        start_time: '20:00',
        end_time: '23:59',
        end_time_label: '12:00 AM',
        deals_summary: ['$2.75 Domestic Drafts (4-7pm)', '$7 Roast Beef Sandwiches'],
        tags: ['live_band', 'draft_beer', 'burgers_sandwiches', 'no_cover'],
        cover_charge: 'No Cover',
        notes: 'Extracted from Friday top block of flyer.',
        confidence_score: 0.96,
        ambiguity_flags: [],
      },
      {
        id: 'cand-owens-sat-override',
        venue_id: '11111111-1111-1111-1111-111111111102',
        category: 'live_music',
        is_recurring: false,
        days_of_week: [],
        occurrence_date: '2026-10-31',
        title: 'Halloween Costume Party w/ Stellar Mojo',
        performer_name: 'Stellar Mojo',
        start_time: '20:30',
        end_time: '23:59',
        end_time_label: 'Close',
        deals_summary: ['$100 Bar Tab Best Costume Prize', '$6 Orange & Grapefruit Crushes'],
        tags: ['live_band', 'crushes', 'no_cover'],
        cover_charge: 'No Cover',
        notes: 'Flyer notes "BAND CHANGE!" for Saturday Oct 31.',
        confidence_score: 0.79,
        ambiguity_flags: [
          {
            field: 'end_time',
            reason: 'Flyer prints open-ended time "8:30 PM - Close". Inferred 11:59 PM for timeline sorting.',
            suggested_fix: 'Keep 23:59 with label "Close"',
          },
        ],
      },
    ],
  },
  {
    id: 'preset-anglesea-weekend',
    title: 'Anglesea Pub — Multi-Block Weekend & Halloween Flyer',
    subtitle: 'Tests Relative Date Resolution ("THIS FRIDAY"), "Starts at 8:30 PM", and Sunday "1pm-Close"',
    venue_id: '11111111-1111-1111-1111-111111111101',
    source_label: 'Facebook Page Post (Anglesea Pub)',
    flyer_svg_data_uri: ANGLESEA_FLYER_URI,
    extracted_items: [
      {
        id: 'cand-anglesea-sat-halloween',
        venue_id: '11111111-1111-1111-1111-111111111101',
        category: 'live_music',
        is_recurring: false,
        days_of_week: [],
        occurrence_date: '2026-10-31',
        title: 'Belfast Connection & Halloween Costume Bash',
        performer_name: 'Belfast Connection',
        start_time: '21:00',
        end_time: '23:59',
        end_time_label: 'Close',
        deals_summary: ['$6 Jameson Shots', '$5 Guinness Imperial Pints'],
        tags: ['live_band', 'irish_music', 'shots', 'draft_beer', 'no_cover'],
        cover_charge: 'No Cover',
        notes: 'Irish Rock & Party Classics.',
        confidence_score: 0.81,
        ambiguity_flags: [
          {
            field: 'end_time',
            reason: 'Flyer lists "9:00 PM - Close" without numeric closing hour.',
            suggested_fix: 'Use 23:59 ("Close")',
          },
          {
            field: 'occurrence_date',
            reason: 'Flyer header omitted 4-digit year ("SATURDAY OCT 31"); anchored to 2026-10-31.',
            suggested_fix: 'Confirm 2026-10-31',
          },
        ],
      },
      {
        id: 'cand-anglesea-fri-night-check',
        venue_id: '11111111-1111-1111-1111-111111111101',
        category: 'live_music',
        is_recurring: false,
        days_of_week: [],
        occurrence_date: '2026-10-30',
        title: 'Friday Night Live: The Juliano Brothers',
        performer_name: 'The Juliano Brothers',
        start_time: '20:30',
        end_time: '23:59',
        end_time_label: 'Late',
        deals_summary: ['$5 Guinness Imperial Pints', 'Late Night Kitchen till 11pm'],
        tags: ['live_band', 'draft_beer', 'no_cover'],
        cover_charge: 'No Cover',
        notes: 'Flyer says "Starts at 8:30 PM".',
        confidence_score: 0.83,
        ambiguity_flags: [
          {
            field: 'end_time',
            reason: 'Flyer only specifies "Starts at 8:30 PM". Defaulted +3.5h window.',
            suggested_fix: 'Keep 23:59 ("Late")',
          },
        ],
      },
    ],
  },
  {
    id: 'preset-keenans-patio',
    title: "Keenan's Irish Pub — Recurring Crush Happy Hour + Soul Cruisers",
    subtitle: 'Tests Hybrid Extraction: 1 Recurring Rule (Fri/Sat Crush Hour) + 1 One-Off Band Event',
    venue_id: '11111111-1111-1111-1111-111111111103',
    source_label: 'Camera Roll Upload (@keenansnw)',
    flyer_svg_data_uri: KEENANS_FLYER_URI,
    extracted_items: [
      {
        id: 'cand-keenans-recurring-hh',
        venue_id: '11111111-1111-1111-1111-111111111103',
        category: 'happy_hour',
        is_recurring: true,
        days_of_week: [5, 6],
        occurrence_date: '2026-10-30',
        title: "Keenan's Friday & Saturday Crush & Patio Hour",
        performer_name: null,
        start_time: '15:00',
        end_time: '19:00',
        end_time_label: null,
        deals_summary: [
          '$6 Fresh Squeezed Orange & Grapefruit Crushes',
          '$3.50 Miller Lite Bottles',
          '1/2 Price Irish Nachos & Flatbreads',
        ],
        tags: ['crushes', 'cans_bottles', 'half_price_apps', 'outdoor_deck'],
        cover_charge: 'No Cover',
        notes: 'Will update recurring template and materialize 30 days ahead.',
        confidence_score: 0.94,
        ambiguity_flags: [],
      },
      {
        id: 'cand-keenans-sat-soul',
        venue_id: '11111111-1111-1111-1111-111111111103',
        category: 'live_music',
        is_recurring: false,
        days_of_week: [],
        occurrence_date: '2026-10-31',
        title: 'Afternoon Deck Party: Sensational Soul Cruisers',
        performer_name: 'Sensational Soul Cruisers',
        start_time: '15:00',
        end_time: '19:00',
        end_time_label: null,
        deals_summary: ['$6 Fresh Squeezed Crushes', 'No Cover before 4pm'],
        tags: ['live_band', 'crushes', 'outdoor_deck', 'no_cover'],
        cover_charge: 'No Cover before 4pm',
        notes: 'Outdoor Heated Deck Stage.',
        confidence_score: 0.84,
        ambiguity_flags: [
          {
            field: 'performer_name',
            reason: 'OCR capitalized "sensational Soul Cruisers" inconsistently on decorative script font.',
            suggested_fix: 'Normalize to "Sensational Soul Cruisers"',
          },
        ],
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
  daysAhead: number = 21
): CalendarOccurrence[] {
  // Keep all one-off occurrences and any manually overridden/cancelled recurring occurrences
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
    const dow = d.getUTCDay(); // 0=Sun .. 6=Sat

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
