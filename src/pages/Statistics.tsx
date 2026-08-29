import { useTrackerStore } from '../store/useTrackerStore';
import { calculateStats } from '../lib/stats';
import { PieChart, Activity, Target, CheckCircle2 } from 'lucide-react';

export function Statistics() {
  const { problems, dailyTarget } = useTrackerStore();
  const stats = calculateStats(problems, dailyTarget);

  const categories = Array.from(new Set(problems.map(p => p.category)));
  const categoryStats = categories.map(cat => {
    const catProblems = problems.filter(p => p.category === cat);
    return {
      name: cat,
      total: catProblems.length,
      completed: catProblems.filter(p => p.completed).length
    };
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground mt-1">
          Detailed breakdown of your DSA preparation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h3 className="font-semibold">Total Solved</h3>
          </div>
          <p className="text-3xl font-bold">{stats.completed}</p>
          <p className="text-sm text-muted-foreground mt-1">{stats.remaining} remaining</p>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <PieChart className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Completion %</h3>
          </div>
          <p className="text-3xl font-bold">{stats.completionPercentage}%</p>
          <p className="text-sm text-muted-foreground mt-1">of total {stats.total} questions</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">LeetCode</h3>
          </div>
          <p className="text-3xl font-bold">{stats.leetcodeCompleted}</p>
          <p className="text-sm text-muted-foreground mt-1">out of {stats.leetcodeTotal} mapped</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Longest Streak</h3>
          </div>
          <p className="text-3xl font-bold">{stats.longestStreak}</p>
          <p className="text-sm text-muted-foreground mt-1">Current: {stats.currentStreak}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold pt-4">Topic Statistics</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoryStats.map(cat => (
          <div key={cat.name} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold uppercase tracking-wider text-sm">{cat.name}</h3>
              <span className="text-sm font-medium">{cat.completed} / {cat.total}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${(cat.completed / cat.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
