import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrackerStore } from '../store/useTrackerStore';
import { CheckCircle2, Circle, ExternalLink, MessageSquare, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProblemModal } from '../components/ProblemModal';
import { format, parseISO } from 'date-fns';
import type { Problem } from '../store/useTrackerStore';

export function Revision() {
  const { problems, toggleCompletion, addRevisionRecord } = useTrackerStore();
  const navigate = useNavigate();
  
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);

  const revisionProblems = problems.filter(p => p.needsRevision);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revision</h1>
          <p className="text-muted-foreground mt-1">
            {revisionProblems.length} problems marked for revision.
          </p>
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
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-center">Revisions</th>
                <th className="px-4 py-3 font-medium w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {revisionProblems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-success/50" />
                    <p>You're all caught up! No problems need revision.</p>
                  </td>
                </tr>
              ) : (
                revisionProblems.map((problem) => (
                  <tr 
                    key={problem.id} 
                    className="transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      if (problem.leetcodeUrl) {
                        setSelectedProblemId(problem.id);
                      } else {
                        navigate(`/problem/${problem.id}`);
                      }
                    }}
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
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {problem.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                        <History className="h-4 w-4" />
                        <span>{problem.revisionHistory.length}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => addRevisionRecord(problem.id)}
                        className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
                      >
                        Mark Revised
                      </button>
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
