import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrackerStore } from '../store/useTrackerStore';
import type { Problem } from '../store/useTrackerStore';
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  MessageSquare, 
  Search, 
  ArrowUpRight,
  Filter,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ProblemModal } from '../components/ProblemModal';

export function Problems() {
  const { problems, toggleCompletion, toggleRevision } = useTrackerStore();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [leetcodeFilter, setLeetcodeFilter] = useState('All');
  const [revisionFilter, setRevisionFilter] = useState('All');
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);

  const handleRowClick = (problem: Problem) => {
    navigate(`/problem/${problem.id}`);
  };

  const categories = ['All', ...Array.from(new Set(problems.map(p => p.category)))];

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      // Search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        p.title.toLowerCase().includes(searchLower) ||
        p.id.toString().includes(searchLower) ||
        (p.leetcodeNumber?.toString().includes(searchLower)) ||
        p.category.toLowerCase().includes(searchLower) ||
        p.difficulty.toLowerCase().includes(searchLower) ||
        p.notes.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Category filter
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;

      // Difficulty filter
      if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) return false;

      // Status filter
      if (statusFilter === 'Completed' && !p.completed) return false;
      if (statusFilter === 'Not Completed' && p.completed) return false;

      // LeetCode filter
      if (leetcodeFilter === 'Has LeetCode' && p.leetcodeNumber === null) return false;
      if (leetcodeFilter === 'N/A' && p.leetcodeNumber !== null) return false;

      // Revision filter
      if (revisionFilter === 'Needs Revision' && !p.needsRevision) return false;
      if (revisionFilter === 'No Revision' && p.needsRevision) return false;

      return true;
    });
  }, [problems, searchQuery, categoryFilter, difficultyFilter, statusFilter, leetcodeFilter, revisionFilter]);

  const solvedCount = problems.filter(p => p.completed).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">TCS NQT Problem Set</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Master the 100 core problems. Currently solved <strong className="text-foreground">{solvedCount}</strong> of <strong>{problems.length}</strong>.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-border/80 bg-card py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            placeholder="Search problems, topics, #id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {categories.map((cat) => {
          const count = cat === 'All' ? problems.length : problems.filter(p => p.category === cat).length;
          const isSelected = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{cat}</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card border border-border/80 rounded-2xl shadow-xs">
        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            Level:
          </span>
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                difficultyFilter === diff
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {diff === 'Medium' ? 'Med.' : diff}
            </button>
          ))}
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select 
            className="rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground focus:border-primary focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Not Completed">To Do</option>
          </select>

          {/* LeetCode Filter */}
          <select 
            className="rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground focus:border-primary focus:outline-none"
            value={leetcodeFilter}
            onChange={(e) => setLeetcodeFilter(e.target.value)}
          >
            <option value="All">All Sources</option>
            <option value="Has LeetCode">LeetCode Mapped</option>
            <option value="N/A">Custom Sheets</option>
          </select>

          {/* Revision Filter */}
          <select 
            className="rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground focus:border-primary focus:outline-none"
            value={revisionFilter}
            onChange={(e) => setRevisionFilter(e.target.value)}
          >
            <option value="All">All Revisions</option>
            <option value="Needs Revision">Needs Revision</option>
            <option value="No Revision">No Revision</option>
          </select>
        </div>
      </div>

      {/* Problem Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">Status</th>
                <th className="px-3 py-3.5 w-14 font-mono">#</th>
                <th className="px-4 py-3.5 min-w-[280px]">Problem Title</th>
                <th className="px-4 py-3.5 w-28">Difficulty</th>
                <th className="px-4 py-3.5 w-32">Topic</th>
                <th className="px-4 py-3.5 w-28">LeetCode</th>
                <th className="px-4 py-3.5 w-20 text-center">Revise</th>
                <th className="px-4 py-3.5 w-24 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <p className="text-base font-semibold">No problems match your filters.</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">Try clearing some search criteria or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredProblems.map((problem) => (
                  <tr 
                    key={problem.id} 
                    className={cn(
                      "group transition-colors hover:bg-muted/40 cursor-pointer",
                      problem.completed && "bg-emerald-500/5 hover:bg-emerald-500/10"
                    )}
                    onClick={() => handleRowClick(problem)}
                  >
                    {/* Status Checkbox */}
                    <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => toggleCompletion(problem.id)}
                        className="inline-flex items-center justify-center text-muted-foreground hover:scale-110 transition-transform"
                      >
                        {problem.completed ? (
                          <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/40 hover:border-emerald-500 transition-colors" />
                        )}
                      </button>
                    </td>

                    {/* ID */}
                    <td className="px-3 py-3.5 text-xs font-mono font-bold text-muted-foreground">
                      #{problem.id}
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-semibold transition-colors",
                          problem.completed ? "text-muted-foreground line-through opacity-80" : "text-foreground group-hover:text-primary"
                        )}>
                          {problem.title}
                        </span>
                        {problem.notes.length > 0 && (
                          <span title="Has notes">
                            <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Difficulty Badge */}
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight",
                        problem.difficulty === 'Easy' && "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                        problem.difficulty === 'Medium' && "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                        problem.difficulty === 'Hard' && "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      )}>
                        {problem.difficulty}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {problem.category}
                      </span>
                    </td>

                    {/* LeetCode Match */}
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      {problem.leetcodeNumber ? (
                        <a 
                          href={problem.leetcodeUrl!} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-500 hover:bg-orange-500/20 transition-colors"
                        >
                          #{problem.leetcodeNumber}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/60 text-xs font-mono">—</span>
                      )}
                    </td>

                    {/* Revision Checkbox */}
                    <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={problem.needsRevision}
                        onChange={() => toggleRevision(problem.id)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        title="Mark for revision"
                      />
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                        Solve
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
