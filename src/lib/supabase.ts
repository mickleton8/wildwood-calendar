import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  ANCHOR_DATE,
  materializeRecurringRulesClient,
  SEED_ONE_OFF_OCCURRENCES,
  SEED_RECURRING_RULES,
  SEED_VENUES,
} from '../data/seedData';
import {
  CalendarOccurrence,
  ExtractedCandidateItem,
  RecurringRule,
  SeasonalStatus,
  Venue,
} from '../types/calendar';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Returns the current date (YYYY-MM-DD) and 24h wall-clock time (HH:MM)
 * in `America/New_York` (Wildwood, NJ local time).
 */
export function getEasternNow(): { dateStr: string; time24: string } {
  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return {
    dateStr: dateFormatter.format(now),
    time24: timeFormatter.format(now),
  };
}

const STORAGE_KEYS = {
  VENUES: 'ww_pulse_venues_v9',
  RULES: 'ww_pulse_rules_v9',
  OCCURRENCES: 'ww_pulse_occurrences_v9',
  CREW_PIN_UNLOCKED: 'ww_pulse_crew_unlocked_v1',
};

export function loadInitialData(): {
  venues: Venue[];
  rules: RecurringRule[];
  occurrences: CalendarOccurrence[];
} {
  try {
    const storedVenues = localStorage.getItem(STORAGE_KEYS.VENUES);
    const storedRules = localStorage.getItem(STORAGE_KEYS.RULES);
    const storedOccurrences = localStorage.getItem(STORAGE_KEYS.OCCURRENCES);

    const venues: Venue[] = storedVenues ? JSON.parse(storedVenues) : SEED_VENUES;
    const rules: RecurringRule[] = storedRules ? JSON.parse(storedRules) : SEED_RECURRING_RULES;

    if (storedOccurrences) {
      return {
        venues,
        rules,
        occurrences: JSON.parse(storedOccurrences),
      };
    }

    const { dateStr } = getEasternNow();
    const baseDate = dateStr || ANCHOR_DATE;
    const materialized = materializeRecurringRulesClient(
      rules,
      SEED_ONE_OFF_OCCURRENCES,
      baseDate,
      21
    );
    localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(venues));
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    localStorage.setItem(STORAGE_KEYS.OCCURRENCES, JSON.stringify(materialized));

    return { venues, rules, occurrences: materialized };
  } catch {
    const materialized = materializeRecurringRulesClient(
      SEED_RECURRING_RULES,
      SEED_ONE_OFF_OCCURRENCES,
      ANCHOR_DATE,
      21
    );
    return {
      venues: SEED_VENUES,
      rules: SEED_RECURRING_RULES,
      occurrences: materialized,
    };
  }
}

export function persistData(
  venues: Venue[],
  rules: RecurringRule[],
  occurrences: CalendarOccurrence[]
) {
  try {
    localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(venues));
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    localStorage.setItem(STORAGE_KEYS.OCCURRENCES, JSON.stringify(occurrences));
  } catch (e) {
    console.warn('Could not persist to localStorage:', e);
  }
}

export function resetToSeedData(): {
  venues: Venue[];
  rules: RecurringRule[];
  occurrences: CalendarOccurrence[];
} {
  localStorage.removeItem(STORAGE_KEYS.VENUES);
  localStorage.removeItem(STORAGE_KEYS.RULES);
  localStorage.removeItem(STORAGE_KEYS.OCCURRENCES);
  return loadInitialData();
}

export function isCrewUnlocked(): boolean {
  return localStorage.getItem(STORAGE_KEYS.CREW_PIN_UNLOCKED) === 'true';
}

export function setCrewUnlocked(unlocked: boolean) {
  if (unlocked) {
    localStorage.setItem(STORAGE_KEYS.CREW_PIN_UNLOCKED, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.CREW_PIN_UNLOCKED);
  }
}

// =============================================================================
// Live Supabase Cloud Repository Functions
// =============================================================================

function extractWallTime(isoTimestamptz: string): string {
  try {
    const dt = new Date(isoTimestamptz);
    if (isNaN(dt.getTime())) return '16:00';
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(dt);
  } catch {
    return '16:00';
  }
}

function normalizeCloudOccurrence(row: any): CalendarOccurrence {
  return {
    id: row.id,
    venue_id: row.venue_id,
    recurring_rule_id: row.recurring_rule_id ?? null,
    source_batch_id: row.source_batch_id ?? null,
    category: row.category,
    title: row.title,
    performer_name: row.performer_name ?? null,
    occurrence_date: row.occurrence_date,
    start_at: row.start_at,
    end_at: row.end_at,
    start_time_local: extractWallTime(row.start_at),
    end_time_local: extractWallTime(row.end_at),
    end_time_label: row.end_time_label ?? null,
    deals_summary: Array.isArray(row.deals_summary) ? row.deals_summary : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    cover_charge: row.cover_charge || 'No Cover',
    notes: row.notes ?? '',
    flyer_image_url: row.flyer_image_url || row.flyer_preview_url || undefined,
    is_exception: Boolean(row.is_exception),
    is_cancelled: Boolean(row.is_cancelled),
    confidence_score: Number(row.confidence_score ?? 1),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export async function fetchCloudData(): Promise<{
  venues: Venue[];
  rules: RecurringRule[];
  occurrences: CalendarOccurrence[];
} | null> {
  if (!supabase) return null;

  const [venuesRes, rulesRes, occRes] = await Promise.all([
    supabase.from('venues').select('*').eq('is_active', true).order('name'),
    supabase.from('recurring_rules').select('*').order('title'),
    supabase.from('calendar_occurrences').select('*').order('occurrence_date').order('start_at'),
  ]);

  if (venuesRes.error || rulesRes.error || occRes.error) {
    console.warn('Supabase cloud fetch error:', venuesRes.error || rulesRes.error || occRes.error);
    return null;
  }

  if (!venuesRes.data?.length) {
    return null;
  }

  const verifiedMap = new Map(SEED_VENUES.map((v) => [v.id, v]));
  const mergedVenuesMap = new Map<string, Venue>();

  // Always include all 57 verified corridor venues with verified addresses & neighborhoods
  for (const v of SEED_VENUES) {
    mergedVenuesMap.set(v.id, v);
  }

  // Include any additional cloud-added venues not in the canonical 57 list (excluding Tavern on the Bay)
  for (const v of venuesRes.data) {
    if (v.slug === 'tavern-on-the-bay') continue;
    if (!verifiedMap.has(v.id)) {
      mergedVenuesMap.set(v.id, {
        id: v.id,
        slug: v.slug,
        name: v.name,
        neighborhood: v.neighborhood || 'North Wildwood',
        address: v.address || '',
        cross_street: v.cross_street || v.neighborhood || 'North Wildwood',
        lat: Number(v.lat ?? 39.006),
        lng: Number(v.lng ?? -74.794),
        website_url: v.website_url,
        facebook_url: v.facebook_url,
        instagram_handle: v.instagram_handle,
        phone: v.phone,
        is_year_round: Boolean(v.is_year_round ?? true),
        is_active: Boolean(v.is_active ?? true),
      });
    }
  }

  const venues: Venue[] = Array.from(mergedVenuesMap.values());

  const rules: RecurringRule[] = (rulesRes.data || []).map((r: any) => ({
    id: r.id,
    venue_id: r.venue_id,
    category: r.category,
    title: r.title,
    days_of_week: Array.isArray(r.days_of_week) ? r.days_of_week : [],
    start_time: String(r.start_time || '15:00').slice(0, 5),
    end_time: r.end_time ? String(r.end_time).slice(0, 5) : null,
    end_time_label: r.end_time_label ?? null,
    deals_summary: Array.isArray(r.deals_summary) ? r.deals_summary : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
    notes: r.notes ?? '',
    valid_from: r.valid_from || ANCHOR_DATE,
    valid_until: r.valid_until ?? null,
    is_active: Boolean(r.is_active ?? true),
  }));

  const occurrencesRaw: CalendarOccurrence[] = (occRes.data || []).map(normalizeCloudOccurrence);
  const occurrences = occurrencesRaw.filter((occ) => {
    const v = mergedVenuesMap.get(occ.venue_id);
    if (!v) return true;
    if (v.seasonal_status === 'closed_for_season') return false;
    if (Array.isArray(v.open_days_of_week) && v.open_days_of_week.length > 0 && !occ.is_exception) {
      const [y, m, d] = occ.occurrence_date.split('-').map(Number);
      const dow = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
      if (!v.open_days_of_week.includes(dow)) return false;
    }
    return true;
  });

  return { venues, rules, occurrences };
}

export async function syncApprovedItemsToCloud(
  approvedItems: ExtractedCandidateItem[],
  flyerImageUrl: string
): Promise<boolean> {
  if (!supabase) return false;

  try {
    let publicFlyerUrl = flyerImageUrl;

    // Upload custom base64 raster flyer to Supabase Storage `flyers` bucket if applicable
    if (flyerImageUrl.startsWith('data:image/') && !flyerImageUrl.startsWith('data:image/svg+xml')) {
      const mimeMatch = flyerImageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1];
        const base64 = mimeMatch[2];
        const byteChars = atob(base64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
        const ext = mimeType.split('/')[1] || 'jpg';
        const filePath = `crew_${Date.now()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from('flyers')
          .upload(filePath, blob, { contentType: mimeType, upsert: true });

        if (!uploadErr) {
          const { data: pubData } = supabase.storage.from('flyers').getPublicUrl(filePath);
          if (pubData?.publicUrl) {
            publicFlyerUrl = pubData.publicUrl;
          }
        }
      }
    }

    // Record audit batch in ingestion_batches
    const { data: batchRow } = await supabase
      .from('ingestion_batches')
      .insert({
        venue_id: approvedItems[0]?.venue_id ?? null,
        source_type: 'flyer_upload',
        storage_path: publicFlyerUrl,
        status: 'approved',
        raw_extracted_json: approvedItems,
        submitted_by: 'Crew Member',
        reviewed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    const batchId = batchRow?.id ?? null;

    for (const item of approvedItems) {
      if (item.is_recurring) {
        const payload = {
          venue_id: item.venue_id,
          category: item.category,
          title: item.title,
          days_of_week: item.days_of_week.length ? item.days_of_week : [5, 6],
          start_time: item.start_time,
          end_time: item.end_time,
          end_time_label: item.end_time_label || null,
          deals_summary: item.deals_summary,
          tags: item.tags,
          notes: item.notes || null,
          source_batch_id: batchId,
          is_active: true,
        };

        if (item.diff_match?.matchType === 'update' && item.diff_match.existingOccurrenceId) {
          await supabase
            .from('recurring_rules')
            .update(payload)
            .eq('id', item.diff_match.existingOccurrenceId);
        } else {
          await supabase.from('recurring_rules').insert(payload);
        }
      } else {
        const startAt = `${item.occurrence_date}T${item.start_time}:00-04:00`;
        const endAt = `${item.occurrence_date}T${item.end_time}:00-04:00`;

        const occPayload = {
          venue_id: item.venue_id,
          source_batch_id: batchId,
          category: item.category,
          title: item.title,
          performer_name: item.performer_name || null,
          occurrence_date: item.occurrence_date,
          start_at: startAt,
          end_at: endAt,
          end_time_label: item.end_time_label || null,
          deals_summary: item.deals_summary,
          tags: item.tags,
          cover_charge: item.cover_charge || 'No Cover',
          notes: item.notes || null,
          flyer_image_url: publicFlyerUrl,
          is_exception: item.diff_match?.matchType === 'update',
          confidence_score: item.confidence_score,
          updated_at: new Date().toISOString(),
        };

        if (item.diff_match?.matchType === 'update' && item.diff_match.existingOccurrenceId) {
          await supabase
            .from('calendar_occurrences')
            .update(occPayload)
            .eq('id', item.diff_match.existingOccurrenceId);
        } else {
          await supabase.from('calendar_occurrences').insert(occPayload);
        }
      }
    }

    // Trigger server-side materialization for any updated recurring rules
    await supabase.rpc('materialize_recurring_rules', { p_days_ahead: 30 });
    return true;
  } catch (err) {
    console.warn('Failed to sync approved items to Supabase cloud:', err);
    return false;
  }
}

export async function cancelOccurrenceInCloud(occId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('calendar_occurrences')
    .update({ is_cancelled: true, is_exception: true, updated_at: new Date().toISOString() })
    .eq('id', occId);
  return !error;
}

export async function toggleRuleInCloud(ruleId: string, nextActive: boolean): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('recurring_rules')
    .update({ is_active: nextActive, updated_at: new Date().toISOString() })
    .eq('id', ruleId);
  if (!error) {
    await supabase.rpc('materialize_recurring_rules', { p_days_ahead: 30 });
  }
  return !error;
}

export async function rematerializeInCloud(): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc('materialize_recurring_rules', { p_days_ahead: 30 });
  return !error;
}

export async function updateVenueSeasonalStatusInCloud(
  venueId: string,
  nextStatus: SeasonalStatus,
  openDays: number[],
  seasonalNote: string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    await supabase
      .from('venues')
      .update({
        is_year_round: nextStatus === 'open',
        updated_at: new Date().toISOString(),
      })
      .eq('id', venueId);

    if (nextStatus === 'closed_for_season') {
      // Pause all recurring rules for this venue and remove non-exception materialized occurrences
      await supabase
        .from('recurring_rules')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('venue_id', venueId);

      await supabase
        .from('calendar_occurrences')
        .delete()
        .eq('venue_id', venueId)
        .eq('is_exception', false);
    } else {
      // Activate recurring rules for this venue and materialize
      await supabase
        .from('recurring_rules')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('venue_id', venueId);

      await supabase.rpc('materialize_recurring_rules', { p_days_ahead: 30 });

      // If weekends_only, prune any materialized occurrences on days the venue is closed
      if (nextStatus === 'weekends_only' && openDays.length > 0) {
        const { data: occRows } = await supabase
          .from('calendar_occurrences')
          .select('id, occurrence_date, is_exception')
          .eq('venue_id', venueId)
          .eq('is_exception', false);

        if (occRows?.length) {
          const toDeleteIds = occRows
            .filter((row: any) => {
              const [y, m, d] = String(row.occurrence_date).split('-').map(Number);
              const dow = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
              return !openDays.includes(dow);
            })
            .map((row: any) => row.id);

          if (toDeleteIds.length > 0) {
            await supabase.from('calendar_occurrences').delete().in('id', toDeleteIds);
          }
        }
      }
    }
    return true;
  } catch (err) {
    console.warn('Failed to update venue seasonal status in cloud:', err);
    return false;
  }
}
