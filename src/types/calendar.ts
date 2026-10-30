export type EventCategory = 'happy_hour' | 'daily_special' | 'live_music' | 'trivia_event';

export type FilterTag =
  | 'draft_beer'
  | 'cans_bottles'
  | 'crushes'
  | 'margaritas'
  | 'cocktails'
  | 'wine'
  | 'shots'
  | 'wings'
  | 'tacos'
  | 'oysters_clams'
  | 'burgers_sandwiches'
  | 'pizza'
  | 'half_price_apps'
  | 'live_band'
  | 'acoustic_solo'
  | 'dj'
  | 'irish_music'
  | 'trivia_bingo'
  | 'no_cover'
  | 'outdoor_deck';

export interface TagMetadata {
  id: FilterTag;
  label: string;
  emoji: string;
  group: 'drink' | 'food' | 'music';
}

export interface Venue {
  id: string;
  slug: string;
  name: string;
  neighborhood: string;
  address: string;
  cross_street: string;
  lat: number;
  lng: number;
  website_url?: string;
  facebook_url?: string;
  instagram_handle?: string;
  phone?: string;
  is_year_round: boolean;
  is_active: boolean;
}

export interface RecurringRule {
  id: string;
  venue_id: string;
  category: EventCategory;
  title: string;
  days_of_week: number[]; // 0=Sun .. 6=Sat
  start_time: string; // HH:MM (24h)
  end_time: string | null; // HH:MM (24h) or null
  end_time_label?: string | null; // e.g., "Close"
  deals_summary: string[];
  tags: FilterTag[];
  notes?: string;
  valid_from: string; // YYYY-MM-DD
  valid_until?: string | null;
  is_active: boolean;
}

export interface CalendarOccurrence {
  id: string;
  venue_id: string;
  recurring_rule_id?: string | null;
  source_batch_id?: string | null;
  category: EventCategory;
  title: string;
  performer_name?: string | null;
  occurrence_date: string; // YYYY-MM-DD
  start_at: string; // ISO string
  end_at: string; // ISO string
  start_time_local: string; // HH:MM (24h) for convenient display/editing
  end_time_local: string; // HH:MM (24h)
  end_time_label?: string | null; // Preserves "Close" or "Late"
  deals_summary: string[];
  tags: FilterTag[];
  cover_charge?: string;
  notes?: string;
  flyer_svg_preset?: string;
  flyer_image_url?: string;
  is_exception: boolean;
  is_cancelled: boolean;
  confidence_score: number;
  updated_at: string;
}

export interface AmbiguityFlag {
  field: 'occurrence_date' | 'start_time' | 'end_time' | 'performer_name' | 'deals_summary' | 'title';
  reason: string;
  suggested_fix: string;
  resolved?: boolean;
}

export interface DiffMatchInfo {
  matchType: 'new' | 'update';
  existingOccurrenceId?: string;
  existingTitle?: string;
  existingPerformer?: string | null;
  existingTimeWindow?: string;
  summaryText?: string;
}

export interface ExtractedCandidateItem {
  id: string;
  venue_id: string;
  category: EventCategory;
  is_recurring: boolean;
  days_of_week: number[];
  occurrence_date: string; // YYYY-MM-DD
  title: string;
  performer_name?: string | null;
  start_time: string; // HH:MM (24h)
  end_time: string; // HH:MM (24h)
  end_time_label?: string | null; // e.g., "Close"
  deals_summary: string[];
  tags: FilterTag[];
  cover_charge: string;
  notes?: string;
  confidence_score: number;
  ambiguity_flags: AmbiguityFlag[];
  diff_match?: DiffMatchInfo;
  selected: boolean;
}

export interface SampleFlyerPreset {
  id: string;
  title: string;
  subtitle: string;
  venue_id: string;
  source_label: string;
  flyer_svg_data_uri: string;
  extracted_items: Omit<ExtractedCandidateItem, 'selected' | 'diff_match'>[];
}
