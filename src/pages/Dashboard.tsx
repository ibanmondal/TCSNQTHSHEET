import { useTrackerStore } from '../store/useTrackerStore';
import { calculateStats } from '../lib/stats';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Flame, 
  Trophy, 
  Activity, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  Zap,
  Code2,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { LeetCodeProgressCard } from '../components/LeetCodeProgressCard';
import { TimelineGoalCard } from '../components/TimelineGoalCard';

export function Dashboard() {
  const { problems, dailyTarget } = useTrackerStore();
  const stats = calculateStats(problems, dailyTarget);

  const nextProblem = problems.find(p => !p.completed);

  // Category breakdowns
  const categories = Array.from(new Set(problems.map(p => p.category)));
  const categoryStats = categories.map(cat => {
    const total = problems.filter(p => p.category === cat).length;
    const completed = problems.filter(p => p.category === cat && p.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { name: cat, total, completed, percentage };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-indigo-950/30">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>TCS NQT 2026 Preparation</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, Coder 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              You've solved <strong className="text-emerald-400 font-bold">{stats.completed}</strong> out of <strong>{stats.total}</strong> top curated problems. Keep the momentum going!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {nextProblem && (
              <Link
                to={`/problem/${nextProblem.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="h-4 w-4 fill-white" />
                Resume Next Problem
              </Link>
            )}
            <Link
              to="/problems"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all"
            >
              Browse All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Modern Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Progress */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Solved
            </span>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{stats.completed}</span>
            <span className="text-sm font-semibold text-muted-foreground">/ {stats.total}</span>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">{stats.remaining} Remaining</span>
              <span className="font-bold text-indigo-500">{stats.completionPercentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full" 
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Today's Goal */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today's Goal
            </span>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{stats.completedTodayCount}</span>
            <span className="text-sm font-semibold text-muted-foreground">/ {dailyTarget}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              {stats.completedTodayCount >= dailyTarget ? "Goal Achieved! 🎉" : `${dailyTarget - stats.completedTodayCount} more today`}
            </span>
            <span className="font-bold text-blue-500">
              {Math.min(100, Math.round((stats.completedTodayCount / dailyTarget) * 100))}%
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className="h-full bg-blue-500 transition-all duration-500 rounded-full" 
              style={{ width: `${Math.min(100, (stats.completedTodayCount / dailyTarget) * 100)}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Streak
            </span>
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
              <Flame className="h-5 w-5 fill-orange-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{stats.currentStreak}</span>
            <span className="text-sm font-semibold text-muted-foreground">days</span>
          </div>
          <p className="mt-4 text-xs font-medium text-muted-foreground flex items-center gap-1">
            {stats.currentStreak > 0 ? "🔥 Consistency is key!" : "Solve a problem to start streak!"}
          </p>
        </div>

        {/* Longest Streak */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Best Streak
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{stats.longestStreak}</span>
            <span className="text-sm font-semibold text-muted-foreground">days</span>
          </div>
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Personal best record 🏆
          </p>
        </div>
      </div>

      {/* Target Timeline Goal Bar Card */}
      <TimelineGoalCard />

      {/* LeetCode Difficulty Solved Card & Mapped Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <LeetCodeProgressCard
          total={stats.total}
          completed={stats.completed}
          easyTotal={stats.easyTotal}
          easyCompleted={stats.easyCompleted}
          mediumTotal={stats.mediumTotal}
          mediumCompleted={stats.mediumCompleted}
          hardTotal={stats.hardTotal}
          hardCompleted={stats.hardCompleted}
          attemptingCount={stats.attemptingCount}
        />

        {/* Category Breakdown Overview */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Topic Mastery
              </h3>
              <Link to="/problems" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {categoryStats.map(cat => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-foreground font-semibold">{cat.name}</span>
                    <span className="text-muted-foreground font-mono">{cat.completed} / {cat.total} ({cat.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {nextProblem && (
            <div className="pt-4 mt-4 border-t border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate mr-3">
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium truncate">
                  Next: #{nextProblem.id} {nextProblem.title}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  nextProblem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                  nextProblem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {nextProblem.difficulty}
                </span>
              </div>
              <Link 
                to={`/problem/${nextProblem.id}`} 
                className="inline-flex items-center gap-1.5 shrink-0 rounded-xl bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Solve
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
