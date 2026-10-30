// =============================================================================
// Supabase Edge Function: extract-flyer
// Multimodal Gemini 2.5 Flash Vision Extraction for Shore Flyers
// Handles relative dates ("This Friday"), open-ended times ("4pm-Close"),
// multi-column band grids, and per-field confidence scoring.
// =============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-crew-pin",
};

interface ExtractedCandidateItem {
  category: "happy_hour" | "daily_special" | "live_music" | "trivia_event";
  is_recurring: boolean;
  days_of_week?: number[];
  occurrence_date?: string; // YYYY-MM-DD
  title: string;
  performer_name?: string | null;
  start_time: string; // HH:MM (24h)
  end_time: string | null; // HH:MM (24h) or null if open-ended
  end_time_label?: string | null; // e.g., "Close" or "Late"
  deals_summary: string[];
  tags: string[];
  cover_charge?: string;
  notes?: string;
  confidence_score: number;
  ambiguity_flags: {
    field: string;
    reason: string;
    suggested_fix: string;
  }[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const crewPin = req.headers.get("x-crew-pin");
    const expectedPin = Deno.env.get("CREW_PIN") ?? "1922";
    if (crewPin !== expectedPin) {
      return new Response(
        JSON.stringify({ error: "Invalid Friends & Family Crew PIN" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      imageBase64,
      mimeType = "image/jpeg",
      venueId,
      venueName,
      referenceDate = new Date().toISOString().slice(0, 10),
    } = body;

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured in Edge Function secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a precision data extraction specialist for shore bars and live music venues in North Wildwood & Wildwood, NJ.
Today's reference date in America/New_York is: ${referenceDate}.

CRITICAL EXTRACTION RULES:
1. MULTI-COLUMN GRIDS: First inspect whether the flyer is organized by day columns (Fri | Sat | Sun) or stage rows (Main Stage vs Deck). Do not mix performers across columns.
2. RELATIVE DATES: Resolve "Tonight", "This Friday", "Saturday", or "Oct 31" relative to referenceDate (${referenceDate}). If a date had to be inferred from a day name without a printed numeric date, add an ambiguity_flag on field "occurrence_date".
3. OPEN-ENDED END TIMES: If a flyer says "Starts at 8pm", "4pm-Close", or omits an end time:
   - Set end_time_label to "Close" or "Late"
   - Set end_time to a sensible fallback ("23:30" for evening bands starting at 8-9pm, "18:00" for afternoon sets)
   - Add an ambiguity_flag on field "end_time" explaining that the end time was inferred.
4. CONTROLLED TAG VOCABULARY: Only use tags from:
   ["draft_beer", "cans_bottles", "crushes", "margaritas", "cocktails", "wine", "shots", "wings", "tacos", "oysters_clams", "burgers_sandwiches", "pizza", "half_price_apps", "live_band", "acoustic_solo", "dj", "irish_music", "trivia_bingo", "no_cover", "outdoor_deck"].

Return strict JSON matching the schema: { "detected_venue_name": string, "items": ExtractedCandidateItem[] }.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nTarget Venue Context: ${venueName || "Auto-detect from flyer"}` },
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(rawText);

    // Optional: Check existing occurrences in Supabase for fuzzy diff matching
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    let existingOccurrences = [];

    if (supabaseUrl && supabaseKey && venueId) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from("calendar_occurrences")
        .select("id, occurrence_date, category, title, performer_name, start_at, end_at")
        .eq("venue_id", venueId)
        .gte("occurrence_date", referenceDate);
      existingOccurrences = data ?? [];
    }

    return new Response(
      JSON.stringify({
        detected_venue_name: parsed.detected_venue_name ?? venueName,
        items: parsed.items ?? [],
        existing_occurrences: existingOccurrences,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
