import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Play, 
  Plus, 
  RotateCcw, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Code2, 
  FileText, 
  Loader2, 
  CheckCircle2,
  XCircle,
  Copy,
  FastForward
} from 'lucide-react';
import { useTrackerStore } from '../store/useTrackerStore';
import type { NotebookCell } from '../store/useTrackerStore';
import { cn } from '../lib/utils';

interface JupyterNotebookProps {
  problemId: number;
  initialCode?: string;
  pyodideRef: React.MutableRefObject<any>;
  pyodideReady: boolean;
  onCodeChange?: (fullCode: string) => void;
}

export function JupyterNotebook({
  problemId,
  initialCode,
  pyodideRef,
  pyodideReady,
  onCodeChange
}: JupyterNotebookProps) {
  const { savedNotebooks, saveNotebook } = useTrackerStore();

  const getDefaultCells = (): NotebookCell[] => {
    const codeStarter = initialCode || `def solve():\n    # Write your solution here\n    pass\n\nprint("Result:", solve())`;
    return [
      {
        id: 'cell-md-1',
        type: 'markdown',
        content: `### 📓 DSA Solution Notebook: Problem #${problemId}\nUse this interactive Jupyter notebook to experiment with test cases, break down algorithms, and test edge cases cell-by-cell.`
      },
      {
        id: 'cell-code-1',
        type: 'code',
        content: codeStarter,
        output: '',
        executionCount: null,
        status: 'idle'
      },
      {
        id: 'cell-code-2',
        type: 'code',
        content: `# Test your solution with custom inputs\nprint("Custom Test Run:")\n# solve()`,
        output: '',
        executionCount: null,
        status: 'idle'
      }
    ];
  };

  const [cells, setCells] = useState<NotebookCell[]>(() => {
    return savedNotebooks[problemId] && savedNotebooks[problemId].length > 0
      ? savedNotebooks[problemId]
      : getDefaultCells();
  });

  const [activeCellId, setActiveCellId] = useState<string>(cells[0]?.id || '');
  const [executionCounter, setExecutionCounter] = useState(1);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [editingMdId, setEditingMdId] = useState<string | null>(null);

  // Sync to store on change
  const updateCells = (newCells: NotebookCell[]) => {
    setCells(newCells);
    saveNotebook(problemId, newCells);
    
    // Also notify parent of the combined code of all code cells
    if (onCodeChange) {
      const allCode = newCells
        .filter(c => c.type === 'code')
        .map(c => c.content)
        .join('\n\n');
      onCodeChange(allCode);
    }
  };

  // Re-initialize when problemId changes
  useEffect(() => {
    if (savedNotebooks[problemId] && savedNotebooks[problemId].length > 0) {
      setCells(savedNotebooks[problemId]);
    } else {
      const defaults = getDefaultCells();
      setCells(defaults);
      saveNotebook(problemId, defaults);
    }
    setActiveCellId(cells[0]?.id || '');
  }, [problemId]);

  // Execute a single cell in Pyodide
  const executeCell = async (cellId: string) => {
    if (!pyodideReady || !pyodideRef.current) return;

    const cellIndex = cells.findIndex(c => c.id === cellId);
    if (cellIndex === -1 || cells[cellIndex].type !== 'code') return;

    const targetCell = cells[cellIndex];
    
    // Set cell status to running
    const runningCells = [...cells];
    runningCells[cellIndex] = { ...targetCell, status: 'running', output: 'Running...' };
    updateCells(runningCells);

    const count = executionCounter;
    setExecutionCounter(prev => prev + 1);

    try {
      let stdoutBuffer = '';
      pyodideRef.current.setStdout({ batched: (msg: string) => {
        stdoutBuffer += msg + '\n';
      }});
      pyodideRef.current.setStderr({ batched: (msg: string) => {
        stdoutBuffer += '[Error] ' + msg + '\n';
      }});

      // Run Python code in shared Pyodide scope
      const evalResult = await pyodideRef.current.runPythonAsync(targetCell.content);
      
      let finalOutput = stdoutBuffer.trim();
      if (evalResult !== undefined && evalResult !== null) {
        const repr = String(evalResult);
        if (repr !== 'None' && repr !== '') {
          finalOutput = finalOutput ? `${finalOutput}\nOut [${count}]: ${repr}` : `Out [${count}]: ${repr}`;
        }
      }

      if (!finalOutput) {
        finalOutput = 'Cell executed successfully (no output).';
      }

      const updated = [...cells];
      updated[cellIndex] = {
        ...targetCell,
        status: 'success',
        output: finalOutput,
        executionCount: count
      };
      updateCells(updated);
    } catch (err: any) {
      const updated = [...cells];
      updated[cellIndex] = {
        ...targetCell,
        status: 'error',
        output: `Error:\n${err.message || String(err)}`,
        executionCount: count
      };
      updateCells(updated);
    }
  };

  // Run all code cells sequentially
  const runAllCells = async () => {
    if (!pyodideReady || !pyodideRef.current || isRunningAll) return;

    setIsRunningAll(true);
    const codeCells = cells.filter(c => c.type === 'code');
    
    for (const c of codeCells) {
      await executeCell(c.id);
    }
    setIsRunningAll(false);
  };

  // Cell manipulation helpers
  const addCell = (type: 'code' | 'markdown', afterId?: string) => {
    const newCell: NotebookCell = {
      id: `cell-${Date.now()}`,
      type,
      content: type === 'code' ? '# Write Python code here\n' : '### Notes / Observations\nWrite your thoughts here...',
      output: '',
      executionCount: null,
      status: 'idle'
    };

    if (!afterId) {
      updateCells([...cells, newCell]);
    } else {
      const idx = cells.findIndex(c => c.id === afterId);
      const updated = [...cells];
      updated.splice(idx + 1, 0, newCell);
      updateCells(updated);
    }
    setActiveCellId(newCell.id);
    if (type === 'markdown') {
      setEditingMdId(newCell.id);
    }
  };

  const deleteCell = (id: string) => {
    if (cells.length <= 1) {
      alert('Notebook must have at least one cell.');
      return;
    }
    const updated = cells.filter(c => c.id !== id);
    updateCells(updated);
    if (activeCellId === id) {
      setActiveCellId(updated[0]?.id || '');
    }
  };

  const moveCell = (id: string, direction: 'up' | 'down') => {
    const idx = cells.findIndex(c => c.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === cells.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...cells];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    updateCells(updated);
  };

  const updateCellContent = (id: string, content: string) => {
    const updated = cells.map(c => c.id === id ? { ...c, content } : c);
    updateCells(updated);
  };

  const clearAllOutputs = () => {
    const updated = cells.map(c => ({
      ...c,
      output: '',
      executionCount: null,
      status: 'idle' as const
    }));
    updateCells(updated);
    setExecutionCounter(1);
  };

  const restartKernel = async () => {
    if (confirm('Restart Python Kernel? All defined variables and memory will be cleared.')) {
      if (pyodideRef.current) {
        try {
          await pyodideRef.current.runPythonAsync(`
import sys
for name in list(globals().keys()):
    if not name.startswith('_') and name not in ('sys', 'os'):
        del globals()[name]
          `);
        } catch (e) {
          console.error(e);
        }
      }
      clearAllOutputs();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l border-border select-none">
      {/* Jupyter Top Action Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-md shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => addCell('code', activeCellId)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors"
            title="Add Code Cell"
          >
            <Plus className="h-3.5 w-3.5" />
            Code
          </button>
          
          <button
            onClick={() => addCell('markdown', activeCellId)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-bold transition-colors"
            title="Add Markdown Note Cell"
          >
            <Plus className="h-3.5 w-3.5" />
            Markdown
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          <button
            onClick={() => executeCell(activeCellId)}
            disabled={!pyodideReady}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold transition-colors disabled:opacity-50"
            title="Run Selected Cell (Shift+Enter)"
          >
            <Play className="h-3.5 w-3.5 fill-emerald-500" />
            Run Cell
          </button>

          <button
            onClick={runAllCells}
            disabled={!pyodideReady || isRunningAll}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-bold transition-colors disabled:opacity-50"
            title="Run All Code Cells"
          >
            {isRunningAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FastForward className="h-3.5 w-3.5" />}
            Run All
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearAllOutputs}
            className="px-2 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            title="Clear all cell outputs"
          >
            Clear Outputs
          </button>

          <button
            onClick={restartKernel}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            title="Restart Python Kernel"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restart Kernel
          </button>

          <div className="flex items-center gap-1.5 pl-2 border-l border-border text-[11px] font-mono">
            <span className={cn(
              "h-2 w-2 rounded-full",
              pyodideReady ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
            )} />
            <span className="text-muted-foreground hidden sm:inline">
              {pyodideReady ? "Python 3.11 (Ready)" : "Loading Kernel..."}
            </span>
          </div>
        </div>
      </div>

      {/* Notebook Scrollable Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
        {cells.map((cell, index) => {
          const isActive = activeCellId === cell.id;

          return (
            <div
              key={cell.id}
              onClick={() => setActiveCellId(cell.id)}
              className={cn(
                "group relative rounded-2xl border transition-all duration-200 shadow-xs",
                isActive 
                  ? "border-primary/60 ring-2 ring-primary/15 bg-card" 
                  : "border-border/80 bg-card hover:border-border"
              )}
            >
              {/* Cell Header / Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/20 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-muted-foreground/80 font-mono">
                    {cell.type === 'code' ? (
                      <span>In [{cell.executionCount !== null && cell.executionCount !== undefined ? cell.executionCount : ' '}]:</span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <FileText className="h-3 w-3" /> Markdown
                      </span>
                    )}
                  </span>
                  {cell.status === 'running' && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                      <Loader2 className="h-3 w-3 animate-spin" /> Executing...
                    </span>
                  )}
                </div>

                {/* Cell Mini Controls */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {cell.type === 'code' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        executeCell(cell.id);
                      }}
                      disabled={!pyodideReady || cell.status === 'running'}
                      className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-500 transition-colors"
                      title="Run Cell"
                    >
                      <Play className="h-3.5 w-3.5 fill-emerald-500" />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveCell(cell.id, 'up');
                    }}
                    disabled={index === 0}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                    title="Move Cell Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveCell(cell.id, 'down');
                    }}
                    disabled={index === cells.length - 1}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                    title="Move Cell Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCell(cell.id);
                    }}
                    className="p-1 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                    title="Delete Cell"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Cell Body */}
              <div className="p-3 sm:p-4">
                {cell.type === 'code' ? (
                  <div 
                    className="rounded-xl overflow-hidden border border-border/50 bg-[#1e1e1e]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        executeCell(cell.id);
                      }
                    }}
                  >
                    <Editor
                      height={Math.max(80, Math.min(400, (cell.content.split('\n').length + 1) * 22)) + 'px'}
                      language="python"
                      theme="vs-dark"
                      value={cell.content}
                      onChange={(val) => updateCellContent(cell.id, val || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineHeight: 22,
                        scrollBeyondLastLine: false,
                        overviewRulerBorder: false,
                        renderLineHighlight: 'none',
                        scrollbar: { vertical: 'hidden', horizontal: 'auto' },
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: false
                      }}
                    />
                  </div>
                ) : (
                  // Markdown Cell
                  editingMdId === cell.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={cell.content}
                        onChange={(e) => updateCellContent(cell.id, e.target.value)}
                        onBlur={() => setEditingMdId(null)}
                        autoFocus
                        rows={Math.max(3, cell.content.split('\n').length + 1)}
                        className="w-full bg-muted/20 border border-border rounded-xl p-3 font-mono text-sm resize-none focus:outline-none focus:border-primary transition-colors custom-scrollbar"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => setEditingMdId(null)}
                          className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                        >
                          Done Editing
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onDoubleClick={() => setEditingMdId(cell.id)}
                      className="cursor-pointer prose prose-sm dark:prose-invert max-w-none p-2 rounded-lg hover:bg-muted/30 transition-colors"
                      title="Double-click to edit markdown"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {cell.content || '_Empty markdown cell. Double-click to edit._'}
                      </ReactMarkdown>
                    </div>
                  )
                )}

                {/* Cell Output Area (if code cell and has output) */}
                {cell.type === 'code' && cell.output && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        {cell.status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                        {cell.status === 'error' && <XCircle className="h-3.5 w-3.5 text-rose-500" />}
                        <span>Out [{cell.executionCount || ' '}]:</span>
                      </span>
                      <button
                        onClick={() => {
                          const updated = cells.map(c => c.id === cell.id ? { ...c, output: '' } : c);
                          updateCells(updated);
                        }}
                        className="hover:text-foreground text-[10px]"
                      >
                        Clear
                      </button>
                    </div>
                    <pre className={cn(
                      "p-3 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap custom-scrollbar",
                      cell.status === 'error' 
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                        : "bg-muted/40 text-foreground border border-border/50"
                    )}>
                      {cell.output}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Bottom Add Cell Quick Bar */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <button
            onClick={() => addCell('code')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-border hover:border-primary text-xs font-bold text-muted-foreground hover:text-primary transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Code Cell
          </button>
          <button
            onClick={() => addCell('markdown')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-border hover:border-primary text-xs font-bold text-muted-foreground hover:text-primary transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Markdown Cell
          </button>
        </div>
      </div>
    </div>
  );
}
