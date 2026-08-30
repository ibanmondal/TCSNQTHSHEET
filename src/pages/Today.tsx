import { useTrackerStore } from '../store/useTrackerStore';
import { calculateStats } from '../lib/stats';
import { CheckCircle2, Circle, Settings2, Target, Zap, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ProblemModal } from '../components/ProblemModal';
import { cn } from '../lib/utils';

export function Today() {
  const { problems, dailyTarget, toggleCompletion } = useTrackerStore();
  const stats = calculateStats(problems, dailyTarget);
  const navigate = useNavigate();
  
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);

  const completedToday = problems.filter(p => {
    if (!p.completedDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return p.completedDate.startsWith(today) && p.completed;
  });

  const remainingNeeded = Math.max(0, dailyTarget - completedToday.length);
  const nextIncomplete = problems.filter(p => !p.completed).slice(0, remainingNeeded);

  const todaysList = [...completedToday, ...nextIncomplete].sort((a, b) => a.id - b.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Today's Daily Target</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Goal: <strong className="text-foreground">{stats.completedTodayCount}</strong> of <strong>{dailyTarget}</strong> problems solved today
          </p>
        </div>
        
        <Link 
          to="/settings" 
          className="inline-flex items-center gap-2 rounded-xl bg-muted/60 border border-border px-3.5 py-2 text-xs font-bold hover:bg-muted transition-colors shrink-0"
        >
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          Adjust Target
        </Link>
      </div>

      {/* Progress Bar Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-foreground">
            <Target className="h-4 w-4 text-blue-500" />
            Today's Progress
          </span>
          <span className="font-mono font-bold text-blue-500">
            {stats.completedTodayCount} / {dailyTarget} ({Math.min(100, Math.round((stats.completedTodayCount / dailyTarget) * 100))}%)
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 rounded-full" 
            style={{ width: `${Math.min(100, (stats.completedTodayCount / dailyTarget) * 100)}%` }}
          />
        </div>
      </div>

      {stats.completedTodayCount >= dailyTarget && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-500 text-center font-bold text-sm flex items-center justify-center gap-2">
          <Zap className="h-4 w-4 fill-emerald-500" />
          Awesome work! You've crushed your daily target for today!
        </div>
      )}

      {/* List of Problems */}
      <div className="space-y-3">
        {todaysList.map((problem) => (
          <div 
            key={problem.id}
            onClick={() => navigate(`/problem/${problem.id}`)}
            className={cn(
              "flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 hover:border-primary/50 transition-all cursor-pointer shadow-xs gap-3",
              problem.completed && "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20"
            )}
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompletion(problem.id);
                }}
                className="text-muted-foreground hover:scale-110 transition-transform shrink-0"
              >
                {problem.completed ? (
                  <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/40 hover:border-emerald-500 transition-colors" />
                )}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={cn(
                    "font-bold text-sm sm:text-base truncate",
                    problem.completed && "line-through text-muted-foreground"
                  )}>
                    #{problem.id} {problem.title}
                  </h3>
                  <span className={cn(
                    "px-2 py-0.2 rounded-full text-[10px] font-bold",
                    problem.difficulty === 'Easy' && "bg-emerald-500/10 text-emerald-500",
                    problem.difficulty === 'Medium' && "bg-amber-500/10 text-amber-500",
                    problem.difficulty === 'Hard' && "bg-rose-500/10 text-rose-500"
                  )}>
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{problem.category}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                Solve <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}

        {todaysList.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-border rounded-2xl border-dashed">
            You've completed all 100 problems in the sheet! 🏆
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
