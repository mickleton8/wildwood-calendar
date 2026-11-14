import React, { useEffect, useMemo, useState } from 'react';
import {
  Beer,
  Building2,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Cloud,
  Database,
  ExternalLink,
  Eye,
  FileImage,
  Flame,
  KeyRound,
  Lock,
  MapPin,
  MoreVertical,
  Music,
  Phone,
  PlusCircle,
  Radio,
  Repeat,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Unlock,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { FlyerLightboxModal } from './components/FlyerLightboxModal';
import { RecurringRulesModal } from './components/RecurringRulesModal';
import { SplitScreenReviewer } from './components/SplitScreenReviewer';
import {
  ANCHOR_DATE,
  materializeRecurringRulesClient,
  TAG_METADATA,
} from './data/seedData';
import { CORRIDOR_AREAS, CorridorArea } from './data/venuesRoster';
import {
  cancelOccurrenceInCloud,
  fetchCloudData,
  getEasternNow,
  isCrewUnlocked,
  isSupabaseConfigured,
  loadInitialData,
  persistData,
  rematerializeInCloud,
  resetToSeedData,
  setCrewUnlocked,
  supabase,
  syncApprovedItemsToCloud,
  toggleRuleInCloud,
  updateVenueSeasonalStatusInCloud,
} from './lib/supabase';
import {
  CalendarOccurrence,
  EventCategory,
  ExtractedCandidateItem,
  FilterTag,
  RecurringRule,
  SeasonalStatus,
  Venue,
} from './types/calendar';

const EXPECTED_CREW_PIN = (import.meta.env.VITE_CREW_PIN as string) || '1922';

type TimeFilterMode = 'all_day' | 'happening_now';
type ClockSourceMode = 'live_eastern' | 'simulated';

function format12Hour(time24: string, label?: string | null): string {
  if (label) return label;
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = mStr || '00';
  if (h === 23 && m === '59') return 'Close';
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === '00' ? `${h12} ${period}` : `${h12}:${m} ${period}`;
}

function timeToMinutes(time24: string): number {
  const [h, m] = time24.split(':').map((n) => parseInt(n || '0', 10));
  return h * 60 + m;
}

function getNext10Days(anchorDateStr: string) {
  const [y, m, d] = anchorDateStr.split('-').map(Number);
  const days: {
    dateStr: string;
    dayShort: string;
    monthDay: string;
    isToday: boolean;
    specialLabel?: string;
  }[] = [];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  for (let i = 0; i < 22; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d + i, 12, 0, 0));
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(dt.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dow = dt.getUTCDay();
    days.push({
      dateStr,
      dayShort:
        i === 0
          ? `Today (${dayNames[dow]})`
          : i === 1
          ? `Tomorrow (${dayNames[dow]})`
          : dayNames[dow],
      monthDay: `${monthNames[dt.getUTCMonth()]} ${dt.getUTCDate()}`,
      isToday: i === 0,
      specialLabel: dateStr === '2026-10-31' ? '🎃 Halloween' : undefined,
    });
  }
  return days;
}

/**
 * Highlights dollar prices, 'Free', '2x', and percentage discounts inside deals_summary
 * strings with high-contrast colored typography for effortless skimming.
 */
function renderHighlightedDeal(deal: string, category: EventCategory) {
  const parts = deal.split(/(\$\d+(?:\.\d{2})?|\bFree\b|\b2x\b|\b\d+%\s+off\b)/i);

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = /^(\$\d+(?:\.\d{2})?|Free|2x|\d+%\s+off)$/i.test(part);
        if (isMatch) {
          return (
            <span
              key={i}
              className={`font-black tracking-tight ${
                category === 'live_music'
                  ? 'text-indigo-300'
                  : 'text-amber-300'
              }`}
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function App() {
  const easternInitial = useMemo(() => getEasternNow(), []);
  const activeAnchorDate = easternInitial.dateStr || ANCHOR_DATE;

  const initial = useMemo(() => loadInitialData(), []);
  const [venues, setVenues] = useState<Venue[]>(initial.venues);
  const [rules, setRules] = useState<RecurringRule[]>(initial.rules);
  const [occurrences, setOccurrences] = useState<CalendarOccurrence[]>(
    initial.occurrences
  );
  const [cloudSynced, setCloudSynced] = useState<boolean>(false);

  // Navigation & Filters
  const [selectedDate, setSelectedDate] = useState<string>(activeAnchorDate);
  const [liveEasternDate, setLiveEasternDate] = useState<string>(
    easternInitial.dateStr || ANCHOR_DATE
  );
  const [selectedArea, setSelectedArea] = useState<'all' | CorridorArea>('all');
  const [timeMode, setTimeMode] = useState<TimeFilterMode>('all_day');
  const [clockSource, setClockSource] = useState<ClockSourceMode>('live_eastern');
  const [liveEasternTime, setLiveEasternTime] = useState<string>(
    easternInitial.time24
  );
  const [simulatedClock, setSimulatedClock] = useState<string>('16:30');

  const [selectedCategory, setSelectedCategory] = useState<'all' | EventCategory>('all');
  const [selectedTags, setSelectedTags] = useState<FilterTag[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Crew Mode & Modals
  const [crewUnlocked, setCrewUnlockedState] = useState<boolean>(() =>
    isCrewUnlocked()
  );
  const [showPinPrompt, setShowPinPrompt] = useState<boolean>(false);
  const [showPwaGuide, setShowPwaGuide] = useState<boolean>(false);
  const [showVenuesDirectory, setShowVenuesDirectory] = useState<boolean>(false);
  const [directoryStatusFilter, setDirectoryStatusFilter] = useState<'all' | SeasonalStatus>('all');
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isReviewerOpen, setIsReviewerOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [lightboxFlyer, setLightboxFlyer] = useState<{
    url: string;
    title: string;
    venueName: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToolsMenu, setShowToolsMenu] = useState<boolean>(false);
  const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(false);

  // Tick real-time America/New_York clock every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const { dateStr, time24 } = getEasternNow();
      setLiveEasternDate(dateStr || ANCHOR_DATE);
      setLiveEasternTime(time24);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync with Supabase Cloud on mount & subscribe to real-time changes if configured
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    let mounted = true;
    const loadFromCloud = async () => {
      const data = await fetchCloudData();
      if (mounted && data) {
        setVenues(data.venues);
        setRules(data.rules);
        setOccurrences(data.occurrences);
        setCloudSynced(true);
      }
    };

    loadFromCloud();

    const channel = client
      .channel('wildwood-pulse-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calendar_occurrences' },
        () => {
          loadFromCloud();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recurring_rules' },
        () => {
          loadFromCloud();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    persistData(venues, rules, occurrences);
  }, [venues, rules, occurrences]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const daysList = useMemo(
    () => getNext10Days(activeAnchorDate),
    [activeAnchorDate]
  );
  const venueMap = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);

  const venuesInSelectedArea = useMemo(() => {
    if (selectedArea === 'all') return venues;
    return venues.filter((v) => v.neighborhood === selectedArea);
  }, [venues, selectedArea]);

  const activeClockTime =
    clockSource === 'live_eastern' ? liveEasternTime : simulatedClock;
  const nowMinutes = useMemo(
    () => timeToMinutes(activeClockTime),
    [activeClockTime]
  );

  // Compute live status for an occurrence relative to activeClockTime
  const getLiveStatus = (occ: CalendarOccurrence) => {
    // Dynamic countdowns and active badges only apply on today's date
    if (occ.occurrence_date !== liveEasternDate) {
      return { state: 'other_day' as const, label: '' };
    }

    const startMin = timeToMinutes(occ.start_time_local);
    const endMin = timeToMinutes(occ.end_time_local);
    const effectiveEnd = endMin <= startMin ? endMin + 24 * 60 : endMin;

    if (nowMinutes >= startMin && nowMinutes <= effectiveEnd) {
      const remaining = effectiveEnd - nowMinutes;
      const hrs = Math.floor(remaining / 60);
      const mins = remaining % 60;
      const label =
        occ.end_time_label === 'Close'
          ? 'Active Now • Till Close'
          : hrs > 0
          ? `Active Now • Ends in ${hrs}h ${mins}m`
          : `Ending Soon • ${mins}m left`;
      return { state: 'active' as const, label };
    }

    if (startMin > nowMinutes && startMin - nowMinutes <= 90) {
      const until = startMin - nowMinutes;
      return {
        state: 'starting_soon' as const,
        label: `Starts in ${until}m (${format12Hour(occ.start_time_local)})`,
      };
    }

    if (nowMinutes > effectiveEnd) {
      return { state: 'ended' as const, label: 'Ended earlier today' };
    }

    return {
      state: 'upcoming' as const,
      label: `Starts at ${format12Hour(occ.start_time_local)}`,
    };
  };

  const filteredOccurrences = useMemo(() => {
    return occurrences
      .filter((occ) => {
        if (occ.is_cancelled) return false;
        if (occ.occurrence_date !== selectedDate) return false;
        const venue = venueMap.get(occ.venue_id);
        if (venue?.seasonal_status === 'closed_for_season') return false;
        if (
          venue &&
          Array.isArray(venue.open_days_of_week) &&
          venue.open_days_of_week.length > 0 &&
          !occ.is_exception
        ) {
          const [y, m, d] = occ.occurrence_date.split('-').map(Number);
          const dow = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
          if (!venue.open_days_of_week.includes(dow)) return false;
        }
        if (selectedArea !== 'all' && venue?.neighborhood !== selectedArea) {
          return false;
        }
        if (selectedVenueId !== 'all' && occ.venue_id !== selectedVenueId) {
          return false;
        }
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'happy_hour') {
            if (occ.category !== 'happy_hour' && occ.category !== 'daily_special') {
              return false;
            }
          } else if (occ.category !== selectedCategory) {
            return false;
          }
        }
        if (selectedTags.length > 0) {
          const hasAllSelectedTags = selectedTags.every((t) =>
            occ.tags.includes(t)
          );
          if (!hasAllSelectedTags) return false;
        }
        if (timeMode === 'happening_now') {
          if (occ.occurrence_date !== liveEasternDate) return false;
          const status = getLiveStatus(occ);
          if (status.state !== 'active' && status.state !== 'starting_soon') {
            return false;
          }
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const haystack = [
            occ.title,
            occ.performer_name || '',
            venue?.name || '',
            venue?.neighborhood || '',
            ...occ.deals_summary,
            ...occ.tags,
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (timeMode === 'happening_now') {
          const sA = getLiveStatus(a).state === 'active' ? 0 : 1;
          const sB = getLiveStatus(b).state === 'active' ? 0 : 1;
          if (sA !== sB) return sA - sB;
        }
        return a.start_time_local.localeCompare(b.start_time_local);
      });
  }, [
    occurrences,
    selectedDate,
    selectedArea,
    selectedVenueId,
    selectedCategory,
    selectedTags,
    timeMode,
    activeClockTime,
    liveEasternDate,
    searchQuery,
    venueMap,
  ]);

  const handlePublishCandidates = async (
    approvedItems: ExtractedCandidateItem[],
    flyerImageUrl: string
  ) => {
    let nextRules = [...rules];
    let nextOccurrences = [...occurrences];
    let updatedCount = 0;
    let createdCount = 0;

    for (const item of approvedItems) {
      if (item.is_recurring) {
        if (
          item.diff_match?.matchType === 'update' &&
          item.diff_match.existingOccurrenceId
        ) {
          nextRules = nextRules.map((r) =>
            r.id === item.diff_match?.existingOccurrenceId
              ? {
                  ...r,
                  title: item.title,
                  days_of_week: item.days_of_week,
                  start_time: item.start_time,
                  end_time: item.end_time,
                  end_time_label: item.end_time_label || null,
                  deals_summary: item.deals_summary,
                  tags: item.tags,
                  notes: item.notes,
                }
              : r
          );
          updatedCount++;
        } else {
          nextRules.push({
            id: `rule_custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            venue_id: item.venue_id,
            category: item.category,
            title: item.title,
            days_of_week: item.days_of_week.length ? item.days_of_week : [5, 6],
            start_time: item.start_time,
            end_time: item.end_time,
            end_time_label: item.end_time_label || null,
            deals_summary: item.deals_summary,
            tags: item.tags,
            notes: item.notes,
            valid_from: activeAnchorDate,
            valid_until: null,
            is_active: true,
          });
          createdCount++;
        }
      } else {
        if (
          item.diff_match?.matchType === 'update' &&
          item.diff_match.existingOccurrenceId
        ) {
          nextOccurrences = nextOccurrences.map((occ) =>
            occ.id === item.diff_match?.existingOccurrenceId
              ? {
                  ...occ,
                  title: item.title,
                  performer_name: item.performer_name || null,
                  start_time_local: item.start_time,
                  end_time_local: item.end_time,
                  start_at: `${item.occurrence_date}T${item.start_time}:00-04:00`,
                  end_at: `${item.occurrence_date}T${item.end_time}:00-04:00`,
                  end_time_label: item.end_time_label || null,
                  deals_summary: item.deals_summary,
                  tags: item.tags,
                  cover_charge: item.cover_charge || 'No Cover',
                  notes: item.notes,
                  flyer_image_url: flyerImageUrl,
                  is_exception: true,
                  confidence_score: item.confidence_score,
                  updated_at: new Date().toISOString(),
                }
              : occ
          );
          updatedCount++;
        } else {
          nextOccurrences.push({
            id: `occ_custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            venue_id: item.venue_id,
            category: item.category,
            title: item.title,
            performer_name: item.performer_name || null,
            occurrence_date: item.occurrence_date,
            start_at: `${item.occurrence_date}T${item.start_time}:00-04:00`,
            end_at: `${item.occurrence_date}T${item.end_time}:00-04:00`,
            start_time_local: item.start_time,
            end_time_local: item.end_time,
            end_time_label: item.end_time_label || null,
            deals_summary: item.deals_summary,
            tags: item.tags,
            cover_charge: item.cover_charge || 'No Cover',
            notes: item.notes,
            flyer_image_url: flyerImageUrl,
            is_exception: false,
            is_cancelled: false,
            confidence_score: item.confidence_score,
            updated_at: new Date().toISOString(),
          });
          createdCount++;
        }
      }
    }

    const rematerialized = materializeRecurringRulesClient(
      nextRules,
      nextOccurrences,
      activeAnchorDate,
      21
    );
    setRules(nextRules);
    setOccurrences(rematerialized);

    if (approvedItems[0]?.occurrence_date) {
      setSelectedDate(approvedItems[0].occurrence_date);
    }

    if (isSupabaseConfigured) {
      const synced = await syncApprovedItemsToCloud(approvedItems, flyerImageUrl);
      if (synced) {
        const refreshed = await fetchCloudData();
        if (refreshed) {
          setVenues(refreshed.venues);
          setRules(refreshed.rules);
          setOccurrences(refreshed.occurrences);
        }
      }
    }

    showToast(
      `Published! (${createdCount} new, ${updatedCount} existing updated via Fuzzy Diff)`
    );
  };

  const handleToggleTag = (tag: FilterTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleUnlockCrewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === EXPECTED_CREW_PIN) {
      setCrewUnlockedState(true);
      setCrewUnlocked(true);
      setShowPinPrompt(false);
      setPinInput('');
      setPinError('');
      showToast('Trusted Crew Mode Unlocked! You can now drop flyers & edit schedules.');
    } else {
      setPinError('Incorrect PIN (Hint: Default North Wildwood Crew PIN is 1922)');
    }
  };

  const handleCancelSingleOccurrence = async (occId: string, title: string) => {
    setOccurrences((prev) =>
      prev.map((o) =>
        o.id === occId ? { ...o, is_cancelled: true, is_exception: true } : o
      )
    );
    if (isSupabaseConfigured) {
      await cancelOccurrenceInCloud(occId);
    }
    showToast(`Cancelled "${title}" for ${selectedDate} (protected from re-materialization).`);
  };

  const handleUpdateVenueSeasonalStatus = async (
    venue: Venue,
    nextStatus: SeasonalStatus
  ) => {
    const nextOpenDays =
      nextStatus === 'open'
        ? [0, 1, 2, 3, 4, 5, 6]
        : nextStatus === 'weekends_only'
        ? [4, 5, 6, 0]
        : [];
    const nextNote =
      nextStatus === 'open'
        ? 'Open Year-Round / Daily'
        : nextStatus === 'weekends_only'
        ? 'Off-Season Weekends (Thu–Sun)'
        : 'Closed for the Season — Reopens Spring';

    const nextVenues = venues.map((v) =>
      v.id === venue.id
        ? {
            ...v,
            is_year_round: nextStatus === 'open',
            seasonal_status: nextStatus,
            open_days_of_week: nextOpenDays,
            seasonal_note: nextNote,
          }
        : v
    );
    const nextRules = rules.map((r) =>
      r.venue_id === venue.id
        ? { ...r, is_active: nextStatus !== 'closed_for_season' }
        : r
    );
    setVenues(nextVenues);
    setRules(nextRules);
    setOccurrences(
      materializeRecurringRulesClient(
        nextRules,
        occurrences,
        activeAnchorDate,
        21,
        nextVenues
      )
    );

    if (isSupabaseConfigured) {
      await updateVenueSeasonalStatusInCloud(
        venue.id,
        nextStatus,
        nextOpenDays,
        nextNote
      );
    }

    showToast(
      `Updated ${venue.name} → ${
        nextStatus === 'open'
          ? '🟢 Open 7 Days'
          : nextStatus === 'weekends_only'
          ? '🟡 Off-Season Weekends (Thu–Sun)'
          : '❄️ Closed for Season (rules paused)'
      }`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 sm:pb-20">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-5 right-3 md:right-5 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-slate-900/95 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-300 shadow-2xl backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Sticky App Bar */}
      <header
        className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Brand Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black text-lg">
                WW
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-xl font-black tracking-tight text-white">
                    Wildwood Pulse
                  </h1>
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    {venues.length} Corridor Spots
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  North Wildwood, Wildwood, Crest &amp; Cape May Happy Hours &amp; Live Music
                </p>
              </div>
            </div>

            {/* Right Controls: Drop Flyer + Directory + Tools Overflow Dropdown */}
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => {
                  if (!crewUnlocked) {
                    setShowPinPrompt(true);
                  } else {
                    setIsReviewerOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 shrink-0" />
                <span>Drop Flyer</span>
              </button>

              <button
                onClick={() => setShowVenuesDirectory(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 active:scale-95 transition cursor-pointer"
                title={`Browse all ${venues.length} verified Corridor Bars, Restaurants & Breweries`}
              >
                <Building2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>All {venues.length} Spots</span>
              </button>

              {/* Tools Overflow Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setShowToolsMenu((prev) => !prev)}
                  className={`inline-flex items-center justify-center rounded-xl border p-2 text-xs font-semibold transition cursor-pointer active:scale-95 ${
                    showToolsMenu || crewUnlocked
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="More Tools, Rules & Settings"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {showToolsMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowToolsMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 w-60 rounded-2xl border border-slate-800 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl space-y-1">
                      <button
                        onClick={() => {
                          setIsRulesModalOpen(true);
                          setShowToolsMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                      >
                        <Repeat className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <div>
                          <div className="font-bold">Weekly Rules ({rules.length})</div>
                          <div className="text-[10px] text-slate-400">View recurring templates</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setShowPwaGuide(true);
                          setShowToolsMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                      >
                        <Smartphone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <div>
                          <div className="font-bold">Add to Phone</div>
                          <div className="text-[10px] text-slate-400">Install home screen PWA</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setShowToolsMenu(false);
                          if (crewUnlocked) {
                            setCrewUnlockedState(false);
                            setCrewUnlocked(false);
                            showToast('Crew Mode Locked.');
                          } else {
                            setShowPinPrompt(true);
                          }
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                      >
                        {crewUnlocked ? (
                          <>
                            <Unlock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <div>
                              <div className="font-bold text-emerald-300">Crew Mode (Unlocked)</div>
                              <div className="text-[10px] text-slate-400">Tap to lock contributor access</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <div>
                              <div className="font-bold">Crew PIN Mode</div>
                              <div className="text-[10px] text-slate-400">Enter crew passcode (1922)</div>
                            </div>
                          </>
                        )}
                      </button>

                      <div className="border-t border-slate-800/80 my-1" />

                      <button
                        onClick={() => {
                          setShowToolsMenu(false);
                          const reset = resetToSeedData();
                          setVenues(reset.venues);
                          setRules(reset.rules);
                          setOccurrences(reset.occurrences);
                          showToast(`Reset to verified ${venues.length}-venue corridor roster.`);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <div>
                          <div className="font-bold">Reset Local Cache</div>
                          <div className="text-[10px] text-slate-400">Clear cached browser state</div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Horizontal Day Scrubber */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {selectedDate !== liveEasternDate && (
              <button
                onClick={() => {
                  setSelectedDate(liveEasternDate);
                  setTimeMode('all_day');
                }}
                className="flex items-center gap-1.5 shrink-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-xs font-black text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
                title="Return to Today"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Today</span>
              </button>
            )}

            {daysList.map((d) => {
              const isSelected = d.dateStr === selectedDate;
              const isToday = d.dateStr === liveEasternDate;
              const isWeekend =
                d.dayShort.startsWith('Fri') ||
                d.dayShort.startsWith('Sat') ||
                d.dayShort.startsWith('Sun');
              const countForDay = occurrences.filter(
                (o) => !o.is_cancelled && o.occurrence_date === d.dateStr
              ).length;
              return (
                <button
                  key={d.dateStr}
                  onClick={() => {
                    setSelectedDate(d.dateStr);
                    if (d.dateStr !== liveEasternDate && timeMode === 'happening_now') {
                      setTimeMode('all_day');
                    }
                  }}
                  className={`relative flex flex-col items-start shrink-0 rounded-xl border px-3.5 py-2 text-left transition cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'border-amber-400 bg-gradient-to-b from-amber-500/25 to-amber-500/10 text-white shadow-lg shadow-amber-500/15 ring-1 ring-amber-400/50'
                      : isToday
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-slate-200 hover:border-emerald-500/60'
                      : 'border-slate-800/90 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-extrabold ${
                        isSelected
                          ? 'text-amber-300'
                          : isToday
                          ? 'text-emerald-300'
                          : isWeekend
                          ? 'text-sky-300'
                          : 'text-slate-200'
                      }`}
                    >
                      {d.dayShort}
                    </span>
                    <span className="rounded-full bg-slate-800/90 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
                      {countForDay}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>{d.monthDay}</span>
                    {isToday && (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                    )}
                    {d.specialLabel && (
                      <span className="text-amber-400 font-semibold">
                        • {d.specialLabel}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-6xl px-3 sm:px-6 pt-4 space-y-4">
        {/* Corridor Town / Area Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {CORRIDOR_AREAS.map((area) => {
            const active = selectedArea === area.id;
            const count =
              area.id === 'all'
                ? venues.length
                : venues.filter((v) => v.neighborhood === area.id).length;
            return (
              <button
                key={area.id}
                onClick={() => {
                  setSelectedArea(area.id);
                  setSelectedVenueId('all');
                }}
                className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-sky-500/20 border border-sky-400 text-sky-200 shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{area.emoji}</span>
                <span>{area.label}</span>
                <span className="rounded-full bg-slate-950/80 px-1.5 py-0.2 font-mono text-[10px] text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Now Bar + Real-Time Eastern Clock & Preview Presets (Only displayed for Today) */}
        {selectedDate === liveEasternDate && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:px-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTimeMode('all_day')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  timeMode === 'all_day'
                    ? 'bg-white text-slate-950 shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Full Day Schedule</span>
              </button>

              <button
                onClick={() => {
                  setTimeMode('happening_now');
                  setSelectedDate(liveEasternDate);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  timeMode === 'happening_now'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-950 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Happening Now / Starting Soon</span>
              </button>
            </div>

            {/* Live Eastern Time vs Preview Clock Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setClockSource('live_eastern')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                  clockSource === 'live_eastern'
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Uses actual real-time America/New_York clock"
              >
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span>Live Shore Time ({format12Hour(liveEasternTime)})</span>
              </button>

              <span className="text-slate-600 px-0.5">|</span>
              <span className="text-slate-400 hidden sm:inline items-center gap-1 text-[11px]">
                Preview:
              </span>
              {[
                { time: '16:30', label: '4:30 PM HH' },
                { time: '18:15', label: '6:15 PM Raw Bar' },
                { time: '21:00', label: '9:00 PM Bands' },
              ].map((preset) => (
                <button
                  key={preset.time}
                  onClick={() => {
                    setClockSource('simulated');
                    setSimulatedClock(preset.time);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                    clockSource === 'simulated' && simulatedClock === preset.time
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs + Search + Venue Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Events', icon: Sparkles },
              { id: 'happy_hour', label: '🍻 Happy Hours & Specials', icon: Beer },
              { id: 'live_music', label: '🎸 Live Music & DJs', icon: Music },
              { id: 'trivia_event', label: '🎯 Trivia & Games', icon: Flame },
            ].map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as 'all' | EventCategory)}
                  className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/15'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 focus:border-amber-500 focus:outline-none max-w-xs"
              aria-label="Filter by Venue"
            >
              <option value="all">
                📍 {selectedArea === 'all' ? 'All Corridor Venues' : selectedArea} ({venuesInSelectedArea.length})
              </option>
              {venuesInSelectedArea.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.neighborhood})
                </option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                id="search-input"
                type="text"
                placeholder="Search bands, crushes, wings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Standardized Filter Tag Scrubber */}
        <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Quick Filters</span>
              {selectedTags.length > 0 && (
                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.2 text-[10px] font-mono font-bold text-amber-300">
                  {selectedTags.length} active
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/25 transition cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  <span>Clear Filters</span>
                </button>
              )}

              <button
                onClick={() => setIsTagsExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition cursor-pointer"
              >
                <span>{isTagsExpanded ? 'Show Fewer' : `All Tags (${TAG_METADATA.length})`}</span>
                {isTagsExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 ${
              isTagsExpanded
                ? 'flex-wrap pt-1'
                : 'overflow-x-auto no-scrollbar py-0.5'
            }`}
          >
            {(isTagsExpanded
              ? TAG_METADATA
              : TAG_METADATA.slice(0, 8)
            ).map((tag) => {
              const active = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.id)}
                  className={`inline-flex items-center gap-1 shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer active:scale-95 ${
                    active
                      ? 'bg-amber-500/25 border border-amber-400 text-amber-200 shadow-sm ring-1 ring-amber-400/40'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span>{tag.emoji}</span>
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Cards Grid */}
        {filteredOccurrences.length === 0 ? (
          <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-8 sm:p-12 text-center space-y-4 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10 text-2xl">
              🏖️
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-white">
                No Events Match Your Filters
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                No scheduled specials or live music matched your current search, town, or tag filters for this date.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  setTimeMode('all_day');
                  setSelectedArea('all');
                  setSelectedCategory('all');
                  setSelectedTags([]);
                  setSelectedVenueId('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition cursor-pointer active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </button>
              <button
                onClick={() => setShowVenuesDirectory(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition cursor-pointer active:scale-95"
              >
                <Building2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Browse All {venues.length} Spots</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOccurrences.map((occ) => {
              const venue = venueMap.get(occ.venue_id);
              const isEventToday = occ.occurrence_date === liveEasternDate;
              const liveStatus = getLiveStatus(occ);
              const isLiveMusic = occ.category === 'live_music';

              return (
                <article
                  key={occ.id}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                    isEventToday && liveStatus.state === 'active'
                      ? 'border-emerald-500/60 bg-gradient-to-b from-slate-900 to-slate-900/95 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                      : isLiveMusic
                      ? 'border-indigo-500/35 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/15 hover:border-indigo-400/50 shadow-sm'
                      : occ.category === 'trivia_event'
                      ? 'border-purple-500/35 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/15 hover:border-purple-400/50 shadow-sm'
                      : 'border-slate-800/90 bg-gradient-to-b from-slate-900 to-slate-900/70 hover:border-amber-500/30 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black uppercase tracking-wide text-amber-400">
                            {venue?.name}
                          </span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                            {venue?.neighborhood}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            {venue?.cross_street}
                          </span>
                          {venue?.website_url && (
                            <a
                              href={venue.website_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-slate-800/80 hover:bg-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400 hover:text-sky-300 border border-slate-700 transition"
                              title={`Visit ${venue.name} official website`}
                            >
                              <span>Website</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {isEventToday && (
                        <div className="flex items-center gap-1.5">
                          {liveStatus.state === 'active' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                              {liveStatus.label}
                            </span>
                          )}
                          {liveStatus.state === 'starting_soon' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                              ⏳ {liveStatus.label}
                            </span>
                          )}
                          {liveStatus.state === 'upcoming' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                              {liveStatus.label}
                            </span>
                          )}
                          {liveStatus.state === 'ended' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 border border-slate-800 px-2.5 py-0.5 text-[11px] text-slate-500">
                              {liveStatus.label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-baseline justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              occ.category === 'live_music'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : occ.category === 'happy_hour'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : occ.category === 'trivia_event'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}
                          >
                            {occ.category === 'live_music'
                              ? '🎸 Live Music'
                              : occ.category === 'happy_hour'
                              ? '🍻 Happy Hour'
                              : occ.category === 'daily_special'
                              ? '🦪 Special'
                              : '🎯 Trivia'}
                          </span>

                          {occ.recurring_rule_id && !occ.is_exception && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Repeat className="h-3 w-3 text-sky-400" />
                              Weekly Staple
                            </span>
                          )}
                          {occ.is_exception && (
                            <span className="rounded bg-sky-500/20 border border-sky-500/40 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
                              🔄 Flyer Updated
                            </span>
                          )}
                        </div>

                        <h3 className="mt-1.5 text-base sm:text-lg font-black text-white leading-snug">
                          {occ.title}
                        </h3>

                        {occ.performer_name && (
                          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 text-xs font-bold text-indigo-200">
                            <Music className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span>Performer: {occ.performer_name}</span>
                            {occ.cover_charge && (
                              <span className="text-slate-400 font-normal">
                                • {occ.cover_charge}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="rounded-xl border border-slate-700/80 bg-slate-950/90 px-3 py-1 font-mono text-xs font-black text-slate-100 shadow-inner tracking-tight">
                          {format12Hour(occ.start_time_local)} –{' '}
                          {format12Hour(occ.end_time_local, occ.end_time_label)}
                        </div>
                      </div>
                    </div>

                    {occ.deals_summary.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {occ.deals_summary.map((deal, idx) => (
                          <li
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950/80 border border-slate-800/90 px-2.5 py-1 text-xs font-medium text-slate-200 shadow-sm"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                isLiveMusic
                                  ? 'bg-indigo-400'
                                  : occ.category === 'trivia_event'
                                  ? 'bg-purple-400'
                                  : 'bg-amber-400'
                              }`}
                            />
                            <span className="leading-snug">
                              {renderHighlightedDeal(deal, occ.category)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {occ.tags.map((tId) => {
                        const meta = TAG_METADATA.find((m) => m.id === tId);
                        if (!meta) return null;
                        return (
                          <span
                            key={tId}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-950 border border-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300"
                          >
                            <span>{meta.emoji}</span>
                            <span>{meta.label}</span>
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      {occ.flyer_image_url && (
                        <button
                          onClick={() =>
                            setLightboxFlyer({
                              url: occ.flyer_image_url!,
                              title: occ.title,
                              venueName: venue?.name || 'Venue',
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold text-amber-300 transition cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Verify Flyer</span>
                        </button>
                      )}

                      {crewUnlocked && (
                        <button
                          onClick={() =>
                            handleCancelSingleOccurrence(occ.id, occ.title)
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2 py-1 text-[11px] font-semibold text-rose-300 transition"
                          title="Soft-cancel this single occurrence (weather / private party override)"
                        >
                          <XCircle className="h-3 w-3" />
                          <span>Cancel Date</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Architecture & Pipeline Status Footer */}
        <footer className="mt-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <FileImage className="h-4 w-4 text-amber-400" />
            <span>
              <strong>Wildwood to Cape May Corridor Roster:</strong>{' '}
              {venues.length} verified venues • {rules.length} recurring rules •{' '}
              {occurrences.filter((o) => !o.is_cancelled).length} materialized occurrences
            </span>
          </div>
          <div className="flex items-center gap-2">
            {cloudSynced ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                <Cloud className="h-3.5 w-3.5" />
                Supabase Cloud Live Sync
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <Database className="h-3.5 w-3.5 text-amber-400" />
                Local Persisted Mode
              </span>
            )}
          </div>
        </footer>
      </main>

      {/* 57-Venue Corridor Directory Modal */}
      {showVenuesDirectory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))' }}
        >
          <div className="flex flex-col w-full max-w-5xl max-h-[88vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Verified Corridor Roster ({venues.length} Bars, Restaurants &amp; Breweries)
                  </h2>
                  <p className="text-xs text-slate-400">
                    3-Tier Off-Season Status: Closed venues are automatically paused from the live timeline
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: `All (${venues.length})` },
                    {
                      id: 'open',
                      label: `🟢 Open (${
                        venues.filter((v) => (v.seasonal_status || (v.is_year_round ? 'open' : 'closed_for_season')) === 'open').length
                      })`,
                    },
                    {
                      id: 'weekends_only',
                      label: `🟡 Weekends/Limited (${
                        venues.filter((v) => v.seasonal_status === 'weekends_only').length
                      })`,
                    },
                    {
                      id: 'closed_for_season',
                      label: `❄️ Closed for Season (${
                        venues.filter((v) => (v.seasonal_status || (v.is_year_round ? 'open' : 'closed_for_season')) === 'closed_for_season').length
                      })`,
                    },
                  ] as const
                ).map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setDirectoryStatusFilter(pill.id)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                      directoryStatusFilter === pill.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowVenuesDirectory(false)}
                  className="ml-1 rounded-xl border border-slate-800 p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              {CORRIDOR_AREAS.filter((a) => a.id !== 'all').map((area) => {
                const areaVenues = venues.filter((v) => {
                  if (v.neighborhood !== area.id) return false;
                  const effStatus: SeasonalStatus =
                    v.seasonal_status || (v.is_year_round ? 'open' : 'closed_for_season');
                  if (directoryStatusFilter !== 'all' && effStatus !== directoryStatusFilter) {
                    return false;
                  }
                  return true;
                });
                if (areaVenues.length === 0) return null;
                return (
                  <div key={area.id} className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <span>{area.emoji}</span>
                        <span>{area.label}</span>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                          {areaVenues.length} spots
                        </span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {areaVenues.map((v) => {
                        const effStatus: SeasonalStatus =
                          v.seasonal_status || (v.is_year_round ? 'open' : 'closed_for_season');
                        return (
                          <div
                            key={v.id}
                            className={`flex flex-col justify-between rounded-xl border p-3 transition ${
                              effStatus === 'closed_for_season'
                                ? 'border-slate-800/60 bg-slate-950/40 opacity-75'
                                : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-white">
                                  {v.name}
                                </h4>
                                <span
                                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                    effStatus === 'open'
                                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                      : effStatus === 'weekends_only'
                                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                  }`}
                                >
                                  {effStatus === 'open'
                                    ? '🟢 Open'
                                    : effStatus === 'weekends_only'
                                    ? '🟡 Weekends/Limited'
                                    : '❄️ Closed for Season'}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                                <span className="truncate">{v.address}</span>
                              </p>
                              {v.seasonal_note && (
                                <p className="mt-1 text-[10px] font-medium text-slate-300 bg-slate-900/80 rounded px-2 py-0.5 border border-slate-800/80">
                                  {v.seasonal_note}
                                </p>
                              )}
                            </div>

                            {crewUnlocked && (
                              <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between gap-1">
                                <span className="text-[10px] font-semibold text-slate-400">
                                  Crew Status:
                                </span>
                                <div className="flex items-center gap-1">
                                  {(
                                    [
                                      { id: 'open', label: '🟢 Open' },
                                      { id: 'weekends_only', label: '🟡 Wknds' },
                                      { id: 'closed_for_season', label: '❄️ Closed' },
                                    ] as const
                                  ).map((st) => (
                                    <button
                                      key={st.id}
                                      onClick={() => handleUpdateVenueSeasonalStatus(v, st.id)}
                                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition ${
                                        effStatus === st.id
                                          ? 'bg-amber-500 text-slate-950'
                                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                      }`}
                                    >
                                      {st.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between gap-2 text-[11px]">
                              <div className="flex items-center gap-2 text-slate-400">
                                {v.phone && (
                                  <a
                                    href={`tel:${v.phone}`}
                                    className="inline-flex items-center gap-1 hover:text-amber-300"
                                  >
                                    <Phone className="h-3 w-3" />
                                    <span>{v.phone}</span>
                                  </a>
                                )}
                                {v.website_url && (
                                  <a
                                    href={v.website_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-0.5 text-sky-400 hover:underline"
                                  >
                                    <span>Site</span>
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                )}
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedArea(v.neighborhood as CorridorArea);
                                  setSelectedVenueId(v.id);
                                  setShowVenuesDirectory(false);
                                }}
                                className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-200"
                              >
                                Filter Timeline
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Guide Modal for Friends & Family */}
      {showPwaGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))' }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Install Wildwood Pulse on Your Phone
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pin to your home screen for 1-tap access across the corridor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPwaGuide(false)}
                className="rounded-lg border border-slate-800 p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                <p className="font-bold text-amber-300">🍎 iPhone / iOS Safari</p>
                <p>
                  1. Tap the <strong>Share</strong> button at the bottom of Safari.
                </p>
                <p>
                  2. Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                <p className="font-bold text-emerald-300">🤖 Android Chrome</p>
                <p>
                  1. Tap the <strong>⋮ Menu</strong> in the top-right corner of Chrome.
                </p>
                <p>
                  2. Tap <strong>&ldquo;Add to Home screen&rdquo;</strong> or <strong>&ldquo;Install app&rdquo;</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowPwaGuide(false)}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crew PIN Unlock Modal */}
      {showPinPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))' }}
        >
          <form
            onSubmit={handleUnlockCrewSubmit}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Trusted Friends &amp; Family Crew Passcode
                </h3>
                <p className="text-xs text-slate-400">
                  Enter the shared crew PIN to drop flyers, review AI extractions, or override cancelled bands.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Shared Crew PIN (Default: <code className="text-amber-300">1922</code>)
              </label>
              <input
                type="password"
                autoFocus
                placeholder="Enter 1922"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
              />
              {pinError && (
                <p className="mt-1.5 text-xs font-medium text-rose-400">{pinError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowPinPrompt(false);
                  setPinError('');
                }}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950"
              >
                Unlock &amp; Open Flyer Reviewer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Split-Screen Flyer Vision Reviewer Modal */}
      <SplitScreenReviewer
        isOpen={isReviewerOpen}
        onClose={() => setIsReviewerOpen(false)}
        venues={venues}
        existingOccurrences={occurrences}
        existingRules={rules}
        crewPin={EXPECTED_CREW_PIN}
        onPublishCandidates={handlePublishCandidates}
      />

      {/* Recurring Rules Manager Modal */}
      <RecurringRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={rules}
        venues={venues}
        onToggleRule={async (ruleId) => {
          const target = rules.find((r) => r.id === ruleId);
          const nextActive = target ? !target.is_active : true;
          const nextRules = rules.map((r) =>
            r.id === ruleId ? { ...r, is_active: nextActive } : r
          );
          setRules(nextRules);
          setOccurrences(
            materializeRecurringRulesClient(
              nextRules,
              occurrences,
              activeAnchorDate,
              21
            )
          );
          if (isSupabaseConfigured) {
            await toggleRuleInCloud(ruleId, nextActive);
          }
        }}
        onRematerialize={async () => {
          setOccurrences(
            materializeRecurringRulesClient(
              rules,
              occurrences,
              activeAnchorDate,
              21
            )
          );
          if (isSupabaseConfigured) {
            await rematerializeInCloud();
          }
          showToast('Re-materialized rolling window of recurring rules (exceptions preserved).');
        }}
      />

      {/* Source Flyer Lightbox Modal */}
      <FlyerLightboxModal
        imageUrl={lightboxFlyer?.url || null}
        title={lightboxFlyer?.title || ''}
        venueName={lightboxFlyer?.venueName || ''}
        onClose={() => setLightboxFlyer(null)}
      />

      {/* Mobile Floating Quick Navigation Dock (< md screens) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-3 inset-x-3 z-40 md:hidden flex items-center justify-around rounded-2xl border border-slate-800/90 bg-slate-950/90 px-3 py-2 shadow-2xl backdrop-blur-xl"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          type="button"
          onClick={() => {
            setSelectedDate(liveEasternDate);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[11px] font-semibold transition-colors ${
            selectedDate === liveEasternDate
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="h-5 w-5" />
          <span>Today</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const input = document.getElementById('search-input');
            if (input) {
              input.focus();
              input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </button>

        {/* Center Prominent Action Button: Drop Flyer */}
        <button
          type="button"
          onClick={() => setIsReviewerOpen(true)}
          className="flex flex-col items-center -mt-5"
          aria-label="Drop Flyer & Vision AI Review"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30 active:scale-95 transition-transform">
            <PlusCircle className="h-6 w-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-amber-300 mt-1">Flyer AI</span>
        </button>

        <button
          type="button"
          onClick={() => setShowVenuesDirectory(true)}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[11px] font-semibold transition-colors ${
            showVenuesDirectory
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="h-5 w-5" />
          <span>{venues.length} Spots</span>
        </button>

        <button
          type="button"
          onClick={() => setShowToolsMenu((prev) => !prev)}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[11px] font-semibold transition-colors ${
            showToolsMenu
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span>Tools</span>
        </button>
      </nav>
    </div>
  );
}
export default App;
