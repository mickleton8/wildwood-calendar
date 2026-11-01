import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardPaste,
  FileImage,
  RefreshCw,
  Sparkles,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { SAMPLE_FLYER_PRESETS, TAG_METADATA } from '../data/seedData';
import { attachFuzzyDiffMatches, extractCustomFlyerImage } from '../lib/flyerExtractor';
import {
  CalendarOccurrence,
  EventCategory,
  ExtractedCandidateItem,
  FilterTag,
  RecurringRule,
  Venue,
} from '../types/calendar';

interface SplitScreenReviewerProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
  existingOccurrences: CalendarOccurrence[];
  existingRules: RecurringRule[];
  crewPin: string;
  onPublishCandidates: (
    approvedItems: ExtractedCandidateItem[],
    flyerImageUrl: string
  ) => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const SplitScreenReviewer: React.FC<SplitScreenReviewerProps> = ({
  isOpen,
  onClose,
  venues,
  existingOccurrences,
  existingRules,
  crewPin,
  onPublishCandidates,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    SAMPLE_FLYER_PRESETS[0].id
  );
  const [selectedVenueId, setSelectedVenueId] = useState<string>(
    SAMPLE_FLYER_PRESETS[0].venue_id
  );
  const [flyerImageUrl, setFlyerImageUrl] = useState<string>(
    SAMPLE_FLYER_PRESETS[0].flyer_svg_data_uri
  );
  const [sourceLabel, setSourceLabel] = useState<string>(
    SAMPLE_FLYER_PRESETS[0].source_label
  );
  const [candidates, setCandidates] = useState<ExtractedCandidateItem[]>([]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [usedLiveAi, setUsedLiveAi] = useState<boolean>(true);
  const [extractionNotice, setExtractionNotice] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [newDealInputs, setNewDealInputs] = useState<Record<string, string>>({});

  // Load preset and compute live fuzzy diffs against current DB state
  useEffect(() => {
    if (!isOpen) return;
    const preset =
      SAMPLE_FLYER_PRESETS.find((p) => p.id === selectedPresetId) ||
      SAMPLE_FLYER_PRESETS[0];
    setSelectedVenueId(preset.venue_id);
    setFlyerImageUrl(preset.flyer_svg_data_uri);
    setSourceLabel(preset.source_label);
    setUsedLiveAi(true);
    setExtractionNotice(null);
    const withDiffs = attachFuzzyDiffMatches(
      preset.extracted_items,
      existingOccurrences,
      existingRules
    );
    setCandidates(withDiffs);
  }, [isOpen, selectedPresetId, existingOccurrences, existingRules]);

  // Support global Ctrl+V paste of flyer screenshots while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            await handleCustomFileUpload(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  });

  if (!isOpen) return null;

  const handleCustomFileUpload = async (file: File) => {
    setIsExtracting(true);
    setExtractionNotice(null);
    try {
      const venue = venues.find((v) => v.id === selectedVenueId) || venues[0];
      const result = await extractCustomFlyerImage(
        file,
        venue.id,
        venue.name,
        crewPin
      );
      setFlyerImageUrl(result.imageDataUrl);
      setUsedLiveAi(result.usedLiveAi);
      setSourceLabel(
        result.usedLiveAi
          ? `Gemini 3.5 Flash Vision (${file.name})`
          : `Manual Fallback (${file.name})`
      );
      if (!result.usedLiveAi) {
        setExtractionNotice(
          result.extractionError
            ? `AI Vision notice: ${result.extractionError}. Displaying editable candidate form.`
            : 'AI Vision could not parse this file automatically. Displaying editable candidate form.'
        );
      }
      const withDiffs = attachFuzzyDiffMatches(
        result.items,
        existingOccurrences,
        existingRules
      );
      setCandidates(withDiffs);
    } finally {
      setIsExtracting(false);
    }
  };

  const updateCandidate = (
    id: string,
    patch: Partial<ExtractedCandidateItem>
  ) => {
    setCandidates((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
      return updated.map((c) => {
        if (c.id !== id) return c;
        const recomputed = attachFuzzyDiffMatches(
          [c],
          existingOccurrences,
          existingRules
        )[0];
        return {
          ...recomputed,
          selected: c.selected,
          ambiguity_flags: patch.ambiguity_flags ?? c.ambiguity_flags,
        };
      });
    });
  };

  const resolveFlag = (candId: string, fieldName: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candId) return c;
        const nextFlags = c.ambiguity_flags.map((f) =>
          f.field === fieldName ? { ...f, resolved: true } : f
        );
        return {
          ...c,
          confidence_score: Math.min(0.99, c.confidence_score + 0.08),
          ambiguity_flags: nextFlags,
        };
      })
    );
  };

  const toggleTag = (candId: string, tag: FilterTag) => {
    const target = candidates.find((c) => c.id === candId);
    if (!target) return;
    const nextTags = target.tags.includes(tag)
      ? target.tags.filter((t) => t !== tag)
      : [...target.tags, tag];
    updateCandidate(candId, { tags: nextTags });
  };

  const addDealBullet = (candId: string) => {
    const text = (newDealInputs[candId] || '').trim();
    if (!text) return;
    const target = candidates.find((c) => c.id === candId);
    if (!target) return;
    updateCandidate(candId, {
      deals_summary: [...target.deals_summary, text],
    });
    setNewDealInputs((prev) => ({ ...prev, [candId]: '' }));
  };

  const removeDealBullet = (candId: string, idx: number) => {
    const target = candidates.find((c) => c.id === candId);
    if (!target) return;
    updateCandidate(candId, {
      deals_summary: target.deals_summary.filter((_, i) => i !== idx),
    });
  };

  const selectedCount = candidates.filter((c) => c.selected).length;
  const unresolvedAmberCount = candidates.reduce(
    (sum, c) =>
      sum +
      (c.selected
        ? c.ambiguity_flags.filter((f) => !f.resolved).length
        : 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4">
      <div className="relative flex flex-col w-full max-w-7xl h-[94vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/80 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Split-Screen Flyer Vision Reviewer
                </h2>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  Trusted Crew Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect original shore flyer on the left • Verify amber AI confidence flags &amp; fuzzy diff upserts on the right
              </p>
            </div>
          </div>

          {/* Preset Selector + Upload Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 focus:border-amber-500 focus:outline-none"
              aria-label="Select Sample Shore Flyer Preset"
            >
              {SAMPLE_FLYER_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  📋 Preset: {preset.title}
                </option>
              ))}
            </select>

            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 text-xs font-semibold text-amber-300 transition">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload / Paste Flyer</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCustomFileUpload(file);
                }}
              />
            </label>

            <button
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Reviewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Split Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden">
          {/* LEFT PANE: Original Flyer Graphic */}
          <div className="lg:col-span-5 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/60 min-h-[260px] lg:min-h-0">
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 truncate">
                <FileImage className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="truncate font-medium text-slate-300">
                  {sourceLabel}
                </span>
                {usedLiveAi ? (
                  <span className="shrink-0 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    ✨ Vision AI
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    ⚠️ Manual Mode
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom((z) => Math.max(0.75, z - 0.15))}
                  className="rounded-lg p-1 hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="px-1.5 font-mono text-[11px] text-slate-400">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(1.75, z + 0.15))}
                  className="rounded-lg p-1 hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-auto flex items-center justify-center p-4 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
              {isExtracting ? (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <RefreshCw className="h-8 w-8 animate-spin text-amber-400" />
                  <p className="text-sm font-semibold text-white">
                    Running Gemini 3.5 Flash Vision Extraction...
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Resolving relative dates (&ldquo;This Friday&rdquo;), open-ended times (&ldquo;8:30pm-Close&rdquo;), and checking for existing venue schedule conflicts.
                  </p>
                </div>
              ) : (
                <img
                  src={flyerImageUrl}
                  alt="Source Venue Flyer"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                  className="max-h-full w-auto rounded-xl border border-slate-700/80 shadow-2xl transition-transform duration-150"
                />
              )}
            </div>

            <div className="border-t border-slate-800/80 bg-slate-900/70 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <ClipboardPaste className="h-3.5 w-3.5 text-amber-400" />
                Tip: Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-slate-200">Ctrl+V</kbd> anywhere to paste an IG/FB screenshot
              </span>
              <span>Anchor Date: Fri Oct 30, 2026</span>
            </div>
          </div>

          {/* RIGHT PANE: Extracted Candidate Cards + Confidence & Diff Flags */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-2.5 bg-slate-900/90">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target Venue:
                </span>
                <select
                  value={selectedVenueId}
                  onChange={(e) => {
                    const nextVenueId = e.target.value;
                    setSelectedVenueId(nextVenueId);
                    setCandidates((prev) =>
                      attachFuzzyDiffMatches(
                        prev.map((c) => ({ ...c, venue_id: nextVenueId })),
                        existingOccurrences,
                        existingRules
                      )
                    );
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.neighborhood})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {unresolvedAmberCount > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 text-amber-300 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {unresolvedAmberCount} Amber Flag{unresolvedAmberCount > 1 ? 's' : ''} to Verify
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-emerald-300 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    All Fields High Confidence
                  </span>
                )}
              </div>
            </div>

            {/* Candidate Cards List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {extractionNotice && (
                <div className="flex items-start justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>{extractionNotice}</span>
                  </div>
                  <button
                    onClick={() => setExtractionNotice(null)}
                    className="rounded-lg p-1 text-amber-400 hover:text-white hover:bg-slate-800 shrink-0"
                    title="Dismiss notice"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {candidates.map((cand) => {
                const unresolvedFlags = cand.ambiguity_flags.filter((f) => !f.resolved);
                const hasEndTimeFlag = unresolvedFlags.some((f) => f.field === 'end_time');
                const hasDateFlag = unresolvedFlags.some((f) => f.field === 'occurrence_date');
                const hasPerformerFlag = unresolvedFlags.some((f) => f.field === 'performer_name');

                return (
                  <div
                    key={cand.id}
                    className={`rounded-2xl border p-4 transition ${
                      !cand.selected
                        ? 'border-slate-800 bg-slate-950/40 opacity-50'
                        : unresolvedFlags.length > 0
                        ? 'border-amber-500/50 bg-slate-950/90 shadow-lg shadow-amber-950/10'
                        : 'border-slate-700/80 bg-slate-950/90'
                    }`}
                  >
                    {/* Card Top Bar: Checkbox + Diff Status Badge + Confidence */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                      <label className="inline-flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cand.selected}
                          onChange={(e) =>
                            updateCandidate(cand.id, { selected: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          {cand.is_recurring ? '🔁 Weekly Recurring Template' : '📅 One-Off Calendar Event'}
                        </span>
                      </label>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Fuzzy Diff Upsert Badge */}
                        {cand.diff_match?.matchType === 'update' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 border border-sky-400/40 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
                            🔄 UPDATE (Diff): {cand.diff_match.summaryText}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                            ✨ NEW: {cand.diff_match?.summaryText}
                          </span>
                        )}

                        <span
                          className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${
                            cand.confidence_score >= 0.9
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          AI Conf: {Math.round(cand.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Amber Ambiguity Warning Callout Box */}
                    {unresolvedFlags.length > 0 && (
                      <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                          <span>Ambiguous Flyer Fields Flagged for Quick Review:</span>
                        </div>
                        {unresolvedFlags.map((flag, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-950/70 px-3 py-1.5 text-xs"
                          >
                            <div className="text-amber-100/90">
                              <span className="font-mono font-semibold text-amber-300">
                                [{flag.field}]
                              </span>{' '}
                              {flag.reason}
                            </div>
                            <button
                              type="button"
                              onClick={() => resolveFlag(cand.id, flag.field)}
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-slate-950 transition shrink-0"
                            >
                              <Check className="h-3 w-3" />
                              {flag.suggested_fix}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Editable Fields Grid */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Category
                        </label>
                        <select
                          value={cand.category}
                          onChange={(e) =>
                            updateCandidate(cand.id, {
                              category: e.target.value as EventCategory,
                            })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="happy_hour">🍻 Happy Hour</option>
                          <option value="daily_special">🦪 Food / Drink Special</option>
                          <option value="live_music">🎸 Live Music / DJ</option>
                          <option value="trivia_event">🎯 Trivia / Event</option>
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Schedule Mode
                        </label>
                        <select
                          value={cand.is_recurring ? 'recurring' : 'one_off'}
                          onChange={(e) =>
                            updateCandidate(cand.id, {
                              is_recurring: e.target.value === 'recurring',
                              days_of_week:
                                e.target.value === 'recurring' && cand.days_of_week.length === 0
                                  ? [5, 6]
                                  : cand.days_of_week,
                            })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="one_off">Single Date Event</option>
                          <option value="recurring">Weekly Recurring Rule</option>
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        {cand.is_recurring ? (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Days of Week
                            </label>
                            <div className="flex items-center gap-1">
                              {DAY_LABELS.map((dLabel, dow) => {
                                const active = cand.days_of_week.includes(dow);
                                return (
                                  <button
                                    key={dLabel}
                                    type="button"
                                    onClick={() => {
                                      const next = active
                                        ? cand.days_of_week.filter((d) => d !== dow)
                                        : [...cand.days_of_week, dow];
                                      updateCandidate(cand.id, { days_of_week: next });
                                    }}
                                    className={`px-1.5 py-1 rounded text-[10px] font-bold transition ${
                                      active
                                        ? 'bg-amber-500 text-slate-950'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {dLabel[0]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Event Date {hasDateFlag && '⚠️'}
                            </label>
                            <input
                              type="date"
                              value={cand.occurrence_date}
                              onChange={(e) =>
                                updateCandidate(cand.id, {
                                  occurrence_date: e.target.value,
                                })
                              }
                              className={`w-full rounded-lg border px-2.5 py-1.5 text-xs text-white ${
                                hasDateFlag
                                  ? 'border-amber-500 bg-amber-500/10'
                                  : 'border-slate-700 bg-slate-900'
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Event Title & Performer */}
                      <div className="sm:col-span-7">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Headline / Event Title
                        </label>
                        <input
                          type="text"
                          value={cand.title}
                          onChange={(e) =>
                            updateCandidate(cand.id, { title: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white"
                        />
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Band / Performer Name {hasPerformerFlag && '⚠️'}
                        </label>
                        <input
                          type="text"
                          placeholder="Optional (for Live Music)"
                          value={cand.performer_name || ''}
                          onChange={(e) =>
                            updateCandidate(cand.id, {
                              performer_name: e.target.value || null,
                            })
                          }
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-xs text-white ${
                            hasPerformerFlag
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-slate-700 bg-slate-900'
                          }`}
                        />
                      </div>

                      {/* Time Window & Open-Ended Label */}
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Start Time (24h)
                        </label>
                        <input
                          type="time"
                          value={cand.start_time}
                          onChange={(e) =>
                            updateCandidate(cand.id, { start_time: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          End Time (Sort Cutoff) {hasEndTimeFlag && '⚠️'}
                        </label>
                        <input
                          type="time"
                          value={cand.end_time}
                          onChange={(e) =>
                            updateCandidate(cand.id, { end_time: e.target.value })
                          }
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-xs text-white ${
                            hasEndTimeFlag
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-slate-700 bg-slate-900'
                          }`}
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Display End Label (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder='e.g. "Close" or "Late"'
                          value={cand.end_time_label || ''}
                          onChange={(e) =>
                            updateCandidate(cand.id, {
                              end_time_label: e.target.value || null,
                            })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Deals Summary Bullets */}
                    <div className="mt-3">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                        Structured Deal Bullets (`deals_summary` JSONB)
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {cand.deals_summary.map((deal, dIdx) => (
                          <span
                            key={dIdx}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/90 border border-slate-700 px-2.5 py-1 text-xs text-amber-200"
                          >
                            <span>{deal}</span>
                            <button
                              type="button"
                              onClick={() => removeDealBullet(cand.id, dIdx)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder='Add deal bullet (e.g. "$6 Orange Crushes" or "75¢ Wings")'
                          value={newDealInputs[cand.id] || ''}
                          onChange={(e) =>
                            setNewDealInputs((prev) => ({
                              ...prev,
                              [cand.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addDealBullet(cand.id);
                            }
                          }}
                          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => addDealBullet(cand.id)}
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200"
                        >
                          + Add Bullet
                        </button>
                      </div>
                    </div>

                    {/* Standardized Filter Tags */}
                    <div className="mt-3">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                        Searchable Filter Tags
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {TAG_METADATA.map((tagMeta) => {
                          const active = cand.tags.includes(tagMeta.id);
                          return (
                            <button
                              key={tagMeta.id}
                              type="button"
                              onClick={() => toggleTag(cand.id, tagMeta.id)}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
                                active
                                  ? 'bg-amber-500/25 border border-amber-400/60 text-amber-200'
                                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span>{tagMeta.emoji}</span>
                              <span>{tagMeta.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950 px-4 py-3">
              <div className="text-xs text-slate-400">
                <strong className="text-white">{selectedCount}</strong> item{selectedCount === 1 ? '' : 's'} selected for upsert into North Wildwood calendar
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={() => {
                    const approved = candidates.filter((c) => c.selected);
                    onPublishCandidates(approved, flyerImageUrl);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Approve &amp; Upsert {selectedCount} Item{selectedCount === 1 ? '' : 's'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
