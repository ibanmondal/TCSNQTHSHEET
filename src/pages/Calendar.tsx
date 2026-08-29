import { useTrackerStore } from '../store/useTrackerStore';
import { eachDayOfInterval, subDays, format, isSameDay, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { cn } from '../lib/utils';

export function Calendar() {
  const problems = useTrackerStore(state => state.problems);

  // Generate last 112 days (16 weeks * 7 days)
  const days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 111);
    
    return eachDayOfInterval({ start, end }).map(date => {
      // Find problems completed on this date
      const completedOnDate = problems.filter(p => 
        p.completedDate && isSameDay(parseISO(p.completedDate), date)
      );
      
      const revisedOnDate = problems.filter(p => 
        p.revisionHistory.some(r => isSameDay(parseISO(r.date), date))
      );
      
      return {
        date,
        completedCount: completedOnDate.length,
        revisedCount: revisedOnDate.length,
        problems: completedOnDate
      };
    });
  }, [problems]);

  // Group into weeks for the grid
  const weeks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < days.length; i += 7) {
      chunks.push(days.slice(i, i + 7));
    }
    return chunks;
  }, [days]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-1">
          Your DSA activity history over the last 112 days.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day, dIdx) => {
                const intensity = 
                  day.completedCount === 0 ? 0 :
                  day.completedCount <= 1 ? 1 :
                  day.completedCount <= 3 ? 2 :
                  day.completedCount <= 5 ? 3 : 4;
                  
                return (
                  <div
                    key={dIdx}
                    title={`${format(day.date, 'MMM d, yyyy')}: ${day.completedCount} solved, ${day.revisedCount} revised`}
                    className={cn(
                      "h-3 w-3 rounded-[2px] transition-colors hover:ring-2 hover:ring-primary/50 cursor-pointer",
                      intensity === 0 && "bg-muted",
                      intensity === 1 && "bg-success/40",
                      intensity === 2 && "bg-success/60",
                      intensity === 3 && "bg-success/80",
                      intensity === 4 && "bg-success"
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="h-3 w-3 rounded-[2px] bg-muted"></div>
          <div className="h-3 w-3 rounded-[2px] bg-success/40"></div>
          <div className="h-3 w-3 rounded-[2px] bg-success/60"></div>
          <div className="h-3 w-3 rounded-[2px] bg-success/80"></div>
          <div className="h-3 w-3 rounded-[2px] bg-success"></div>
          <span>More</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <div className="space-y-3">
          {days
            .filter(d => d.completedCount > 0 || d.revisedCount > 0)
            .reverse() // Newest first
            .slice(0, 10) // Show last 10 active days
            .map((day, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold text-sm mb-3 pb-2 border-b border-border">
                {format(day.date, 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="flex flex-col gap-2">
                <p className="text-sm">
                  <span className="font-medium text-success">{day.completedCount}</span> problems completed
                </p>
                {day.completedCount > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {day.problems.map(p => (
                      <span key={p.id} className="text-xs bg-muted px-2 py-1 rounded">
                        #{p.id} {p.title}
                      </span>
                    ))}
                  </div>
                )}
                {day.revisedCount > 0 && (
                  <p className="text-sm mt-2 text-muted-foreground">
                    + {day.revisedCount} problems revised
                  </p>
                )}
              </div>
            </div>
          ))}
          {days.filter(d => d.completedCount > 0 || d.revisedCount > 0).length === 0 && (
            <div className="text-center py-8 text-muted-foreground border border-border rounded-lg border-dashed">
              No recent activity to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
