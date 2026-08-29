import { useTrackerStore } from '../store/useTrackerStore';
import { calculateStats } from '../lib/stats';
import { CheckCircle2, Circle, Settings2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ProblemModal } from '../components/ProblemModal';
import type { Problem } from '../store/useTrackerStore';

export function Today() {
  const { problems, dailyTarget, toggleCompletion } = useTrackerStore();
  const stats = calculateStats(problems, dailyTarget);
  const navigate = useNavigate();
  
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);

  // Get up to `dailyTarget` problems to solve today.
  // We prioritize:
  // 1. Problems completed today (so they stay on the "Today" list once done)
  // 2. The first N incomplete problems to fill the rest of the target
  
  const completedToday = problems.filter(p => {
    if (!p.completedDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return p.completedDate.startsWith(today) && p.completed;
  });

  const remainingNeeded = Math.max(0, dailyTarget - completedToday.length);
  const nextIncomplete = problems.filter(p => !p.completed).slice(0, remainingNeeded);

  const todaysList = [...completedToday, ...nextIncomplete].sort((a, b) => a.id - b.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Today's Plan</h1>
          <p className="text-muted-foreground mt-1">
            Progress: {stats.completedTodayCount} / {dailyTarget} problems
          </p>
        </div>
        
        <Link 
          to="/settings" 
          className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
        >
          <Settings2 className="h-4 w-4" />
          Change Target
        </Link>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-in-out" 
          style={{ width: `${Math.min(100, (stats.completedTodayCount / dailyTarget) * 100)}%` }}
        />
      </div>

      {stats.completedTodayCount >= dailyTarget && (
        <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-success text-center font-medium">
          🎉 Awesome work! You've reached your daily target!
        </div>
      )}

      <div className="space-y-3">
        {todaysList.map((problem) => (
          <div 
            key={problem.id}
            onClick={() => {
              if (problem.leetcodeUrl) {
                setSelectedProblemId(problem.id);
              } else {
                navigate(`/problem/${problem.id}`);
              }
            }}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompletion(problem.id);
                }}
                className="text-muted-foreground hover:text-success transition-colors shrink-0"
              >
                {problem.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
              <div>
                <h3 className="font-medium">#{problem.id} {problem.title}</h3>
                <p className="text-sm text-muted-foreground">{problem.category}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {problem.completed && (
                <span className="text-sm font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
                  Completed
                </span>
              )}
            </div>
          </div>
        ))}

        {todaysList.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-border rounded-lg border-dashed">
            You've completed all problems! Incredible! 🏆
          </div>
        )}
      </div>

      {selectedProblemId && (
        <ProblemModal 
          problemId={selectedProblemId} 
          onClose={() => setSelectedProblemId(null)} 
        />
      )}
    </div>
  );
}
