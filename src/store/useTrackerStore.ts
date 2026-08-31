import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { masterProblemList } from '../data/problems';
import type { Difficulty } from '../data/problems';

export type { Difficulty };

export interface RevisionRecord {
  date: string; // ISO string
}

export interface Problem {
  id: number;
  title: string;
  category: string;
  difficulty: Difficulty;
  leetcodeNumber: number | null;
  leetcodeTitle: string | null;
  leetcodeUrl: string | null;
  completed: boolean;
  completedDate: string | null; // ISO string
  needsRevision: boolean;
  revisionHistory: RevisionRecord[];
  notes: string;
  savedCode?: string;
}

export interface NotebookCell {
  id: string;
  type: 'code' | 'markdown';
  content: string;
  output?: string;
  executionCount?: number | null;
  status?: 'idle' | 'running' | 'success' | 'error';
}

interface TrackerState {
  problems: Problem[];
  dailyTarget: number;
  targetTimelineDays: number;
  timelineStartDate: string;
  theme: 'dark' | 'light';
  groqApiKey: string;
  aiCache: Record<number, string>;
  importProblems: (problems: Problem[]) => void;
  toggleCompletion: (id: number) => void;
  toggleRevision: (id: number) => void;
  addRevisionRecord: (id: number) => void;
  updateNotes: (id: number, notes: string) => void;
  saveCode: (id: number, code: string) => void;
  savedNotebooks: Record<number, NotebookCell[]>;
  saveNotebook: (problemId: number, cells: NotebookCell[]) => void;
  setDailyTarget: (target: number) => void;
  setTargetTimeline: (days: number, startDate?: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setGroqApiKey: (key: string) => void;
  saveAiIntuition: (problemId: number, intuition: string) => void;
  globalScratchpad: string;
  setGlobalScratchpad: (val: string) => void;
  generatedProblems: Record<number, { description: string, boilerplate: string, testScript: string }>;
  saveGeneratedProblem: (problemId: number, data: { description: string, boilerplate: string, testScript: string }) => void;
  resetProgress: () => void;
}

const initializeProblems = (): Problem[] => {
  return masterProblemList.map(p => ({
    ...p,
    completed: false,
    completedDate: null,
    needsRevision: false,
    revisionHistory: [],
    notes: ''
  }));
};

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      problems: initializeProblems(),
      dailyTarget: 3,
      targetTimelineDays: 30,
      timelineStartDate: new Date().toISOString(),
      theme: 'dark',
      groqApiKey: '',
      aiCache: {},
      globalScratchpad: '',
      generatedProblems: {},
      savedNotebooks: {},
      
      saveNotebook: (problemId, cells) =>
        set((state) => ({
          savedNotebooks: { ...state.savedNotebooks, [problemId]: cells }
        })),
      
      setTargetTimeline: (days, startDate) =>
        set((state) => ({
          targetTimelineDays: days,
          timelineStartDate: startDate || state.timelineStartDate || new Date().toISOString()
        })),
      
      importProblems: (newProblems) => 
        set((state) => {
          // Keep existing progress if problem IDs match, otherwise insert new ones
          const existingMap = new Map(state.problems.map(p => [p.id, p]));
          const merged = newProblems.map(np => {
            const ep = existingMap.get(np.id);
            if (ep) {
              return { 
                ...np, 
                completed: ep.completed ?? false, 
                completedDate: ep.completedDate ?? null, 
                needsRevision: ep.needsRevision ?? false, 
                revisionHistory: ep.revisionHistory ?? [],
                notes: ep.notes ?? '',
                savedCode: ep.savedCode
              };
            }
            return np;
          });
          return { problems: merged };
        }),

      toggleCompletion: (id) => 
        set((state) => ({
          problems: state.problems.map(p => {
            if (p.id === id) {
              const isNowCompleted = !p.completed;
              return {
                ...p,
                completed: isNowCompleted,
                completedDate: isNowCompleted ? new Date().toISOString() : null
              };
            }
            return p;
          })
        })),

      toggleRevision: (id) =>
        set((state) => ({
          problems: state.problems.map(p => p.id === id ? { ...p, needsRevision: !p.needsRevision } : p)
        })),

      addRevisionRecord: (id) =>
        set((state) => ({
          problems: state.problems.map(p => p.id === id ? { 
            ...p, 
            needsRevision: false, // Turn off flag when we actually revise it
            revisionHistory: [...p.revisionHistory, { date: new Date().toISOString() }] 
          } : p)
        })),

      updateNotes: (id, notes) =>
        set((state) => ({
          problems: state.problems.map(p => p.id === id ? { ...p, notes } : p)
        })),

      saveCode: (id, code) =>
        set((state) => ({
          problems: state.problems.map(p => p.id === id ? { ...p, savedCode: code } : p)
        })),

      setDailyTarget: (target) => set({ dailyTarget: target }),
      setTheme: (theme) => set({ theme }),
      resetProgress: () => set((state) => ({
        problems: state.problems.map(p => ({ 
          ...p, 
          completed: false, 
          completedDate: null, 
          needsRevision: false, 
          revisionHistory: [],
          notes: '' 
        }))
      })),
        
      setGroqApiKey: (key) => set({ groqApiKey: key }),
      
      saveAiIntuition: (problemId, intuition) => 
        set((state) => ({
          aiCache: { ...state.aiCache, [problemId]: intuition }
        })),
        
      setGlobalScratchpad: (val) => set({ globalScratchpad: val }),
        
      saveGeneratedProblem: (problemId, data) =>
        set((state) => ({
          generatedProblems: { ...state.generatedProblems, [problemId]: data }
        })),
    }),
    {
      name: 'dsa-tracker-storage',
      // If schema changes or we want to ensure new master list items are added when existing localStorage exists:
      merge: (persistedState: any, currentState: TrackerState) => {
        if (!persistedState || !persistedState.problems) return { ...currentState, ...persistedState };
        
        // Merge the master list with persisted progress so new questions from code are picked up
        const persistedMap = new Map(persistedState.problems.map((p: any) => [p.id, p]));
        const mergedProblems = currentState.problems.map(cp => {
          const pp: any = persistedMap.get(cp.id);
          if (pp) {
            return {
              ...cp,
              completed: pp.completed ?? false,
              completedDate: pp.completedDate ?? null,
              needsRevision: pp.needsRevision ?? false,
              revisionHistory: pp.revisionHistory ?? [],
              notes: pp.notes ?? '',
              savedCode: pp.savedCode
            };
          }
          return cp;
        });

        return {
          ...currentState,
          ...persistedState,
          problems: mergedProblems
        };
      }
    }
  )
);
