import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrackerStore } from '../store/useTrackerStore';
import type { Problem } from '../store/useTrackerStore';
import { CheckCircle2, Circle, ExternalLink, MessageSquare, Search } from 'lucide-react';
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
    if (problem.leetcodeUrl) {
      setSelectedProblemId(problem.id);
    } else {
      navigate(`/problem/${problem.id}`);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
        
        <div className="relative w-full sm:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-card border border-border rounded-lg">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <select 
            className="block w-full min-w-[140px] rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
          <select 
            className="block w-full min-w-[140px] rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <select 
            className="block w-full min-w-[140px] rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Completed">Completed</option>
            <option value="Not Completed">Not Completed</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">LeetCode</label>
          <select 
            className="block w-full min-w-[140px] rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
            value={leetcodeFilter}
            onChange={(e) => setLeetcodeFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Has LeetCode">Has LeetCode</option>
            <option value="N/A">N/A</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Revision</label>
          <select 
            className="block w-full min-w-[140px] rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
            value={revisionFilter}
            onChange={(e) => setRevisionFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Needs Revision">Needs Revision</option>
            <option value="No Revision">No Revision</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium w-12">Status</th>
                <th className="px-4 py-3 font-medium w-16">#</th>
                <th className="px-4 py-3 font-medium min-w-[250px]">Problem</th>
                <th className="px-4 py-3 font-medium">Difficulty</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">LeetCode</th>
                <th className="px-4 py-3 font-medium w-24 text-center">Revision</th>
                <th className="px-4 py-3 font-medium w-16 text-center">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No problems found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProblems.map((problem) => (
                  <tr 
                    key={problem.id} 
                    className={cn(
                      "transition-colors hover:bg-muted/50 cursor-pointer",
                      problem.completed && "bg-success/5"
                    )}
                    onClick={() => handleRowClick(problem)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => toggleCompletion(problem.id)}
                        className="text-muted-foreground hover:text-success transition-colors"
                      >
                        {problem.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{problem.id}</td>
                    <td className="px-4 py-3 font-medium">{problem.title}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                        problem.difficulty === 'Easy' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        problem.difficulty === 'Medium' && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        problem.difficulty === 'Hard' && "bg-red-500/10 text-red-600 dark:text-red-400"
                      )}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {problem.category}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {problem.leetcodeNumber ? (
                        <a 
                          href={problem.leetcodeUrl!} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-500/20 dark:text-orange-400"
                        >
                          #{problem.leetcodeNumber}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={problem.needsRevision}
                        onChange={() => toggleRevision(problem.id)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {problem.notes.length > 0 ? (
                        <MessageSquare className="h-4 w-4 mx-auto text-primary" />
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
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
