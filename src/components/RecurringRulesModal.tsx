import React from 'react';
import { Calendar, CheckCircle2, RefreshCw, Repeat, X } from 'lucide-react';
import { RecurringRule, Venue } from '../types/calendar';

interface RecurringRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: RecurringRule[];
  venues: Venue[];
  onToggleRule: (ruleId: string) => void;
  onRematerialize: () => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const RecurringRulesModal: React.FC<RecurringRulesModalProps> = ({
  isOpen,
  onClose,
  rules,
  venues,
  onToggleRule,
  onRematerialize,
}) => {
  if (!isOpen) return null;

  const venueMap = new Map(venues.map((v) => [v.id, v]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6">
      <div className="flex flex-col w-full max-w-4xl max-h-[88vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
              <Repeat className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Recurring Happy Hour &amp; Weekly Special Templates (`recurring_rules`)
              </h2>
              <p className="text-xs text-slate-400">
                Templates automatically materialize concrete `calendar_occurrences` rows 21–30 days ahead while preserving single-date overrides.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 p-1.5 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {rules.map((rule) => {
            const venue = venueMap.get(rule.venue_id);
            return (
              <div
                key={rule.id}
                className={`rounded-xl border p-4 transition ${
                  rule.is_active
                    ? 'border-slate-800 bg-slate-950/80'
                    : 'border-slate-800/50 bg-slate-950/30 opacity-55'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {venue?.name || 'Venue'}
                      </span>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                        {rule.category === 'happy_hour'
                          ? '🍻 Happy Hour'
                          : rule.category === 'daily_special'
                          ? '🦪 Weekly Special'
                          : '🎯 Weekly Trivia'}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                      {rule.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                      {rule.start_time} – {rule.end_time_label || rule.end_time || 'Close'}
                    </span>
                    <button
                      onClick={() => onToggleRule(rule.id)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                        rule.is_active
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rule.is_active ? 'Active' : 'Paused'}
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    {DAY_NAMES.map((dName, idx) => {
                      const activeDay = rule.days_of_week.includes(idx);
                      return (
                        <span
                          key={dName}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            activeDay
                              ? 'bg-amber-500/25 border border-amber-500/50 text-amber-200'
                              : 'bg-slate-900 text-slate-600'
                          }`}
                        >
                          {dName}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {rule.deals_summary.map((deal, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-xs text-slate-300"
                      >
                        {deal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950 px-5 py-3">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-sky-400" />
            Single-date exceptions (`is_exception = true`) are protected during re-materialization.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onRematerialize}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Re-Materialize Rolling Window
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
