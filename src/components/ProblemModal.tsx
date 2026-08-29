import { useState, useEffect } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import type { Problem } from '../store/useTrackerStore';
import { X, ExternalLink, CheckCircle2, Circle, Clock, History } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ProblemModalProps {
  problemId: number;
  onClose: () => void;
}

export function ProblemModal({ problemId, onClose }: ProblemModalProps) {
  const { problems, toggleCompletion, toggleRevision, addRevisionRecord, updateNotes } = useTrackerStore();
  
  const problem = problems.find(p => p.id === problemId);
  const [localNotes, setLocalNotes] = useState('');

  useEffect(() => {
    if (problem) {
      setLocalNotes(problem.notes);
    }
  }, [problem]);

  if (!problem) return null;

  const handleSaveNotes = () => {
    updateNotes(problem.id, localNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-medium">#{problem.id}</span>
            <h2 className="text-lg font-bold">{problem.title}</h2>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Difficulty</p>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                'bg-red-500/10 text-red-500'
              }`}>
                {problem.difficulty}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                {problem.category}
              </span>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">LeetCode Match</p>
              {problem.leetcodeNumber ? (
                <a 
                  href={problem.leetcodeUrl!} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-600 hover:bg-orange-500/20 dark:text-orange-400"
                >
                  #{problem.leetcodeNumber} {problem.leetcodeTitle}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">N/A — No matching LeetCode problem</span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Status
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleCompletion(problem.id)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {problem.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground hover:text-success transition-colors" />
                  )}
                  {problem.completed ? 'Completed' : 'Mark as Completed'}
                </button>
              </div>
              
              {problem.completedDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Completed on {format(parseISO(problem.completedDate), 'MMM d, yyyy')}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="checkbox"
                  checked={problem.needsRevision}
                  onChange={() => toggleRevision(problem.id)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Needs Revision
              </label>
              
              {problem.needsRevision && (
                <button 
                  onClick={() => addRevisionRecord(problem.id)}
                  className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90 transition-opacity"
                >
                  I've Revised This
                </button>
              )}
            </div>
            
            {problem.revisionHistory.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground mb-2">
                  <History className="h-3.5 w-3.5" />
                  Revision History
                </p>
                <div className="flex flex-wrap gap-2">
                  {problem.revisionHistory.map((rec, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                      Rev {i + 1}: {format(parseISO(rec.date), 'MMM d')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Personal Notes</h3>
            <textarea 
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="e.g. 'Use hashmap', 'Two pointer approach'"
              className="w-full min-h-[120px] rounded-md border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
            />
            <p className="text-xs text-muted-foreground text-right">Notes are saved automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
