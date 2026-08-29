import { useTrackerStore } from '../store/useTrackerStore';
import { calculateStats } from '../lib/stats';
import { Link } from 'react-router-dom';
import { Target, Flame, Trophy, Activity, Circle, ArrowRight } from 'lucide-react';
import { LeetCodeProgressCard } from '../components/LeetCodeProgressCard';

export function Dashboard() {
  const { problems, dailyTarget } = useTrackerStore();
  const stats = calculateStats(problems, dailyTarget);

  const nextProblem = problems.find(p => !p.completed);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Good morning 👋</h1>
        <p className="text-muted-foreground mt-2">Here is your DSA Progress overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Progress</p>
              <h2 className="text-2xl font-bold">{stats.completed} / {stats.total}</h2>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{stats.remaining} Remaining</span>
            <span className="font-bold text-success">{stats.completionPercentage}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className="h-full bg-success transition-all duration-500 ease-in-out" 
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <Target className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Progress</p>
              <h2 className="text-2xl font-bold">{stats.completedTodayCount} / {dailyTarget}</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {stats.completedTodayCount >= dailyTarget 
              ? "Target achieved! 🎉" 
              : `${dailyTarget - stats.completedTodayCount} more to go`}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-orange-500/10 p-3">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
              <h2 className="text-2xl font-bold">{stats.currentStreak} days</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Keep it up! 🔥</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-yellow-500/10 p-3">
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Longest Streak</p>
              <h2 className="text-2xl font-bold">{stats.longestStreak} days</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Your personal best</p>
        </div>
      </div>

      {/* LeetCode Difficulty & Overview Section */}
      <div className="grid gap-4 md:grid-cols-2">
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

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold mb-3">LeetCode Matches</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-muted-foreground">LeetCode Mapped Problems</span>
                  <span className="font-bold">{stats.leetcodeCompleted} / {stats.leetcodeTotal}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-500" 
                    style={{ width: `${stats.leetcodeTotal === 0 ? 0 : (stats.leetcodeCompleted / stats.leetcodeTotal) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-muted-foreground">Custom / Non-LeetCode Problems</span>
                  <span className="font-bold">{stats.naCompleted} / {stats.naTotal}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500" 
                    style={{ width: `${stats.naTotal === 0 ? 0 : (stats.naCompleted / stats.naTotal) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {nextProblem && (
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate mr-3">
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium truncate">
                  Next: #{nextProblem.id} {nextProblem.title}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                  nextProblem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                  nextProblem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {nextProblem.difficulty}
                </span>
              </div>
              <Link 
                to={`/problem/${nextProblem.id}`} 
                className="inline-flex items-center gap-1 shrink-0 rounded-md bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold transition-colors"
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
