import { ANCHOR_DATE } from '../data/seedData';
import {
  CalendarOccurrence,
  DiffMatchInfo,
  ExtractedCandidateItem,
  RecurringRule,
} from '../types/calendar';
import { getEasternNow, isSupabaseConfigured, supabase } from './supabase';

/**
 * Computes fuzzy match / diff status for each extracted candidate item against
 * existing `calendar_occurrences` and `recurring_rules` on `(venue_id, date, category)`.
 */
export function attachFuzzyDiffMatches(
  candidates: Omit<ExtractedCandidateItem, 'selected' | 'diff_match'>[],
  existingOccurrences: CalendarOccurrence[],
  existingRules: RecurringRule[]
): ExtractedCandidateItem[] {
  return candidates.map((cand) => {
    if (cand.is_recurring) {
      const matchingRule = existingRules.find(
        (r) => r.venue_id === cand.venue_id && r.category === cand.category
      );
      if (matchingRule) {
        return {
          ...cand,
          selected: true,
          diff_match: {
            matchType: 'update',
            existingOccurrenceId: matchingRule.id,
            existingTitle: matchingRule.title,
            existingTimeWindow: `${matchingRule.start_time} – ${
              matchingRule.end_time_label || matchingRule.end_time || 'Close'
            }`,
            summaryText: `Updates recurring rule "${matchingRule.title}" & re-materializes 21 days`,
          },
        };
      }
      return {
        ...cand,
        selected: true,
        diff_match: {
          matchType: 'new',
          summaryText: 'Creates new weekly recurring rule + 21-day occurrences',
        },
      };
    }

    // One-off occurrence: match by (venue_id, occurrence_date, category)
    // If multiple on the same day (e.g. afternoon acoustic vs night band), match closest start_time within 3 hours
    const sameDaySlot = existingOccurrences.find((occ) => {
      if (
        occ.venue_id !== cand.venue_id ||
        occ.occurrence_date !== cand.occurrence_date ||
        occ.category !== cand.category ||
        occ.is_cancelled
      ) {
        return false;
      }
      const candHour = parseInt(cand.start_time.split(':')[0] || '20', 10);
      const occHour = parseInt(occ.start_time_local.split(':')[0] || '20', 10);
      return Math.abs(candHour - occHour) <= 3;
    });

    const diff: DiffMatchInfo = sameDaySlot
      ? {
          matchType: 'update',
          existingOccurrenceId: sameDaySlot.id,
          existingTitle: sameDaySlot.title,
          existingPerformer: sameDaySlot.performer_name,
          existingTimeWindow: `${sameDaySlot.start_time_local} – ${
            sameDaySlot.end_time_label || sameDaySlot.end_time_local
          }`,
          summaryText: `Replaces "${
            sameDaySlot.performer_name || sameDaySlot.title
          }" (${sameDaySlot.start_time_local})`,
        }
      : {
          matchType: 'new',
          summaryText: 'New calendar event on this date/time slot',
        };

    return {
      ...cand,
      selected: true,
      diff_match: diff,
    };
  });
}

/**
 * Extracts structured candidate items from an uploaded image file using:
 * 1. Supabase Edge Function (`extract-flyer`) if configured
 * 2. Direct Gemini 2.5 Flash Vision API if `VITE_GEMINI_API_KEY` is set
 * 3. Intelligent local flyer parser fallback for offline/demo testing
 */
export async function extractCustomFlyerImage(
  file: File,
  venueId: string,
  venueName: string,
  crewPin: string
): Promise<{
  imageDataUrl: string;
  items: Omit<ExtractedCandidateItem, 'selected' | 'diff_match'>[];
  usedLiveAi: boolean;
  extractionError?: string;
}> {
  const imageDataUrl = await fileToDataUrl(file);
  const base64Data = imageDataUrl.split(',')[1] || '';
  const liveDate = getEasternNow().dateStr;

  // 1. Try Supabase Edge Function if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('extract-flyer', {
        body: {
          imageBase64: base64Data,
          mimeType: file.type || 'image/jpeg',
          venueId,
          venueName,
          referenceDate: liveDate,
        },
        headers: {
          'x-crew-pin': crewPin,
        },
      });
      if (!error && data?.items?.length) {
        return {
          imageDataUrl,
          items: data.items.map((item: any, idx: number) => ({
            ...item,
            id: `edge_${Date.now()}_${idx}`,
            venue_id: venueId,
          })),
          usedLiveAi: true,
        };
      }
    } catch (err) {
      console.warn('Edge function fallback:', err);
    }
  }

  // 2. Try direct Gemini Multimodal Vision API if VITE_GEMINI_API_KEY is available
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  let lastError: string | null = null;

  if (geminiKey && geminiKey.trim().length > 10) {
    const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];
    const prompt = `Extract all Happy Hours, Daily Specials, and Live Music events from this flyer for venue "${venueName}".
Today's reference date in Wildwood, NJ is ${liveDate}. Use this to anchor relative days (e.g. "This Friday", "Tomorrow", "Oct 31", "Nov 1") to exact YYYY-MM-DD dates.
Return JSON ONLY matching this schema:
{
  "items": [
    {
      "category": "happy_hour" | "daily_special" | "live_music" | "trivia_event",
      "is_recurring": boolean,
      "days_of_week": number[],
      "occurrence_date": "YYYY-MM-DD",
      "title": string,
      "performer_name": string | null,
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "end_time_label": string | null,
      "deals_summary": string[],
      "tags": string[],
      "cover_charge": string,
      "notes": string,
      "confidence_score": number,
      "ambiguity_flags": [
        {
          "field": "end_time" | "start_time" | "performer_name" | "occurrence_date",
          "reason": string,
          "suggested_fix": string
        }
      ]
    }
  ]
}`;

    for (const model of candidateModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    { inline_data: { mime_type: file.type || 'image/jpeg', data: base64Data } },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            }),
          }
        );

        if (res.ok) {
          const json = await res.json();
          const textPart = json?.candidates?.[0]?.content?.parts?.find(
            (p: any) => typeof p.text === 'string' && p.text.trim().length > 0
          );
          const rawText = textPart?.text || '{}';
          const cleanedJson = rawText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
          const parsed = JSON.parse(cleanedJson);

          if (Array.isArray(parsed.items) && parsed.items.length > 0) {
            return {
              imageDataUrl,
              items: parsed.items.map((it: any, idx: number) => ({
                id: `gemini_${Date.now()}_${idx}`,
                venue_id: venueId,
                category: it.category || 'live_music',
                is_recurring: Boolean(it.is_recurring),
                days_of_week: Array.isArray(it.days_of_week) ? it.days_of_week : [],
                occurrence_date: it.occurrence_date || liveDate,
                title: it.title || `${venueName} Event`,
                performer_name: it.performer_name || null,
                start_time: it.start_time || '20:00',
                end_time: it.end_time || '23:59',
                end_time_label: it.end_time_label || null,
                deals_summary: Array.isArray(it.deals_summary) ? it.deals_summary : [],
                tags: Array.isArray(it.tags) ? it.tags : ['live_band', 'no_cover'],
                cover_charge: it.cover_charge || 'No Cover',
                notes: it.notes || '',
                confidence_score: Number(it.confidence_score) || 0.88,
                ambiguity_flags: Array.isArray(it.ambiguity_flags) ? it.ambiguity_flags : [],
              })),
              usedLiveAi: true,
            };
          }
        } else {
          const errJson = await res.json().catch(() => null);
          lastError = errJson?.error?.message || `HTTP ${res.status}`;
          console.warn(`Gemini model ${model} failed (${res.status}):`, lastError);
        }
      } catch (err) {
        lastError = (err as Error).message;
        console.warn(`Direct Gemini call error for ${model}:`, err);
      }
    }
  }

  // 3. Intelligent local extraction fallback (generates editable candidate with clear manual note)
  const cleanName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  return {
    imageDataUrl,
    usedLiveAi: false,
    extractionError: lastError || (!geminiKey ? 'Missing Gemini API key' : 'Could not parse flyer image'),
    items: [
      {
        id: `custom_${Date.now()}_1`,
        venue_id: venueId,
        category: 'live_music',
        is_recurring: false,
        days_of_week: [],
        occurrence_date: liveDate,
        title: `${venueName}: ${cleanName || 'Special Event'}`,
        performer_name: 'Live Music / Special Event',
        start_time: '20:00',
        end_time: '23:59',
        end_time_label: 'Close',
        deals_summary: ['Drink & Food Specials'],
        tags: ['live_band', 'draft_beer', 'no_cover'],
        cover_charge: 'No Cover',
        notes: `Manual fallback for "${file.name}". Edit details on the right.`,
        confidence_score: 0.7,
        ambiguity_flags: [
          {
            field: 'end_time',
            reason: 'Manual fallback mode: confirm event hours and specials.',
            suggested_fix: 'Adjust times and deals',
          },
        ],
      },
    ],
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
