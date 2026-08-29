import React, { useState } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { 
  Calendar, 
  Clock, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Settings2, 
  RotateCcw,
  Sparkles,
  Flame
} from 'lucide-react';
import { differenceInDays, parseISO, addDays, format } from 'date-fns';
import { cn } from '../lib/utils';

export function TimelineGoalCard() {
  const { 
    problems, 
    targetTimelineDays, 
    timelineStartDate, 
    setTargetTimeline 
  } = useTrackerStore();

  const [isEditing, setIsEditing] = useState(false);
  const [customDays, setCustomDays] = useState(targetTimelineDays.toString());

  const total = problems.length;
  const completed = problems.filter(p => p.completed).length;
  const remaining = total - completed;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Calculate day metrics
  const startDate = timelineStartDate ? parseISO(timelineStartDate) : new Date();
  const rawDaysPassed = Math.max(1, differenceInDays(new Date(), startDate) + 1);
  const daysPassed = Math.min(targetTimelineDays, rawDaysPassed);
  const daysRemaining = Math.max(0, targetTimelineDays - daysPassed);
  const timePercentage = Math.min(100, Math.round((daysPassed / targetTimelineDays) * 100));

  const targetEndDate = addDays(startDate, targetTimelineDays);

  // Pace calculations
  const requiredPace = daysRemaining > 0 
    ? (remaining / daysRemaining).toFixed(1) 
    : remaining.toString();

  const expectedCompletedByNow = Math.min(total, Math.round((daysPassed / targetTimelineDays) * total));
  const diffFromExpected = completed - expectedCompletedByNow;

  const handlePresetSelect = (days: number) => {
    setTargetTimeline(days, new Date().toISOString());
    setCustomDays(days.toString());
    setIsEditing(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customDays, 10);
    if (!isNaN(val) && val >= 1 && val <= 365) {
      setTargetTimeline(val, new Date().toISOString());
      setIsEditing(false);
    } else {
      alert('Please enter a valid duration between 1 and 365 days.');
    }
  };

  const handleRestartTimeline = () => {
    if (confirm('Restart timeline from today with current duration?')) {
      setTargetTimeline(targetTimelineDays, new Date().toISOString());
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm relative overflow-hidden transition-all">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              Timeline Goal Tracker
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                {targetTimelineDays} Days Plan
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Finish target date: <strong className="text-foreground">{format(targetEndDate, 'MMM dd, yyyy')}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors",
              isEditing 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
            )}
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>{isEditing ? 'Close Settings' : 'Adjust Goal'}</span>
          </button>

          <button
            onClick={handleRestartTimeline}
            className="p-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Restart timeline from today"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Edit Goal Drawer */}
      {isEditing && (
        <div className="mb-6 p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-xs font-bold text-foreground">Select Target Duration:</span>
          
          <div className="flex flex-wrap gap-2">
            {[15, 30, 45, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => handlePresetSelect(d)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  targetTimelineDays === d
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border hover:bg-muted text-muted-foreground"
                )}
              >
                {d} Days {d === 30 && '⭐ (Recommended)'}
              </button>
            ))}
          </div>

          <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground font-medium">Or custom days:</span>
            <input
              type="number"
              min="1"
              max="365"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              className="w-20 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-mono font-bold focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Set Goal
            </button>
          </form>
        </div>
      )}

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* Days Left */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Day Progress</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-foreground font-mono">Day {daysPassed}</span>
            <span className="text-xs font-semibold text-muted-foreground">/{targetTimelineDays}</span>
          </div>
          <span className="text-[11px] text-indigo-400 font-medium">{daysRemaining} days left</span>
        </div>

        {/* Required Pace */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Target Pace</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-indigo-500 font-mono">{requiredPace}</span>
            <span className="text-xs font-semibold text-muted-foreground">/ day</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">{remaining} to complete</span>
        </div>

        {/* Problems Solved */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Solved Status</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-emerald-500 font-mono">{completed}</span>
            <span className="text-xs font-semibold text-muted-foreground">/{total}</span>
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">{completionPercentage}% done</span>
        </div>

        {/* Schedule Health */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Timeline Status</span>
          <div className="mt-1 flex items-center gap-1">
            {diffFromExpected >= 2 ? (
              <span className="text-sm font-extrabold text-emerald-500 flex items-center gap-1">
                <Zap className="h-4 w-4 fill-emerald-500" /> Ahead (+{diffFromExpected})
              </span>
            ) : diffFromExpected >= 0 ? (
              <span className="text-sm font-extrabold text-indigo-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> On Track
              </span>
            ) : (
              <span className="text-sm font-extrabold text-amber-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> Behind ({diffFromExpected})
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">Expected: {expectedCompletedByNow} solved</span>
        </div>
      </div>

      {/* Comparative Progress Bars */}
      <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/60">
        {/* Problems Solved Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Problem Completion
            </span>
            <span className="font-mono text-emerald-500 font-bold">{completed}/{total} ({completionPercentage}%)</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Time Elapsed Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              Time Elapsed
            </span>
            <span className="font-mono text-muted-foreground font-bold">{daysPassed}/{targetTimelineDays} Days ({timePercentage}%)</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${timePercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
